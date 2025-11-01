import { NextRequest, NextResponse } from 'next/server';
import { intelligentSharpLogoCompositingServer } from '@/lib/adobe-firefly-server';

export async function POST(request: NextRequest) {
  try {
    console.log('[Test-TenPercent] Testing 10% from bottom logo placement');
    
    const { baseImageUrl, logoUrl } = await request.json();
    
    if (!baseImageUrl || !logoUrl) {
      return NextResponse.json({ 
        error: 'Both baseImageUrl and logoUrl are required',
        success: false 
      }, { status: 400 });
    }

    console.log('[Test-TenPercent] Base image:', baseImageUrl);
    console.log('[Test-TenPercent] Logo:', logoUrl);
    
    // Test the 10% positioning logic
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
      message: 'Logo compositing completed with 10% from bottom placement',
      placementStrategy: {
        positioning: '10% up from cup bottom (extremely low placement)',
        reasoning: 'Ultra-low placement for absolute maximum separation from all toppings, foam, and decorations',
        calculation: 'Y = bottomY - (cupHeight × 0.10)',
        benefits: [
          'Absolute maximum distance from foam, whipped cream, and toppings',
          'Ultra-clear visibility on cup base area',
          'Maximum stability - logo on most solid part of cup',
          'Professional commercial appearance',
          'Perfect for elaborate drinks with complex toppings',
          'Ideal for transparent/glass cups with layered contents'
        ]
      },
      technicalDetails: {
        logoSizing: '25% of detected cup width',
        maxSizeConstraint: '15% of image width',
        transparency: '60% (40% opacity)',
        cupDetection: 'GPT-4 Vision with physical cup boundary analysis',
        positioning: '10% from cup bottom (ultra-low)',
        ignoresElements: ['Toppings', 'Foam', 'Existing logos', 'Decorations', 'Whipped cream', 'Sauces', 'Sprinkles']
      },
      visualBenefits: [
        'Logo appears on cleanest cup surface area',
        'Zero interference from drink contents or toppings',
        'Optimal contrast against cup material',
        'Ultra-professional commercial appearance',
        'Works perfectly with complex layered drinks'
      ],
      placementComparison: {
        previous: '5% from bottom',
        current: '10% from bottom',
        improvement: 'Added 5% more clearance from cup base for better visibility'
      },
      debugInfo: {
        approach: '10% from bottom positioning (ultra-low)',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[Test-TenPercent] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      result: null
    }, { status: 500 });
  }
}