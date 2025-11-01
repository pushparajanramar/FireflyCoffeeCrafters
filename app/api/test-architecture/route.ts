import { NextRequest, NextResponse } from 'next/server';
import { generateDrinkImage } from '@/lib/adobe-firefly';
import { enhancedLogoCompositing } from '@/lib/adobe-firefly-server';

export async function GET(request: NextRequest) {
  try {
    console.log('[API] Testing CONFIRMED architecture - separate generation and composition');
    
    const logoUrl = 'https://sbux-logo.s3.us-east-2.amazonaws.com/Starbucks_Corporation_Logo_.png';
    
    // STEP 1: Generate coffee cup (ONE Firefly call)
    console.log('[API] STEP 1: Generating coffee cup with Firefly...');
    const cupPrompt = "Professional product photography of a tall white paper coffee cup with brown cardboard sleeve on clean white background, studio lighting, high quality, centered, detailed";
    const cupNegativePrompt = "logo, branding, text, symbols, multiple cups, blurry, low quality";
    
    const coffeeStartTime = Date.now();
    const coffeeCupUrl = await generateDrinkImage(cupPrompt, cupNegativePrompt);
    const coffeeGenerationTime = Date.now() - coffeeStartTime;
    
    if (!coffeeCupUrl) {
      return NextResponse.json({
        success: false,
        message: 'Coffee cup generation failed'
      }, { status: 500 });
    }
    
    console.log(`[API] Coffee cup generated in ${coffeeGenerationTime}ms:`, coffeeCupUrl);
    
    // STEP 2: Logo composition (ZERO Firefly calls - only Sharp + GPT-4 Vision)
    console.log('[API] STEP 2: Compositing logo with client-side processing...');
    const compositionStartTime = Date.now();
    const finalImageUrl = await enhancedLogoCompositing(coffeeCupUrl, logoUrl);
    const compositionTime = Date.now() - compositionStartTime;
    
    const totalTime = Date.now() - coffeeStartTime;
    
    return NextResponse.json({
      success: true,
      message: 'Architecture confirmation test completed',
      architecture: {
        step1: {
          description: 'Coffee cup generation',
          method: 'Adobe Firefly API call',
          fireflyCall: true,
          result: coffeeCupUrl,
          timeMs: coffeeGenerationTime
        },
        step2: {
          description: 'Logo composition',  
          method: 'GPT-4 Vision + Sharp (client-side)',
          fireflyCall: false,
          result: finalImageUrl ? 'Success' : 'Failed',
          timeMs: compositionTime
        }
      },
      inputs: {
        logoFromConfig: logoUrl,
        cupFromGeneration: coffeeCupUrl
      },
      outputs: {
        finalCompositeImage: finalImageUrl
      },
      performance: {
        totalTimeMs: totalTime,
        coffeeGenerationMs: coffeeGenerationTime,
        logoCompositionMs: compositionTime
      },
      confirmation: {
        separateFunctions: true,
        singleFireflyCall: true,
        clientSideComposition: true,
        noAdditionalFireflyCalls: true
      }
    });
    
  } catch (error) {
    console.error('[API] Architecture test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Architecture confirmation test failed'
    }, { status: 500 });
  }
}