import { NextRequest, NextResponse } from 'next/server';
import { intelligentSharpLogoCompositingServer } from '@/lib/adobe-firefly-server';

export async function POST(request: NextRequest) {
  try {
    console.log('[Test-OneThird] Testing 1/3 from bottom logo placement');
    
    const { baseImageUrl, logoUrl } = await request.json();
    
    if (!baseImageUrl || !logoUrl) {
      return NextResponse.json({ 
        error: 'Both baseImageUrl and logoUrl are required',
        success: false 
      }, { status: 400 });
    }

    console.log('[Test-OneThird] Base image:', baseImageUrl);
    console.log('[Test-OneThird] Logo:', logoUrl);
    
    // Test the 1/3 positioning logic
    const result = await intelligentSharpLogoCompositingServer(baseImageUrl, logoUrl);
    
    if (!result) {
      return NextResponse.json({
        success: false,
        error: 'Logo compositing failed',
        result: null
      });
    }

    return NextResponse.json({
      success: true,
      result: result,
      message: 'Logo compositing completed with 1/3 from bottom placement',
      placementStrategy: {
        positioning: '1/3 up from cup bottom (2/3 down from rim)',
        reasoning: 'Lower placement provides better visual balance and avoids foam/toppings',
        calculation: 'Y = bottomY - (cupHeight × 1/3)',
        benefits: [
          'Avoids foam and whipped cream areas',
          'Better visual balance on cup surface',
          'More stable placement area',
          'Consistent with coffee shop logo placement'
        ]
      },
      technicalDetails: {
        logoSizing: '25% of detected cup width',
        maxSizeConstraint: '15% of image width',
        transparency: '60% (40% opacity)',
        cupDetection: 'GPT-4 Vision with physical cup boundary analysis',
        ignoresElements: ['Toppings', 'Foam', 'Existing logos', 'Decorations']
      },
      debugInfo: {
        approach: '1/3 from bottom positioning',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[Test-OneThird] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      result: null
    }, { status: 500 });
  }
}