/**
 * Polls a Firefly async job until completion and returns the generated image URL.
 * @param {string} jobId - The job ID to poll.
 * @param {string} accessToken - The access token for API calls.
 * @returns {Promise<string>} - The generated image URL.
 */
async function pollJobCompletion(jobId: string, accessToken: string): Promise<string> {
  const maxAttempts = 30; // 5 minutes max (10 seconds * 30)
  const pollInterval = 10000; // 10 seconds

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`[v0] Polling job ${jobId}, attempt ${attempt}/${maxAttempts}`);
      
      const response = await fetch(fireflyConfig.JOB_STATUS_URL(jobId), {
        method: "GET",
        headers: {
          "x-api-key": credentials.CLIENT_ID,
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Job status check failed (${response.status}): ${errorText}`);
      }

      const jobData = await response.json();
      console.log(`[v0] Job ${jobId} status:`, jobData.status);

      if (jobData.status === "completed") {
        if (jobData.outputs && jobData.outputs.length > 0) {
          const imageUrl = jobData.outputs[0].image.url;
          console.log("[v0] Custom model image generated successfully:", imageUrl);
          return imageUrl;
        } else {
          throw new Error("Job completed but no image URL found");
        }
      } else if (jobData.status === "failed") {
        throw new Error(`Job failed: ${jobData.error || "Unknown error"}`);
      } else if (jobData.status === "running" || jobData.status === "pending") {
        if (attempt < maxAttempts) {
          console.log(`[v0] Job still ${jobData.status}, waiting ${pollInterval/1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, pollInterval));
        }
      } else {
        throw new Error(`Unknown job status: ${jobData.status}`);
      }
    } catch (error) {
      console.error(`[v0] Error polling job ${jobId}:`, error);
      if (attempt === maxAttempts) {
        throw error;
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
  }

  throw new Error(`Job ${jobId} did not complete within ${maxAttempts * pollInterval / 1000} seconds`);
}

/**
 * Uploads an image to Adobe Firefly and returns the image ID for use in compositing.
 * @param {string} imageUrl - The URL of the image to upload.
 * @returns {Promise<string>} - The Firefly image ID.
 */
export async function uploadImageToFirefly(imageUrl: string): Promise<string> {
  try {
    console.log("[v0] Uploading image to Firefly:", imageUrl);
    const accessToken = await getAccessToken();

    // First, fetch the image from the URL
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image from URL: ${imageResponse.status}`);
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get('content-type') || 'image/png';

    // Upload to Firefly
    const uploadResponse = await fetch(fireflyConfig.GENERATE_IMAGE_UPLOAD_URL, {
      method: "POST",
      headers: {
        "Content-Type": contentType,
        "x-api-key": credentials.CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
      body: imageBuffer,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Firefly upload error (${uploadResponse.status}): ${errorText}`);
    }

    const uploadData = await uploadResponse.json();
    if (!uploadData.id) {
      throw new Error("No image ID returned from Firefly upload");
    }

    console.log("[v0] Image uploaded successfully, ID:", uploadData.id);
    return uploadData.id;
  } catch (error) {
    console.error("[v0] Error uploading image to Firefly:", error);
    throw error;
  }
}

/**
 * Extracts the Firefly image ID from a generated image URL.
 * @param {string} imageUrl - The Firefly-generated image URL.
 * @returns {string|null} - The extracted image ID or null if not found.
 */
export function extractImageIdFromUrl(imageUrl: string): string | null {
  console.log("[v0] Attempting to extract image ID from URL:", imageUrl);
  
  // Try different URL patterns that Firefly might use
  const patterns = [
    // Standard Firefly patterns
    /\/images\/([a-zA-Z0-9_-]+)/,
    /\/v3\/images\/([a-zA-Z0-9_-]+)/,
    /\/v[0-9]+\/images\/([a-zA-Z0-9_-]+)/,
    
    // Query parameter patterns
    /id=([a-zA-Z0-9_-]+)/,
    /imageId=([a-zA-Z0-9_-]+)/,
    /image-id=([a-zA-Z0-9_-]+)/,
    
    // Path-based patterns
    /image-id\/([a-zA-Z0-9_-]+)/,
    /outputs\/([a-zA-Z0-9_-]+)/,
    
    // Generic patterns for cloud storage URLs
    /\/([a-zA-Z0-9_-]{20,})\./,  // Long alphanumeric strings before file extension
    /\/([a-zA-Z0-9_-]{32,})/,     // Very long strings (32+ chars)
  ];

  for (let i = 0; i < patterns.length; i++) {
    const pattern = patterns[i];
    const match = imageUrl.match(pattern);
    if (match && match[1]) {
      console.log(`[v0] Found image ID using pattern ${i}: ${match[1]}`);
      return match[1];
    }
  }

  console.warn("[v0] Could not extract image ID from URL:", imageUrl);
  console.warn("[v0] This means logo compositing will be skipped");
  return null;
}

/**
 * Composites a logo (foreground) onto a background image using Adobe Firefly Object Composite API.
 * @param {string} backgroundImageId - The Firefly image ID for the background.
 * @param {string} logoImageId - The Firefly image ID for the logo/foreground.
 * @param {string} [prompt] - Optional custom prompt for compositing.
 * @returns {Promise<string>} - The composited image URL.
 */
export async function compositeLogoWithImageIds(
  backgroundImageUrl: string,
  logoImageUrl: string,
  compositePrompt: string = "Professional coffee cup with logo placement"
): Promise<string> {
  console.log("[v0] Using working Adobe Firefly logo placement API format");
  
  const accessToken = await getAccessToken();
  
  // Use the exact format you specified for proper logo placement
  const requestBody = {
    prompt: "Professional coffee cup with clear, visible Starbucks logo embossed on the center",
    contentClass: "photo",
    image: {
      source: {
        url: backgroundImageUrl  // Generated coffee cup image
      }
    },
    placement: {
      alignment: {
        horizontal: "center",
        vertical: "center"
      }
    },
    style: {
      imageReference: {
        source: {
          url: logoImageUrl  // https://sbux-logo.s3.us-east-2.amazonaws.com/Starbucks_Corporation_Logo_.png
        }
      },
      strength: 90
    }
  };

  console.log("[v0] Logo placement request:", JSON.stringify(requestBody, null, 2));

  const response = await fetch(fireflyConfig.LOGO_PLACEMENT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": credentials.CLIENT_ID,
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Firefly logo placement error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  console.log("[v0] Logo placement response:", data);

  // Handle both sync and async responses
  if (data.outputs && data.outputs.length > 0 && data.outputs[0].image && data.outputs[0].image.url) {
    return data.outputs[0].image.url;
  } else if (data.jobId) {
    // If it's async, poll for completion
    const imageUrl = await checkFireflyJobStatus(data.jobId, accessToken);
    if (!imageUrl) {
      throw new Error("Logo placement job failed");
    }
    return imageUrl;
  }
  
  throw new Error("No logo placement image returned in response");
}

// Adobe Firefly API integration utilities
const fireflyConfig = require("./firefly-config.js")
import { getCupCoordinates, analyzeImageForCupPlacement, getDetailedCupPoints, type CupCoordinates, type DetailedCupPoints } from './openai-vision';
import { APP_CONFIG } from './config';

/**
 * CONFIRMED ARCHITECTURE:
 * 1. Coffee cup generation: generateDrinkImage() - ONE Firefly call to generate clean cup
 * 2. Logo composition: enhancedLogoCompositing() - ZERO Firefly calls, uses:
 *    - Logo from config (logoUrl parameter)
 *    - Coffee cup from step 1 (baseImageUrl parameter)
 *    - GPT-4 Vision for cup detection
 *    - Sharp for client-side image compositing
 *    - NO additional Firefly API calls
 */

/**
 * Cuts 4% from the bottom of detected cup height to focus on lower cup area (avoiding foam at top)
 */
// createTransparentLogo function moved to server-image-utils.ts (server-only)
// adjustForFoamLayer function moved to adobe-firefly-server.ts (server-only)

type AdobeCredentials = {
  ORG_ID: string
  CLIENT_ID: string
  CLIENT_SECRETS: string[]
  TECHNICAL_ACCOUNT_ID: string
  TECHNICAL_ACCOUNT_EMAIL: string
  SCOPES: string[]
}

const credentials: AdobeCredentials = {
  ORG_ID: process.env.ADOBE_ORG_ID || "",
  CLIENT_ID: process.env.ADOBE_CLIENT_ID || "",
  CLIENT_SECRETS: [process.env.ADOBE_CLIENT_SECRET || ""],
  TECHNICAL_ACCOUNT_ID: process.env.ADOBE_TECHNICAL_ACCOUNT_ID || "",
  TECHNICAL_ACCOUNT_EMAIL: process.env.ADOBE_TECHNICAL_ACCOUNT_EMAIL || "",
  SCOPES: (process.env.ADOBE_SCOPES ? process.env.ADOBE_SCOPES.split(",") : ["openid","AdobeID","firefly_api","ff_apis"]),
}


export async function getAccessToken(): Promise<string> {
  try {
  const response = await fetch(fireflyConfig.IMS_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: credentials.CLIENT_ID,
        client_secret: credentials.CLIENT_SECRETS[0],
        scope: credentials.SCOPES.join(","),
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Adobe IMS error response:", errorText)
      throw new Error(`Failed to get access token: ${response.statusText} | ${errorText}`)
    }

    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.error("[v0] Error getting Adobe access token:", error)
    if (error instanceof Error) {
      console.error("[v0] Access token error stack:", error.stack)
    }
    throw error
  }
}


export async function generateDrinkImage(prompt: string, negativePrompt?: string, useCustomModel: boolean = APP_CONFIG.USE_CUSTOM_MODEL): Promise<string> {
  try {
    console.log("[v0] Getting Adobe access token...")
    const accessToken = await getAccessToken()
    console.log("[v0] Access token obtained successfully")

    const requestBody: any = {
      prompt,
      numVariations: 1,
      size: {
        width: 1024,
        height: 1024,
      },
      style: {
        presets: ["photo"],
      },
    }

    // Add custom model configuration for coffee cup generation
    if (useCustomModel) {
      requestBody.customModelId = fireflyConfig.CUSTOM_MODEL.COFFEE_CUP_MODEL_ID;
      console.log("[v0] Using custom coffee cup model:", fireflyConfig.CUSTOM_MODEL.COFFEE_CUP_MODEL_ID);
    }

    // Add negative prompt if provided
    if (negativePrompt) {
      requestBody.negativePrompt = negativePrompt
      console.log("[v0] Using negative prompt:", negativePrompt)
    }

    console.log("[v0] Firefly prompt:", prompt)
    if (negativePrompt) {
      console.log("[v0] Firefly negative prompt:", negativePrompt)
    }
    console.log("[v0] Sending request to Firefly API with body:", JSON.stringify(requestBody, null, 2))

    // Use async endpoint for custom models, regular endpoint for standard generation
    const apiUrl = useCustomModel ? fireflyConfig.GENERATE_IMAGE_ASYNC_URL : fireflyConfig.GENERATE_IMAGE_URL;
    const headers: any = {
      "Content-Type": "application/json",
      "x-api-key": credentials.CLIENT_ID,
      Authorization: `Bearer ${accessToken}`,
    };

    // Add custom model version header when using custom model
    if (useCustomModel) {
      headers["x-model-version"] = fireflyConfig.CUSTOM_MODEL.MODEL_VERSION;
      console.log("[v0] Using async endpoint with custom model version:", fireflyConfig.CUSTOM_MODEL.MODEL_VERSION);
    }

    let response: Response | undefined
    try {
      response = await fetch(apiUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      })
    } catch (fetchError) {
      console.error("[v0] Firefly API fetch threw:", fetchError)
      if (fetchError instanceof Error) {
        console.error("[v0] Firefly fetch error stack:", fetchError.stack)
      }
      throw fetchError
    }

    console.log("[v0] Firefly API response status:", response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Firefly API error response:", errorText)
      
      // Provide more specific error messages for custom model issues
      if (useCustomModel) {
        if (response.status === 500) {
          throw new Error(`Custom model error (500): The custom model "${fireflyConfig.CUSTOM_MODEL.COFFEE_CUP_MODEL_ID}" may be unavailable or incorrectly configured. Details: ${errorText}`);
        } else if (response.status === 400) {
          throw new Error(`Custom model configuration error (400): Check model ID and parameters. Details: ${errorText}`);
        } else if (response.status === 403) {
          throw new Error(`Custom model access denied (403): You may not have permission to use this custom model. Details: ${errorText}`);
        }
      }
      
      throw new Error(`Firefly API error (${response.status}): ${errorText}`)
    }

    const data = await response.json()
    console.log("[v0] Firefly API response data:", JSON.stringify(data, null, 2))

    // Handle async response for custom models
    if (useCustomModel && data.jobId) {
      console.log("[v0] Custom model job submitted, polling for completion. Job ID:", data.jobId);
      return await pollJobCompletion(data.jobId, accessToken);
    }

    // Handle synchronous response for standard models
    if (data.outputs && data.outputs.length > 0) {
      const imageUrl = data.outputs[0].image.url
      console.log("[v0] Image generated successfully:", imageUrl)
      return imageUrl
    }

    throw new Error("No image generated in response")
  } catch (error) {
    console.error("[v0] Error generating drink image:", error)
    if (error instanceof Error) {
      console.error("[v0] Drink image error stack:", error.stack)
    }
    
    // If using custom model and it fails, automatically retry with standard model
    if (useCustomModel) {
      console.log("[v0] Custom model failed, retrying with standard Firefly model...");
      try {
        return await generateDrinkImage(prompt, negativePrompt, false);
      } catch (fallbackError) {
        console.error("[v0] Standard model fallback also failed:", fallbackError);
        throw new Error(`Both custom and standard models failed. Custom: ${error instanceof Error ? error.message : 'Unknown error'}. Standard: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`);
      }
    }
    
    throw error
  }
}


// [DEPRECATED] compositeLogoOnImage: Use compositeLogoWithImageIds for v3 Firefly object compositing with image IDs.

/**
 * Generates a drink image using standard Firefly model (bypasses custom model).
 * @param {string} prompt - The prompt for image generation.
 * @param {string} [negativePrompt] - Optional negative prompt.
 * @returns {Promise<string>} - The generated image URL.
 */
export async function generateDrinkImageStandard(prompt: string, negativePrompt?: string): Promise<string> {
  return generateDrinkImage(prompt, negativePrompt, false);
}

/**
 * Generates a drink image using custom coffee cup model.
 * @param {string} prompt - The prompt for image generation.
 * @param {string} [negativePrompt] - Optional negative prompt.
 * @returns {Promise<string>} - The generated image URL.
 */
export async function generateDrinkImageCustom(prompt: string, negativePrompt?: string): Promise<string> {
  return generateDrinkImage(prompt, negativePrompt, true);
}

/**
 * Generates a drink image with logo compositing in a single call.
 * @param {any} config - The drink configuration.
 * @param {string} logoUrl - The URL of the logo to composite.
 * @param {any} [allProducts] - All available products for negative prompts.
 * @returns {Promise<{imageUrl: string, prompt: string, negativePrompt: string}>} - The final composited image and prompts.
 */
export async function generateDrinkImageWithLogo(
  config: any,
  logoUrl: string,
  allProducts?: {
    bases?: string[]
    milks?: string[]
    syrups?: string[]
    toppings?: string[]
  }
): Promise<{imageUrl: string, prompt: string, negativePrompt: string}> {
  try {
    console.log("[v0] Starting drink image generation with logo compositing");
    console.log("[v0] Logo URL:", logoUrl);
    
    // Get base prompt and modify it specifically for logo inclusion
    const { prompt: basePrompt, negativePrompt: baseNegativePrompt } = buildDrinkPrompt(config, allProducts);
    
    // Create a very specific logo-enhanced prompt with detailed Starbucks logo description
    let logoEnhancedPrompt = basePrompt;
    
    // Use descriptive terms that specify exact logo placement on the transparent cup
    if (basePrompt.includes("Starbucks logo")) {
      logoEnhancedPrompt = basePrompt.replace(
        /with[^.]*Starbucks logo[^.]*/, 
        "with the prominent bright green circular Starbucks logo featuring the distinctive white crowned mermaid siren embossed directly on the center of the transparent cup wall, the clearly visible rounded logo covers half the cup height and half the cup diameter with a prominent raised 3D embossed effect"
      );
    } else {
      // If no logo mentioned, add very specific and visible logo placement description
      logoEnhancedPrompt = `${basePrompt}. The transparent cup prominently displays the iconic bright green circular Starbucks logo with the distinctive white crowned mermaid siren embossed directly on the center of the cup wall, the clearly visible rounded logo covers half the cup height and half the cup diameter, creating a prominent raised 3D embossed effect with high contrast against the transparent cup surface, the logo is unmistakable and clearly recognizable.`;
    }
    
    // Remove interfering negative prompts and add specific exclusions for proper logo placement
    const logoFriendlyNegativePrompt = baseNegativePrompt
      .replace(/,?\s*logo/gi, "")  // Remove any logo exclusions
      .replace(/,?\s*brand/gi, "") // Remove brand exclusions
      .replace(/,?\s*text/gi, "")  // Remove text exclusions
      + ", generic cup, unmarked cup, plain cup, no branding, floating logo, separate logo, logo not on cup, logo beside cup, detached logo, logo above cup, logo in background, background logo, decorative background, stylized background patterns"; // Ensure logo is ON the cup, not in background
    
    console.log("[v0] Generating with enhanced logo prompt");
    console.log("[v0] Enhanced prompt:", logoEnhancedPrompt);
    console.log("[v0] Logo-friendly negative prompt:", logoFriendlyNegativePrompt);
    
    // Always try to use the actual logo image - never rely on text generation for branded logos
    let finalImageUrl: string;
    
    if (logoUrl && logoUrl.startsWith('http')) {
      console.log("[v0] Logo URL provided - will composite actual Starbucks logo");
      
      // First generate base image WITHOUT logo in prompt (to avoid generic logos)
      const { prompt: basePrompt, negativePrompt: baseNegPrompt } = buildDrinkPrompt(config, allProducts);
      const baseNegativePrompt = baseNegPrompt + ", logo, branding, text, symbols";
      
      // Try custom model first, with automatic fallback to standard model
      console.log("[v0] Attempting to generate base image with custom model...");
      const baseImageUrl = await generateDrinkImageCustom(basePrompt, baseNegativePrompt);
      console.log("[v0] Clean base image generated successfully:", baseImageUrl);
      
      // Client-side version cannot perform logo compositing (requires server-only Sharp library)
      // Return base image - logo compositing will be handled by server-only functions
      console.log("[v0] Client-side version - returning base image without logo compositing");
      console.log("[v0] Note: Use generateDrinkImageWithLogoServer() from API routes for logo compositing");
      finalImageUrl = baseImageUrl;
    } else {
      console.log("[v0] No logo URL provided - generating without logo");
      const { prompt: basePrompt, negativePrompt: baseNegativePrompt } = buildDrinkPrompt(config, allProducts);
      console.log("[v0] Generating fallback image with custom model (auto-fallback to standard if needed)...");
      finalImageUrl = await generateDrinkImageCustom(basePrompt, baseNegativePrompt);
    }
    
    console.log("[v0] Final logo-enhanced image:", finalImageUrl);
    
    return { 
      imageUrl: finalImageUrl, 
      prompt: logoEnhancedPrompt, 
      negativePrompt: logoFriendlyNegativePrompt 
    };
    
  } catch (error) {
    console.error("[v0] Error in generateDrinkImageWithLogo:", error);
    
    // Fallback to basic image generation without logo
    try {
      const { prompt, negativePrompt } = buildDrinkPrompt(config, allProducts);
      console.log("[v0] Generating final fallback image (will try custom, then standard model)...");
      const fallbackImageUrl = await generateDrinkImageCustom(prompt, negativePrompt);
      console.log("[v0] Fallback to base image without logo:", fallbackImageUrl);
      return { imageUrl: fallbackImageUrl, prompt, negativePrompt };
    } catch (fallbackError) {
      console.error("[v0] Even fallback failed:", fallbackError);
      throw new Error("Failed to generate any image");
    }
  }
}

export function buildDrinkPrompt(
  config: any,
  allProducts?: {
    bases?: string[]
    milks?: string[]
    syrups?: string[]
    toppings?: string[]
  },
): { prompt: string; negativePrompt: string } {
  const parts = []
  const excludeParts = []

  // Determine if drink is cold
  const isCold = config.temperature?.toLowerCase() === "iced" || config.temperature?.toLowerCase() === "blended"
  const isHot = config.temperature?.toLowerCase() === "hot"

  const hasMilk = config.milk && config.milk.length > 0
  const hasSyrups = config.syrups && config.syrups.length > 0
  const hasToppings = config.toppings && config.toppings.length > 0
  const hasAdditions = hasMilk || hasSyrups || hasToppings

  const hasIce = isCold && config.ice && config.ice.toLowerCase() !== "none" && config.ice.toLowerCase() !== ""

  if (config.size) {
    const sizeLower = config.size.toLowerCase()
    let cupDescription = ""

    switch (sizeLower) {
      case "short":
        cupDescription = isHot
          ? "short white paper cup with brown cardboard sleeve (8 oz, 8.9 cm height, 6.4 cm diameter)"
          : "short clear plastic cup (8 oz, 8.9 cm height, 6.4 cm diameter)"
        break
      case "tall":
        cupDescription = isHot
          ? "tall white paper cup with brown cardboard sleeve (12 oz, 11.4 cm height, 8.4 cm diameter)"
          : "tall clear plastic cup (12 oz, 11.4 cm height, 8.4 cm diameter)"
        break
      case "grande":
        cupDescription = isHot
          ? "grande white paper cup with brown cardboard sleeve (16 oz, 16 cm height, 9.2 cm diameter)"
          : "grande clear plastic cup (16 oz, 16 cm height, 9.2 cm diameter)"
        break
      case "venti":
        if (isCold) {
          cupDescription = "venti clear plastic cold cup (24 oz, 18 cm height, 10 cm diameter)"
        } else {
          cupDescription =
            "venti white paper hot cup with brown cardboard sleeve (20 oz, 20 cm height, 9.2 cm diameter)"
        }
        break
      case "trenta":
        cupDescription = "trenta clear plastic cold cup (31 oz, 20.3 cm height, 10.4 cm diameter)"
        break
      default:
        cupDescription = isHot
          ? `${sizeLower} white paper cup with brown cardboard sleeve`
          : `${sizeLower} clear plastic cup`
    }

    // Always use a transparent cup, but for hot drinks, make the drink rich, creamy, opaque, and hot
    let drinkDesc = isHot ? "steaming hot Starbucks beverage" : "cold Starbucks beverage";
    if (config.base && config.base.toLowerCase().includes("chocolate")) {
      drinkDesc = isHot ? "steaming hot, rich, creamy, opaque hot chocolate" : "cold, rich, creamy, opaque chocolate beverage";
    } else if (isHot && config.base && ["latte", "mocha", "cappuccino"].some(b => config.base.toLowerCase().includes(b))) {
      drinkDesc = `steaming hot, creamy, opaque ${config.base}`;
    }
    parts.push(
      `A professional photograph of a ${drinkDesc} in a clear, completely transparent ${cupDescription} with smooth surface and the Starbucks logo. The cup is transparent, but the drink is rich and not see-through. For hot drinks, visible steam rising from the top. Crystal clear cup showing the drink's beautiful layers and rich colors.`
    );
  } else {
    let drinkDesc = isHot ? "steaming hot Starbucks beverage" : "cold Starbucks beverage";
    if (config.base && config.base.toLowerCase().includes("chocolate")) {
      drinkDesc = isHot ? "steaming hot, rich, creamy, opaque hot chocolate" : "cold, rich, creamy, opaque chocolate beverage";
    } else if (isHot && config.base && ["latte", "mocha", "cappuccino"].some(b => config.base.toLowerCase().includes(b))) {
      drinkDesc = `steaming hot, creamy, opaque ${config.base}`;
    }
    parts.push(
      `A professional photograph of a ${drinkDesc} in a clear, completely transparent clear plastic cup with smooth surface and the Starbucks logo. The cup is transparent, but the drink is rich and not see-through. For hot drinks, visible steam rising from the top. Crystal clear cup showing the drink's beautiful layers and rich colors.`
    );
  }

  if (config.base) {
    if (hasAdditions) {
      parts.push(`with plain black ${config.base.toLowerCase()} as the base`)
    } else {
      parts.push(`black ${config.base.toLowerCase()} drink`)
    }

    if (allProducts?.bases) {
      const unselectedBases = allProducts.bases
        .filter((base) => base.toLowerCase() !== config.base.toLowerCase())
        .slice(0, 3)
      excludeParts.push(...unselectedBases.map((b) => b.toLowerCase()))
    }
  }

  if (config.milk) {
    parts.push(`layered with ${config.milk.toLowerCase()}`)

    if (allProducts?.milks) {
      const unselectedMilks = allProducts.milks
        .filter((milk) => milk.toLowerCase() !== config.milk.toLowerCase())
        .slice(0, 3)
      excludeParts.push(...unselectedMilks.map((m) => m.toLowerCase()))
    }
  } else {
    excludeParts.push("milk", "cream", "dairy")
  }

  if (config.syrups && config.syrups.length > 0) {
    const syrupNames = config.syrups.map((s: any) => s.name.toLowerCase()).join(" and ")
    parts.push(`flavored with ${syrupNames} syrup`)

    if (allProducts?.syrups) {
      const selectedSyrupNames = config.syrups.map((s: any) => s.name.toLowerCase())
      const unselectedSyrups = allProducts.syrups
        .filter((syrup) => !selectedSyrupNames.includes(syrup.toLowerCase()))
        .slice(0, 5)
      excludeParts.push(...unselectedSyrups.map((s) => s.toLowerCase()))
    }
  } else {
    excludeParts.push("syrup", "flavoring")
  }

  if (config.toppings && config.toppings.length > 0) {
    const toppingNames = config.toppings.map((t: string) => t.toLowerCase()).join(" and ")
    parts.push(`topped with ${toppingNames}`)

    if (allProducts?.toppings) {
      const selectedToppingNames = config.toppings.map((t: string) => t.toLowerCase())
      const unselectedToppings = allProducts.toppings
        .filter((topping) => !selectedToppingNames.includes(topping.toLowerCase()))
        .slice(0, 5)
      excludeParts.push(...unselectedToppings.map((t) => t.toLowerCase()))
    }
  } else {
    excludeParts.push("whipped cream", "toppings")
  }

  if (hasIce) {
    parts.push(`with ice cubes`)
  } else {
    excludeParts.push("ice cubes", "ice", "frozen", "iced drink", "cold drink")
  }

  if (isHot) {
    excludeParts.push(
      "transparent cup",
      "clear plastic cup",
      "plastic cup",
      "iced",
      "cold",
      "ice cubes",
      "ice",
      "see-through cup",
      "clear cup",
      "plastic",
      "transparent",
      "iced drink",
      "cold beverage",
      "frozen",
    )
  }

  // Explicit exclusions for cold drinks
  if (isCold) {
    excludeParts.push("paper cup", "cardboard sleeve", "steam", "steaming", "hot beverage", "hot drink")
  }

  if (config.espresso && config.espresso > 0) {
    parts.push(`with ${config.espresso} espresso shot${config.espresso > 1 ? "s" : ""}`)
  }

  parts.push(
    "side view, close-up product shot filling the entire frame, clean white background, bright studio lighting, high quality, appetizing, professional beverage photography",
  )

  excludeParts.push("opaque cup", "shadows", "top view", "overhead view")

  let negativePrompt = excludeParts.join(", ")
  if (negativePrompt.length > 1000) {
    // Truncate to fit within limit
    negativePrompt = negativePrompt.substring(0, 997) + "..."
  }

  return {
    prompt: parts.join(", "),
    negativePrompt,
  }
}

// Enhanced Adobe Workflow Functions

/**
 * Remove background from an image using Adobe Photoshop API
 */
export async function removeBackground(accessToken: string, inputUrl: string, outputUrl: string): Promise<any> {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'x-api-key': credentials.CLIENT_ID,
    'Authorization': `Bearer ${accessToken}`,
  };

  const data = {
    input: {
      href: inputUrl,
      storage: 'external',
    },
    output: {
      href: outputUrl,
      storage: 'external',
    },
  };

  try {
    const response = await fetch('https://image.adobe.io/sensei/cutout', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Remove background API error (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    console.log('[v0] Remove Background Job Submitted:', result);
    return result;
  } catch (error) {
    console.error('[v0] Error during removeBackground:', error);
    throw error;
  }
}

/**
 * Generate object composite using Adobe Firefly API
 */
export async function generateObjectComposite(
  accessToken: string, 
  prompt: string, 
  imageUrl: string, 
  styleRefUrl?: string
): Promise<any> {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'x-api-key': credentials.CLIENT_ID,
    'Authorization': `Bearer ${accessToken}`,
  };

  const data: any = {
    prompt: prompt,
    contentClass: 'photo',
    image: {
      source: {
        url: imageUrl,
      },
    },
    placement: {
      alignment: {
        horizontal: 'center',
        vertical: 'center',
      },
    },
  };

  // Add style reference if provided
  if (styleRefUrl) {
    data.style = {
      imageReference: {
        source: {
          url: styleRefUrl,
        },
      },
      strength: 50,
    };
  }

  try {
    const response = await fetch('https://firefly-api.adobe.io/v3/images/generate-object-composite-async', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Object composite API error (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    console.log('[v0] Generate Object Composite Job Submitted:', result);
    return result;
  } catch (error) {
    console.error('[v0] Error during generateObjectComposite:', error);
    throw error;
  }
}

/**
 * Apply auto tone adjustment using Adobe Lightroom API
 */
export async function autoTone(accessToken: string, inputUrl: string, outputUrl: string): Promise<any> {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'x-api-key': credentials.CLIENT_ID,
    'Authorization': `Bearer ${accessToken}`,
  };

  const data = {
    inputs: {
      href: inputUrl,
      storage: 'external',
    },
    outputs: [
      {
        href: outputUrl,
        storage: 'external',
        type: 'image/jpeg',
      },
    ],
  };

  try {
    const response = await fetch('https://image.adobe.io/lrService/autoTone', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Auto tone API error (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    console.log('[v0] Auto Tone Job Submitted:', result);
    return result;
  } catch (error) {
    console.error('[v0] Error during autoTone:', error);
    throw error;
  }
}

/**
 * Check Adobe Photoshop job status
 */
export async function checkPhotoshopJobStatus(jobId: string, accessToken: string): Promise<boolean> {
  const headers = {
    'x-api-key': credentials.CLIENT_ID,
    'Authorization': `Bearer ${accessToken}`,
  };

  const url = `https://image.adobe.io/sensei/status/${jobId}`;

  let status = 'submitted';
  let attempts = 0;
  const maxAttempts = 24; // 2 minutes max wait time

  while (status !== 'succeeded' && status !== 'failed' && attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds
    attempts++;

    try {
      const response = await fetch(url, { headers: headers });
      if (!response.ok) {
        throw new Error(`Status check failed: ${response.status}`);
      }

      const result = await response.json();
      status = result.status;
      console.log(`[v0] Photoshop Job Status: ${status} (attempt ${attempts})`);
    } catch (error) {
      console.error('[v0] Error checking Photoshop job status:', error);
      return false;
    }
  }

  if (status === 'succeeded') {
    console.log('[v0] Background removal completed successfully!');
    return true;
  } else {
    console.error('[v0] Background removal failed or timed out.');
    return false;
  }
}

/**
 * Check Adobe Firefly job status and return result URL
 */
export async function checkFireflyJobStatus(jobId: string, accessToken: string): Promise<string | null> {
  const headers = {
    'x-api-key': credentials.CLIENT_ID,
    'Authorization': `Bearer ${accessToken}`,
  };

  const url = `https://firefly-api.adobe.io/v3/status/${jobId}`;

  let status = 'pending';
  let attempts = 0;
  const maxAttempts = 24; // 2 minutes max wait time

  while (status !== 'succeeded' && status !== 'failed' && status !== 'cancelled' && attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds
    attempts++;

    try {
      const response = await fetch(url, { headers: headers });
      if (!response.ok) {
        throw new Error(`Status check failed: ${response.status}`);
      }

      const result = await response.json();
      status = result.status;
      console.log(`[v0] Firefly Job Status: ${status} (attempt ${attempts})`);

      if (status === 'succeeded') {
        console.log('[v0] Object composite generation completed successfully!');
        const imageUrl = result.result?.outputs?.[0]?.image?.url;
        if (imageUrl) {
          console.log(`[v0] You can access the image at: ${imageUrl}`);
          return imageUrl;
        }
      }
    } catch (error) {
      console.error('[v0] Error checking Firefly job status:', error);
      return null;
    }
  }

  console.error('[v0] Object composite generation failed or timed out.');
  return null;
}

/**
 * Check Adobe Lightroom job status
 */
export async function checkLightroomJobStatus(jobId: string, accessToken: string): Promise<boolean> {
  const headers = {
    'x-api-key': credentials.CLIENT_ID,
    'Authorization': `Bearer ${accessToken}`,
  };

  const url = `https://image.adobe.io/lrService/status/${jobId}`;

  let status = 'pending';
  let attempts = 0;
  const maxAttempts = 24; // 2 minutes max wait time

  while (status !== 'succeeded' && status !== 'failed' && attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds
    attempts++;

    try {
      const response = await fetch(url, { headers: headers });
      if (!response.ok) {
        throw new Error(`Status check failed: ${response.status}`);
      }

      const result = await response.json();
      const outputs = result.outputs || [];
      if (outputs.length > 0) {
        status = outputs[0].status;
      }
      console.log(`[v0] Lightroom Job Status: ${status} (attempt ${attempts})`);
    } catch (error) {
      console.error('[v0] Error checking Lightroom job status:', error);
      return false;
    }
  }

  if (status === 'succeeded') {
    console.log('[v0] Auto tone completed successfully!');
    return true;
  } else {
    console.error('[v0] Auto tone failed or timed out.');
    return false;
  }
}

/**
 * Extract job ID from Adobe API response
 */
export function extractJobId(response: any): string {
  const href = response._links?.self?.href;
  if (!href) {
    throw new Error('No job ID found in response');
  }
  return href.split('/').pop();
}

/**
 * Enhanced logo compositing using Adobe's async object-composite API
 */
/**
 * Client-safe placeholder for Sharp-based logo compositing
 * Use intelligentSharpLogoCompositingServer() from adobe-firefly-server.ts in API routes
 */
export async function intelligentSharpLogoCompositing(
  baseImageUrl: string,
  logoUrl: string
): Promise<string | null> {
  console.log('[v0] Client-side Sharp compositing not available');
  console.log('[v0] Use intelligentSharpLogoCompositingServer() from adobe-firefly-server.ts in API routes');
  return null;
}

/**
 * Basic Sharp-based logo compositing (fallback method)
 */
/**
 * Client-safe placeholder for Sharp logo compositing
 * Use sharpLogoCompositingServer() from adobe-firefly-server.ts in API routes
 */
export async function sharpLogoCompositing(
  baseImageUrl: string,
  logoUrl: string
): Promise<string | null> {
  console.log('[v0] Client-side Sharp compositing not available');
  console.log('[v0] Use sharpLogoCompositingServer() from adobe-firefly-server.ts in API routes');
  return null;
}

/**
 * Client-safe placeholder for advanced logo placement 
 * Use server-only functions from adobe-firefly-server.ts in API routes
 */
/**
 * Client-side stub - these functions require Sharp and must use server-only versions
 * from adobe-firefly-server.ts in API routes
 */
export async function advancedLogoPlacement(
  baseImageUrl: string,
  logoUrl: string
): Promise<{ imageUrl: string | null; analysis: any; method: string }> {
  console.log('[v0] Client-side advanced logo placement not available');
  console.log('[v0] Use server-only functions from adobe-firefly-server.ts in API routes');
  return { imageUrl: null, analysis: null, method: 'client-skip' };
}

/**
 * Client-side stub - requires Sharp, use server version from adobe-firefly-server.ts
 */
export async function enhancedLogoCompositing(
  baseImageUrl: string,
  logoUrl: string,
  prompt: string = "A coffee cup with Starbucks logo"
): Promise<string | null> {
  console.log('[v0] Client-side enhanced logo compositing not available');
  console.log('[v0] Use enhancedLogoCompositing() from adobe-firefly-server.ts in API routes');
  return null;
}
