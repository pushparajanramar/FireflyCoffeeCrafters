import { NextRequest, NextResponse } from 'next/server';
import { generateDrinkImage, intelligentSharpLogoCompositingServer } from '@/lib/adobe-firefly-server';

export async function GET(request: NextRequest) {
  try {
    console.log('[API] Testing 4% bottom cut for lower cup placement');
    
    const logoUrl = 'https://sbux-logo.s3.us-east-2.amazonaws.com/Starbucks_Corporation_Logo_.png';
    
    // Generate a coffee with foam/cream for testing
    console.log('[API] Generating coffee image with foam/whipped cream...');
    const coffeePrompt = "Professional product photography of a tall white paper coffee cup with brown cardboard sleeve topped with thick whipped cream and caramel drizzle, centered on clean white background, studio lighting";
    const coffeeNegativePrompt = "logo, branding, text, symbols, multiple cups, blurry, low quality";
    
    const coffeeCupUrl = await generateDrinkImage(coffeePrompt, coffeeNegativePrompt);
    
    if (!coffeeCupUrl) {
      return NextResponse.json({
        success: false,
        message: 'Coffee cup generation failed'
      }, { status: 500 });
    }
    
    console.log('[API] Testing logo placement with 4% bottom cut (targets lower cup area)...');
    const finalImageUrl = await intelligentSharpLogoCompositingServer(coffeeCupUrl, logoUrl);
    
    return NextResponse.json({
      success: true,
      message: '4% bottom cut test completed - targets lower cup area',
      bottomCutStrategy: {
        description: 'Cuts 4% from bottom of detected cup height',
        logic: 'Reduces cup area and moves center up to focus on lower cup surface',
        benefit: 'Avoids foam/whipped cream at top, places logo on actual cup body',
        implementation: {
          keepTopY: 'Maintains original top Y coordinate',
          reduceHeight: 'Reduces height by 4% from bottom',
          moveCenterUp: 'Moves center Y up by 2% to focus on lower area'
        }
      },
      testResults: {
        originalCoffeeImage: coffeeCupUrl,
        logoCompositeImage: finalImageUrl,
        logoPlacementSuccess: !!finalImageUrl,
        targetArea: 'Lower cup surface below foam/cream'
      },
      workflow: {
        step1: 'GPT-4 Vision detects full cup including foam',
        step2: 'System reduces height by 4% from bottom',
        step3: 'Center point moved up to focus on lower cup area',
        step4: 'Logo placed on lower cup surface (avoiding top foam)'
      }
    });
    
  } catch (error) {
    console.error('[API] 4% bottom cut test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: '4% bottom cut test failed'
    }, { status: 500 });
  }
}