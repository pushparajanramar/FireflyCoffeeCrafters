import { NextRequest, NextResponse } from 'next/server';
import { getDetailedCupPoints } from '@/lib/openai-vision';

export async function POST(request: NextRequest) {
  try {
    console.log('[Test-DetailedPoints] Starting detailed cup points analysis test');
    
    const { imageUrl } = await request.json();
    
    if (!imageUrl) {
      return NextResponse.json({ 
        error: 'imageUrl is required',
        success: false 
      }, { status: 400 });
    }

    console.log('[Test-DetailedPoints] Analyzing image:', imageUrl);
    
    // Get detailed cup measurements
    const detailedPoints = await getDetailedCupPoints(imageUrl);
    
    if (!detailedPoints) {
      return NextResponse.json({
        success: false,
        error: 'Could not detect detailed cup points',
        detailedPoints: null
      });
    }

    console.log('[Test-DetailedPoints] Detailed cup points detected:', detailedPoints);

    // Calculate some derived measurements for validation
    const cupWidthAtRim = Math.abs(detailedPoints.cupStructure.rimRightX - detailedPoints.cupStructure.rimLeftX);
    const cupHeight = Math.abs(detailedPoints.cupStructure.bottomY - detailedPoints.cupStructure.rimY);
    
    const measurements = {
      cupWidthAtRim: cupWidthAtRim,
      cupHeight: cupHeight,
      targetCenterX: detailedPoints.targetCenter.x,
      targetCenterY: detailedPoints.targetCenter.y,
      confidence: detailedPoints.confidence,
      rimY: detailedPoints.cupStructure.rimY,
      bottomY: detailedPoints.cupStructure.bottomY,
      cupCenterX: detailedPoints.cupStructure.cupCenterX
    };

    return NextResponse.json({
      success: true,
      detailedPoints: detailedPoints,
      derivedMeasurements: measurements,
      message: `Detailed cup analysis complete with ${detailedPoints.confidence} confidence`,
      debugInfo: {
        rimWidth: `${(cupWidthAtRim * 100).toFixed(2)}% of image width`,
        height: `${(cupHeight * 100).toFixed(2)}% of image height`,
        targetPosition: `(${(detailedPoints.targetCenter.x * 100).toFixed(2)}%, ${(detailedPoints.targetCenter.y * 100).toFixed(2)}%)`,
        rimPosition: `Y: ${(detailedPoints.cupStructure.rimY * 100).toFixed(2)}%`,
        bottomPosition: `Y: ${(detailedPoints.cupStructure.bottomY * 100).toFixed(2)}%`,
        centerAxis: `X: ${(detailedPoints.cupStructure.cupCenterX * 100).toFixed(2)}%`
      }
    });

  } catch (error) {
    console.error('[Test-DetailedPoints] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      detailedPoints: null
    }, { status: 500 });
  }
}