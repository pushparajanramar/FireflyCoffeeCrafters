import { NextRequest, NextResponse } from 'next/server';
import { intelligentSharpLogoCompositingServer } from '@/lib/adobe-firefly-server';

export async function POST(request: NextRequest) {
  try {
    console.log('[Test-LowerPlacement] Testing lower logo placement');
    
    const { baseImageUrl, logoUrl } = await request.json();
    
    if (!baseImageUrl || !logoUrl) {
      return NextResponse.json({ 
        error: 'Both baseImageUrl and logoUrl are required',
        success: false 
      }, { status: 400 });
    }

    console.log('[Test-LowerPlacement] Base image:', baseImageUrl);
    console.log('[Test-LowerPlacement] Logo:', logoUrl);
    
    // Test the enhanced logo compositing with lower placement
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
      message: 'Logo compositing completed with enhanced lower placement',
      enhancements: [
        'GPT-4 Vision requests 70% down placement instead of 50%',
        'Detailed points approach: Additional 6% downward adjustment',
        'Basic coordinates approach: Additional 4% downward adjustment (total 8%)',
        '60% logo transparency maintained',
        'Handle exclusion from width calculations'
      ],
      debugInfo: {
        approach: 'Intelligent placement with enhanced downward positioning',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[Test-LowerPlacement] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      result: null
    }, { status: 500 });
  }
}