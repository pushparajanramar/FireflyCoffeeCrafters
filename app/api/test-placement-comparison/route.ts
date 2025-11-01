import { NextRequest, NextResponse } from 'next/server';
import { getCupCoordinates, getDetailedCupPoints } from '@/lib/openai-vision';

export async function POST(request: NextRequest) {
  try {
    console.log('[Test-Comparison] Starting logo placement comparison test');
    
    const { imageUrl } = await request.json();
    
    if (!imageUrl) {
      return NextResponse.json({ 
        error: 'imageUrl is required',
        success: false 
      }, { status: 400 });
    }

    console.log('[Test-Comparison] Analyzing image:', imageUrl);
    
    // Test both approaches
    const [basicCoords, detailedPoints] = await Promise.all([
      getCupCoordinates(imageUrl),
      getDetailedCupPoints(imageUrl)
    ]);

    // Simulate image dimensions (assuming 2048x2048)
    const imageWidth = 2048;
    const imageHeight = 2048;

    const comparison = {
      basicApproach: {
        available: !!basicCoords,
        coordinates: basicCoords,
        placementStrategy: 'Center detection with 4% foam adjustment',
        finalPosition: basicCoords ? {
          x: Math.round(basicCoords.x * imageWidth),
          y: Math.round((basicCoords.y * imageHeight) + (imageHeight * 0.04)) // 4% foam adjustment
        } : null
      },
      detailedApproach: {
        available: !!detailedPoints,
        coordinates: detailedPoints,
        placementStrategy: 'Multiple reference points with targetCenter optimization',
        finalPosition: detailedPoints ? {
          x: Math.round(detailedPoints.targetCenter.x * imageWidth),
          y: Math.round(detailedPoints.targetCenter.y * imageHeight)
        } : null,
        additionalMeasurements: detailedPoints ? {
          rimWidth: Math.abs(detailedPoints.cupStructure.rimRightX - detailedPoints.cupStructure.rimLeftX) * imageWidth,
          cupHeight: Math.abs(detailedPoints.cupStructure.bottomY - detailedPoints.cupStructure.rimY) * imageHeight,
          confidence: detailedPoints.confidence,
          rimY: detailedPoints.cupStructure.rimY * imageHeight,
          bottomY: detailedPoints.cupStructure.bottomY * imageHeight,
          cupCenterX: detailedPoints.cupStructure.cupCenterX * imageWidth
        } : null
      }
    };

    // Calculate differences if both are available
    let positionDifference = null;
    if (comparison.basicApproach.finalPosition && comparison.detailedApproach.finalPosition) {
      const deltaX = comparison.detailedApproach.finalPosition.x - comparison.basicApproach.finalPosition.x;
      const deltaY = comparison.detailedApproach.finalPosition.y - comparison.basicApproach.finalPosition.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      positionDifference = {
        deltaX,
        deltaY,
        distance: Math.round(distance),
        percentageDistance: ((distance / imageWidth) * 100).toFixed(2) + '%'
      };
    }

    const recommendation = detailedPoints 
      ? 'Use detailed approach for optimal precision'
      : basicCoords 
      ? 'Use basic approach as fallback'
      : 'No cup detected - use center placement';

    return NextResponse.json({
      success: true,
      imageAnalysis: {
        imageUrl,
        imageDimensions: `${imageWidth}x${imageHeight}`,
        timestamp: new Date().toISOString()
      },
      comparison,
      positionDifference,
      recommendation,
      summary: {
        basicAvailable: !!basicCoords,
        detailedAvailable: !!detailedPoints,
        preferredMethod: detailedPoints ? 'detailed' : basicCoords ? 'basic' : 'center',
        improvementFromDetailed: positionDifference ? `${positionDifference.distance}px more precise` : 'N/A'
      }
    });

  } catch (error) {
    console.error('[Test-Comparison] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }, { status: 500 });
  }
}