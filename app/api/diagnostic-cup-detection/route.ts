import { NextRequest, NextResponse } from 'next/server';
import { getDetailedCupPoints } from '@/lib/openai-vision';

export async function POST(request: NextRequest) {
  try {
    console.log('[Diagnostic] Starting cup detection diagnostic');
    
    const { imageUrl } = await request.json();
    
    if (!imageUrl) {
      return NextResponse.json({ 
        error: 'imageUrl is required',
        success: false 
      }, { status: 400 });
    }

    console.log('[Diagnostic] Analyzing image:', imageUrl);
    
    // Get detailed cup measurements with full diagnostic info
    const detailedPoints = await getDetailedCupPoints(imageUrl, 2048, 2048);
    
    if (!detailedPoints) {
      return NextResponse.json({
        success: false,
        error: 'Could not detect cup structure',
        diagnostic: 'Vision analysis failed - check image quality and cup visibility'
      });
    }

    // Calculate diagnostic metrics
    const cupWidth = Math.abs(detailedPoints.cupStructure.rimRightX - detailedPoints.cupStructure.rimLeftX);
    const cupHeight = Math.abs(detailedPoints.cupStructure.bottomY - detailedPoints.cupStructure.rimY);
    // Target should be at 10% from bottom: bottomY - (cupHeight * 0.10)
    const targetTenPercentFromBottom = detailedPoints.cupStructure.bottomY - (cupHeight * 0.10);
    const targetIsAtTenPercent = Math.abs(detailedPoints.targetCenter.y - targetTenPercentFromBottom) < 0.03;
    const targetIsCentered = Math.abs(detailedPoints.targetCenter.x - detailedPoints.cupStructure.cupCenterX) < 0.05;

    // Convert to pixel coordinates for visualization
    const pixelCoords = {
      targetCenter: {
        x: Math.round(detailedPoints.targetCenter.x * 2048),
        y: Math.round(detailedPoints.targetCenter.y * 2048)
      },
      cupStructure: {
        rimY: Math.round(detailedPoints.cupStructure.rimY * 2048),
        bottomY: Math.round(detailedPoints.cupStructure.bottomY * 2048),
        rimLeftX: Math.round(detailedPoints.cupStructure.rimLeftX * 2048),
        rimRightX: Math.round(detailedPoints.cupStructure.rimRightX * 2048),
        cupCenterX: Math.round(detailedPoints.cupStructure.cupCenterX * 2048)
      }
    };

    return NextResponse.json({
      success: true,
      detailedPoints: detailedPoints,
      pixelCoordinates: pixelCoords,
      diagnostic: {
        cupWidth: `${(cupWidth * 100).toFixed(1)}% of image width`,
        cupHeight: `${(cupHeight * 100).toFixed(1)}% of image height`,
        aspectRatio: (cupHeight / cupWidth).toFixed(2),
        targetAtTenPercent: targetIsAtTenPercent,
        targetCentered: targetIsCentered,
        confidence: `${detailedPoints.confidence * 100}%`,
        targetPosition: `${(detailedPoints.targetCenter.x * 100).toFixed(1)}%, ${(detailedPoints.targetCenter.y * 100).toFixed(1)}%`,
        rimPosition: `Y: ${(detailedPoints.cupStructure.rimY * 100).toFixed(1)}%`,
        bottomPosition: `Y: ${(detailedPoints.cupStructure.bottomY * 100).toFixed(1)}%`,
        expectedTenPercentPosition: `Y: ${(targetTenPercentFromBottom * 100).toFixed(1)}%`
      },
      analysis: {
        isReasonableCupSize: cupWidth > 0.1 && cupWidth < 0.8 && cupHeight > 0.2 && cupHeight < 0.9,
        targetInCupBounds: detailedPoints.targetCenter.x > detailedPoints.cupStructure.rimLeftX && 
                          detailedPoints.targetCenter.x < detailedPoints.cupStructure.rimRightX &&
                          detailedPoints.targetCenter.y > detailedPoints.cupStructure.rimY &&
                          detailedPoints.targetCenter.y < detailedPoints.cupStructure.bottomY,
        cupCenterReasonable: detailedPoints.cupStructure.cupCenterX > 0.2 && detailedPoints.cupStructure.cupCenterX < 0.8
      },
      recommendations: targetIsAtTenPercent && targetIsCentered ? 
        ['Detection looks accurate', 'Logo should be placed at 10% from bottom'] :
        [
          !targetIsAtTenPercent ? 'Target Y may not be at 10% from bottom' : null,
          !targetIsCentered ? 'Target X may not be centered on cup' : null,
          cupWidth < 0.1 ? 'Cup appears too narrow - check detection' : null,
          cupWidth > 0.8 ? 'Cup appears too wide - may be detecting background' : null
        ].filter(Boolean)
    });

  } catch (error) {
    console.error('[Diagnostic] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      diagnostic: 'System error during analysis'
    }, { status: 500 });
  }
}