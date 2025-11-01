// Server-only image utilities using Sharp
// This file should only be imported by server-side code (API routes)

/**
 * Server-side Sharp-based logo compositing
 */
export async function serverSharpLogoCompositing(
  baseImageUrl: string,
  logoUrl: string
): Promise<string | null> {
  try {
    console.log('[v0] Starting server-side Sharp logo compositing');
    
    // Dynamic import of Sharp for server-side only
    const sharp = (await import('sharp')).default;
    
    // Download both images
    console.log('[v0] Downloading base image:', baseImageUrl);
    const baseImageResponse = await fetch(baseImageUrl);
    if (!baseImageResponse.ok) {
      throw new Error(`Failed to download base image: ${baseImageResponse.status}`);
    }
    const baseImageBuffer = Buffer.from(await baseImageResponse.arrayBuffer());
    
    console.log('[v0] Downloading logo image:', logoUrl);
    const logoImageResponse = await fetch(logoUrl);
    if (!logoImageResponse.ok) {
      throw new Error(`Failed to download logo image: ${logoImageResponse.status}`);
    }
    const logoImageBuffer = Buffer.from(await logoImageResponse.arrayBuffer());
    
    // Get base image dimensions
    const baseImage = sharp(baseImageBuffer);
    const { width: baseWidth, height: baseHeight } = await baseImage.metadata();
    
    if (!baseWidth || !baseHeight) {
      throw new Error('Could not get base image dimensions');
    }
    
    // Calculate logo size (15% of image width, max 120px)
    const logoSize = Math.min(Math.floor(baseWidth * 0.15), 120);
    
    // Prepare logo with proper sizing and 60% transparency
    const processedLogo = await sharp(logoImageBuffer)
      .resize(logoSize, logoSize, { 
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
      })
      .ensureAlpha() // Ensure alpha channel exists
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
    
    // Position logo in bottom-right corner with padding
    const padding = Math.floor(Math.min(baseWidth, baseHeight) * 0.05); // 5% padding
    const logoX = baseWidth - logoSize - padding;
    const logoY = baseHeight - logoSize - padding;
    
    console.log(`[v0] Placing ${logoSize}x${logoSize}px logo at position (${logoX}, ${logoY})`);
    
    // Composite the logo onto the base image
    const compositedImage = await baseImage
      .composite([
        {
          input: transparentLogo,
          left: logoX,
          top: logoY,
          blend: 'over'
        }
      ])
      .png()
      .toBuffer();
    
    // Convert to base64 data URL
    const base64Image = compositedImage.toString('base64');
    const dataUrl = `data:image/png;base64,${base64Image}`;
    
    console.log('[v0] Server-side Sharp logo compositing completed successfully');
    return dataUrl;
    
  } catch (error) {
    console.error('[v0] Error in server-side Sharp logo compositing:', error);
    return null;
  }
}

/**
 * Create a transparent logo with server-side Sharp
 */
export async function createServerTransparentLogo(logoImageBuffer: Buffer, logoSize: number): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  
  // Prepare logo with proper sizing and 60% transparency
  const processedLogo = await sharp(logoImageBuffer)
    .resize(logoSize, logoSize, { 
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
    })
    .ensureAlpha() // Ensure alpha channel exists
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Apply 60% transparency (40% opacity) to the logo
  const { data, info } = processedLogo;
  for (let i = 3; i < data.length; i += 4) {
    data[i] = Math.round(data[i] * 0.4); // 40% opacity = 60% transparent
  }

  return await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  })
  .png()
  .toBuffer();
}