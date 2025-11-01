/**
 * Server-only Adobe Firefly functions that use Sharp
 * This file should ONLY be imported by API routes and server components
 */

import { 
  generateDrinkImage, 
  buildDrinkPrompt, 
  getAccessToken,
  uploadImageToFirefly 
} from './adobe-firefly';
import { serverSharpLogoCompositing } from './server-image-utils';

/**
 * Server-only version of generateDrinkImageWithLogo that uses Sharp compositing
 * This function should only be called from API routes
 */
export async function generateDrinkImageWithLogoServer(
  config: any,
  logoUrl: string,
  allProducts: any
): Promise<{ imageUrl: string; prompt: string; negativePrompt: string }> {
  try {
    console.log("[v0] Starting server-side image generation with logo compositing");
    
    // Step 1: Build the prompt from the drink configuration
    const { prompt, negativePrompt } = buildDrinkPrompt(config, allProducts);
    console.log("[v0] Generated prompt:", prompt);
    console.log("[v0] Generated negative prompt:", negativePrompt);

    // Step 2: Generate the base image using Firefly
    console.log("[v0] Generating base image with Firefly...");
    const baseImageUrl = await generateDrinkImage(prompt, negativePrompt);
    
    if (!baseImageUrl) {
      throw new Error("Failed to generate base image");
    }
    
    console.log("[v0] Base image generated:", baseImageUrl);

    // Step 3: Composite the logo using server-side Sharp
    console.log("[v0] Starting server-side logo compositing...");
    const compositedImageUrl = await serverSharpLogoCompositing(baseImageUrl, logoUrl);
    
    if (!compositedImageUrl) {
      console.log("[v0] Sharp compositing failed, returning base image");
      return {
        imageUrl: baseImageUrl,
        prompt,
        negativePrompt
      };
    }

    console.log("[v0] Logo compositing successful");
    return {
      imageUrl: compositedImageUrl,
      prompt,
      negativePrompt
    };

  } catch (error) {
    console.error("[v0] Error in server-side generateDrinkImageWithLogo:", error);
    throw error;
  }
}

/**
 * Server-only intelligent Sharp logo compositing with GPT-4 Vision
 * This function should only be called from API routes
 */
export async function intelligentSharpLogoCompositingServer(
  baseImageUrl: string,
  logoUrl: string
): Promise<string | null> {
  try {
    console.log('[v0] Starting server-side intelligent Sharp-based logo compositing');
    
    // For now, use the basic server Sharp compositing
    // In the future, we can add GPT-4 Vision analysis here
    return await serverSharpLogoCompositing(baseImageUrl, logoUrl);
    
  } catch (error) {
    console.error('[v0] Error in server-side intelligent Sharp logo compositing:', error);
    return null;
  }
}

/**
 * Server-only basic Sharp logo compositing
 * This function should only be called from API routes
 */
export async function sharpLogoCompositingServer(
  baseImageUrl: string,
  logoUrl: string
): Promise<string | null> {
  return await serverSharpLogoCompositing(baseImageUrl, logoUrl);
}

/**
 * Server-only logo upload to Firefly (re-export for convenience)
 */
export { uploadImageToFirefly };

/**
 * Re-export client-safe functions for server use
 */
export { 
  generateDrinkImage, 
  buildDrinkPrompt, 
  getAccessToken 
} from './adobe-firefly';

/**
 * Import Sharp (server-only)
 */
import sharp from 'sharp';
import { getCupCoordinates, analyzeImageForCupPlacement, getDetailedCupPoints, type CupCoordinates, type DetailedCupPoints } from './openai-vision';

/**
 * Helper function to adjust coordinates for foam layer
 */
function adjustForFoamLayer(coordinates: CupCoordinates, imageHeight: number): CupCoordinates {
  let adjusted = { ...coordinates };
  
  // Cut 4% from the bottom to focus on lower cup area (avoiding foam at top)
  const percentageCut = 0.04; // 4% of image height
  
  console.log(`[v0] Cutting 4% (${percentageCut} normalized) from bottom of detected cup to focus on lower area`);
  
  // Keep the same top Y coordinate (don't move it)
  adjusted.y = coordinates.y;
  
  // Reduce height by 4% from the bottom
  adjusted.height = Math.max(0.1, coordinates.height - percentageCut);
  
  // Move center Y up by half the cut (2%) to center in the remaining lower area
  adjusted.centerY = coordinates.centerY - (percentageCut / 2);
  
  console.log(`[v0] 4% bottom cut applied: Height ${coordinates.height.toFixed(3)} → ${adjusted.height.toFixed(3)}, CenterY ${coordinates.centerY.toFixed(3)} → ${adjusted.centerY.toFixed(3)}`);
  
  return adjusted;
}

/**
 * Server-only advanced logo placement with GPT-4 Vision and Sharp
 */
export async function advancedLogoPlacement(
  baseImageUrl: string,
  logoUrl: string
): Promise<{ imageUrl: string | null; analysis: any; method: string }> {
  try {
    console.log('[v0] Starting server-side advanced logo placement with GPT-4 Vision + Sharp');
    
    // Use GPT-4 Vision to get cup coordinates
    const coordinates = await getCupCoordinates(baseImageUrl);
    
    if (!coordinates) {
      console.log('[v0] Could not detect cup coordinates, falling back to basic Sharp compositing');
      const basicResult = await serverSharpLogoCompositing(baseImageUrl, logoUrl);
      return { imageUrl: basicResult, analysis: null, method: 'sharp-fallback' };
    }
    
    // Use coordinates-based placement
    const placedImage = await placeLogoAtCoordinates(baseImageUrl, logoUrl, coordinates);
    
    if (placedImage) {
      return { imageUrl: placedImage, analysis: coordinates, method: 'gpt4-vision-sharp' };
    } else {
      console.log('[v0] Coordinate-based placement failed, using basic Sharp compositing');
      const fallbackResult = await serverSharpLogoCompositing(baseImageUrl, logoUrl);
      return { imageUrl: fallbackResult, analysis: coordinates, method: 'sharp-fallback-after-vision' };
    }
  } catch (error) {
    console.error('[v0] Error in server-side advanced logo placement:', error);
    return { imageUrl: null, analysis: null, method: 'error' };
  }
}

/**
 * Server-only cream-aware logo placement that adjusts positioning based on cream layer presence
 */
export async function creamAwareLogoPlacement(
  baseImageUrl: string,
  logoUrl: string,
  hasCreamLayer: boolean = false
): Promise<string | null> {
  try {
    console.log(`[v0] Starting server-side cream-aware logo placement (cream detected: ${hasCreamLayer})`);
    
    // Download images
    const baseImageResponse = await fetch(baseImageUrl);
    const logoImageResponse = await fetch(logoUrl);
    
    if (!baseImageResponse.ok || !logoImageResponse.ok) {
      throw new Error('Failed to download images');
    }
    
    const baseImageBuffer = Buffer.from(await baseImageResponse.arrayBuffer());
    const logoImageBuffer = Buffer.from(await logoImageResponse.arrayBuffer());
    
    // Get base image dimensions
    const baseImage = sharp(baseImageBuffer);
    const { width: baseWidth, height: baseHeight } = await baseImage.metadata();
    
    if (!baseWidth || !baseHeight) {
      throw new Error('Could not get base image dimensions');
    }
    
    // Calculate logo size (20% of smaller dimension for conservative sizing)
    let logoSize = Math.min(baseWidth, baseHeight) * 0.20;
    
    // Apply maximum size constraint (no larger than 15% of image width)
    const maxLogoSize = Math.round(baseWidth * 0.15);
    logoSize = Math.min(logoSize, maxLogoSize);
    
    // Prepare logo with 60% transparency
    const processedLogo = await sharp(logoImageBuffer)
      .resize(logoSize, logoSize, { 
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Apply 60% transparency (40% opacity) to the logo
    const { data, info } = processedLogo;
    for (let i = 3; i < data.length; i += 4) {
      data[i] = Math.round(data[i] * 0.4); // 40% opacity = 60% transparent
    }

    const transparentLogo = await sharp(data, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4
      }
    })
    .png()
    .toBuffer();
    
    // Adjust positioning based on cream layer presence
    let left = Math.round((baseWidth - logoSize) / 2);
    let top = Math.round((baseHeight - logoSize) / 2);
    
    if (hasCreamLayer) {
      // Move logo down to avoid cream layer - position on lower 2/3 of the image
      top = Math.round((baseHeight * 0.6) - logoSize / 2);
      console.log(`[v0] Adjusted position for cream layer: (${left}, ${top})`);
    }
    
    console.log(`[v0] Final logo placement: (${left}, ${top}) with size ${logoSize} (60% transparent)`);
    
    // Composite the transparent logo
    const compositedBuffer = await baseImage
      .composite([{
        input: transparentLogo,
        left: left,
        top: top,
        blend: 'over'
      }])
      .png()
      .toBuffer();
    
    const base64Image = compositedBuffer.toString('base64');
    return `data:image/png;base64,${base64Image}`;
    
  } catch (error) {
    console.error('[v0] Error in server-side cream-aware logo placement:', error);
    return null;
  }
}

/**
 * Server-only logo placement at specific coordinates detected by GPT-4 Vision
 */
export async function placeLogoAtCoordinates(
  baseImageUrl: string,
  logoUrl: string,
  coordinates: CupCoordinates
): Promise<string | null> {
  try {
    console.log('[v0] Placing logo at specific coordinates (server-side):', coordinates);
    
    // Download images
    const baseImageResponse = await fetch(baseImageUrl);
    const logoImageResponse = await fetch(logoUrl);
    
    if (!baseImageResponse.ok || !logoImageResponse.ok) {
      throw new Error('Failed to download images');
    }
    
    const baseImageBuffer = Buffer.from(await baseImageResponse.arrayBuffer());
    const logoImageBuffer = Buffer.from(await logoImageResponse.arrayBuffer());
    
    // Get base image dimensions
    const baseImage = sharp(baseImageBuffer);
    const { width: baseWidth, height: baseHeight } = await baseImage.metadata();
    
    if (!baseWidth || !baseHeight) {
      throw new Error('Could not get base image dimensions');
    }
    
    // Always cut 4% from bottom to focus on lower cup area (avoiding foam at top)
    const adjustedCoords = adjustForFoamLayer(coordinates, baseHeight);
    console.log('[v0] Applied 4% bottom cut to focus on lower cup area:', adjustedCoords);
    
    // Calculate logo size based on foam-adjusted cup dimensions
    const cupPixelWidth = adjustedCoords.width * baseWidth;
    let logoSize = Math.round(cupPixelWidth * 0.25); // 25% of cup width (reduced from 35%)
    
    // Apply maximum size constraint (no larger than 15% of image width)
    const maxLogoSize = Math.round(baseWidth * 0.15);
    logoSize = Math.min(logoSize, maxLogoSize);
    
    // Prepare logo with 60% transparency
    const processedLogo = await sharp(logoImageBuffer)
      .resize(logoSize, logoSize, { 
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Apply 60% transparency (40% opacity) to the logo
    const { data, info } = processedLogo;
    for (let i = 3; i < data.length; i += 4) {
      data[i] = Math.round(data[i] * 0.4); // 40% opacity = 60% transparent
    }

    const transparentLogo = await sharp(data, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4
      }
    })
    .png()
    .toBuffer();
    
    // Calculate placement position using foam-adjusted coordinates
    const left = Math.round(adjustedCoords.centerX * baseWidth - logoSize / 2);
    const top = Math.round(adjustedCoords.centerY * baseHeight - logoSize / 2);
    
    console.log(`[v0] Compositing at foam-excluded position: (${left}, ${top}) with size ${logoSize}`);
    
    // Composite the transparent logo
    const compositedBuffer = await baseImage
      .composite([{
        input: transparentLogo,
        left: left,
        top: top,
        blend: 'over'
      }])
      .png()
      .toBuffer();
    
    const base64Image = compositedBuffer.toString('base64');
    return `data:image/png;base64,${base64Image}`;
    
  } catch (error) {
    console.error('[v0] Error placing logo at coordinates (server-side):', error);
    return null;
  }
}

/**
 * Server-only enhanced logo compositing with fallback logic
 */
export async function enhancedLogoCompositing(
  baseImageUrl: string,
  logoUrl: string,
  prompt: string = "A coffee cup with Starbucks logo"
): Promise<string | null> {
  try {
    console.log('[v0] Starting server-side enhanced logo compositing');
    console.log('[v0] Using Sharp + GPT-4 Vision for logo placement');
    
    // Use advanced AI-powered logo placement (Sharp + GPT-4 Vision)
    const result = await advancedLogoPlacement(baseImageUrl, logoUrl);
    
    if (result.imageUrl) {
      console.log(`[v0] Server-side logo placement successful using: ${result.method}`);
      return result.imageUrl;
    } else {
      console.log('[v0] Advanced placement failed, using basic Sharp compositing as fallback');
      
      // Fallback to basic Sharp compositing
      const fallbackResult = await serverSharpLogoCompositing(baseImageUrl, logoUrl);
      
      if (fallbackResult) {
        console.log('[v0] Basic Sharp compositing fallback successful');
        return fallbackResult;
      } else {
        console.log('[v0] All server-side placement methods failed');
        return null;
      }
    }

  } catch (error) {
    console.error('[v0] Error in server-side enhanced logo compositing:', error);
    // Fallback to descriptive prompt approach if logo placement fails
    try {
      console.log('[v0] Falling back to descriptive Firefly generation approach');
      const { getAccessToken } = await import('./adobe-firefly');
      const accessToken = await getAccessToken();
      
      // Import Firefly config
      const fireflyConfig = {
        GENERATE_IMAGE_URL: "https://firefly-api.adobe.io/v3/images/generate"
      };
      
      const credentials = {
        CLIENT_ID: process.env.ADOBE_CLIENT_ID || ""
      };
      
      const cleanLogoPrompt = `${prompt.replace(/featuring.*?photography/gi, '')}, with a clean, professional green circular logo featuring a white stylized mermaid siren symbol prominently displayed on the cup, simple clean composition`;
      
      const response = await fetch(fireflyConfig.GENERATE_IMAGE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": credentials.CLIENT_ID,
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          prompt: cleanLogoPrompt,
          negativePrompt: "complex backgrounds, coffee bean logo, leaf logo, brown logo, generic coffee symbols, additional objects, style effects, artistic backgrounds, decorative elements",
          contentClass: "photo",
          size: { width: 2048, height: 2048 },
          visualIntensity: 5,
          locale: "en-US",
          numVariations: 1,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.outputs && data.outputs.length > 0 && data.outputs[0].image && data.outputs[0].image.url) {
          const imageUrl = data.outputs[0].image.url;
          console.log('[v0] Fallback logo generation successful:', imageUrl);
          return imageUrl;
        }
      }
      
      return null;
    } catch (fallbackError) {
      console.error('[v0] Fallback also failed:', fallbackError);
      return null;
    }
  }
}