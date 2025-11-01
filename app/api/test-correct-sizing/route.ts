import { NextRequest, NextResponse } from 'next/server';
import { intelligentSharpLogoCompositingServer } from '@/lib/adobe-firefly-server';

export async function POST(request: NextRequest) {
  try {
    console.log('[Test-CorrectSizing] Testing corrected logo sizing');
    
    const { baseImageUrl, logoUrl } = await request.json();
    
    if (!baseImageUrl || !logoUrl) {
      return NextResponse.json({ 
        error: 'Both baseImageUrl and logoUrl are required',
        success: false 
      }, { status: 400 });
    }

    console.log('[Test-CorrectSizing] Base image:', baseImageUrl);
    console.log('[Test-CorrectSizing] Logo:', logoUrl);
    
    // Test the corrected sizing logic
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
      message: 'Logo compositing completed with corrected sizing',
      sizingImprovements: [
        'Reduced logo size from 40% to 25% of cup width',
        'Added maximum size constraint: 15% of image width',
        'Conservative fallback sizing: 20% of image dimensions',
        'Size validation prevents oversized logos',
        'Maintains 60% transparency and lower placement'
      ],
      placementEnhancements: [
        'GPT-4 Vision requests 70% down placement',
        'Detailed points: Additional 6% downward adjustment',
        'Basic coordinates: Total 8% downward adjustment',
        'Handle exclusion from width calculations'
      ],
      debugInfo: {
        approach: 'Conservative sizing with intelligent placement',
        maxLogoConstraint: '15% of image width',
        cupWidthPercentage: '25% of detected cup width',
        fallbackSizing: '20% of image dimensions',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[Test-CorrectSizing] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      result: null
    }, { status: 500 });
  }
}