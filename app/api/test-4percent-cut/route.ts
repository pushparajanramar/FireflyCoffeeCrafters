import { NextRequest, NextResponse } from 'next/server';
import { generateDrinkImage, intelligentSharpLogoCompositingServer } from '@/lib/adobe-firefly-server';

export async function GET(request: NextRequest) {
  try {
    console.log('[API] Testing 4% foam cut from top');
    
    const logoUrl = 'https://sbux-logo.s3.us-east-2.amazonaws.com/Starbucks_Corporation_Logo_.png';
    
    // Generate a coffee with foam/cream for testing
    console.log('[API] Generating coffee image with foam...');
    const coffeePrompt = "Professional product photography of a tall white paper coffee cup with brown cardboard sleeve filled with cappuccino with thick white foam on top, centered on clean white background, studio lighting";
    const coffeeNegativePrompt = "logo, branding, text, symbols, multiple cups, blurry, low quality";
    
    const coffeeCupUrl = await generateDrinkImage(coffeePrompt, coffeeNegativePrompt);
    
    if (!coffeeCupUrl) {
      return NextResponse.json({
        success: false,
        message: 'Coffee cup generation failed'
      }, { status: 500 });
    }
    
    console.log('[API] Testing logo placement with 4% bottom cut...');
    const finalImageUrl = await intelligentSharpLogoCompositingServer(coffeeCupUrl, logoUrl);
    
    return NextResponse.json({
      success: true,
      message: '4% bottom cut test completed',
      foamCutFeature: {
        description: 'Always cuts 4% from the bottom of detected cup height to focus on lower cup area',
        implementation: 'Reduces cup height by 4% and moves center up to focus on lower cup surface',
        benefit: 'Ensures logo placement on lower cup area, avoiding foam at top, scales with image size',
        advantages: [
          'Targets lower cup area below foam',
          'Works with any image resolution',
          'Proportional to image size',
          'More reliable than fixed pixel measurements'
        ]
      },
      testResults: {
        originalCoffeeImage: coffeeCupUrl,
        logoCompositeImage: finalImageUrl,
        logoPlacementSuccess: !!finalImageUrl
      },
      instructions: {
        step1: 'GPT-4 Vision detects cup coordinates',
        step2: 'System reduces cup height by 4% from bottom and moves center up',
        step3: 'Logo placed in lower cup area (avoiding foam at top)',
        step4: 'Final composite returned with logo on lower cup surface'
      }
    });
    
  } catch (error) {
    console.error('[API] 4% foam cut test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: '4% foam cut test failed'
    }, { status: 500 });
  }
}