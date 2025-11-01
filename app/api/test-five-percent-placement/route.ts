import { NextRequest, NextResponse } from 'next/server';
import { intelligentSharpLogoCompositingServer } from '@/lib/adobe-firefly-server';

export async function POST(request: NextRequest) {
  try {
    console.log('[Test-FivePercent] Testing 5% from bottom logo placement');
    
    const { baseImageUrl, logoUrl } = await request.json();
    
    if (!baseImageUrl || !logoUrl) {
      return NextResponse.json({ 
        error: 'Both baseImageUrl and logoUrl are required',
        success: false 
      }, { status: 400 });
    }

    console.log('[Test-FivePercent] Base image:', baseImageUrl);
    console.log('[Test-FivePercent] Logo:', logoUrl);
    
    // Test the 5% positioning logic
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
      message: 'Logo compositing completed with 5% from bottom placement',
      placementStrategy: {
        positioning: '5% up from cup bottom (very low placement)',
        reasoning: 'Extremely low placement for maximum separation from all toppings and foam',
        calculation: 'Y = bottomY - (cupHeight × 0.05)',
        benefits: [
          'Complete avoidance of foam, whipped cream, and toppings',
          'Clear visibility on cup base area',
          'Maximum stability - cup base is most solid area',
          'Professional appearance - logos typically placed low on cups',
          'Works well with transparent/glass cups'
        ]
      },
      technicalDetails: {
        logoSizing: '25% of detected cup width',
        maxSizeConstraint: '15% of image width',
        transparency: '60% (40% opacity)',
        cupDetection: 'GPT-4 Vision with physical cup boundary analysis',
        positioning: '5% from cup bottom',
        ignoresElements: ['Toppings', 'Foam', 'Existing logos', 'Decorations', 'Whipped cream']
      },
      visualBenefits: [
        'Logo appears on clean cup surface',
        'No interference from drink contents',
        'Optimal contrast against cup material',
        'Professional commercial appearance'
      ],
      debugInfo: {
        approach: '5% from bottom positioning (very low)',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[Test-FivePercent] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      result: null
    }, { status: 500 });
  }
}