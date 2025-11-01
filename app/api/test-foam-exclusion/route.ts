import { NextRequest, NextResponse } from 'next/server';
import { analyzeImageForCupPlacement } from '@/lib/openai-vision';
import { advancedLogoPlacement } from '@/lib/adobe-firefly-server';

export async function GET(request: NextRequest) {
  try {
    console.log('[API] Testing foam layer exclusion and cup surface detection');
    
    // Test with images that have visible foam layers
    const testImages = [
      {
        name: 'Latte with Foam Art',
        url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop'
      },
      {
        name: 'Cappuccino with Thick Foam',
        url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=400&fit=crop'
      },
      {
        name: 'Coffee with Whipped Cream',
        url: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?w=400&h=400&fit=crop'
      }
    ];
    
    const logoUrl = 'https://sbux-logo.s3.us-east-2.amazonaws.com/Starbucks_Corporation_Logo_.png';
    const results = [];
    
    for (const testImage of testImages) {
      console.log(`[API] Testing ${testImage.name}...`);
      
      try {
        // Analyze for cup detection with foam exclusion
        const analysis = await analyzeImageForCupPlacement(testImage.url);
        
        // Test logo placement with foam-aware positioning
        const placementResult = await advancedLogoPlacement(testImage.url, logoUrl);
        
        results.push({
          name: testImage.name,
          imageUrl: testImage.url,
          analysis: {
            hasFoamLayer: analysis.imageAnalysis?.hasCreamLayer,
            cupDetected: !!analysis.primary,
            cupType: analysis.primary?.cupType,
            confidence: analysis.primary?.confidence,
            originalCoords: {
              y: analysis.primary?.y,
              centerY: analysis.primary?.centerY,
              height: analysis.primary?.height
            },
            foamExclusionApplied: analysis.primary?.y && analysis.primary.y < 0.2
          },
          placement: {
            method: placementResult.method,
            success: !!placementResult.imageUrl,
            finalImageUrl: placementResult.imageUrl
          }
        });
        
      } catch (error) {
        results.push({
          name: testImage.name,
          imageUrl: testImage.url,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Foam layer exclusion test completed',
      foamExclusionFeatures: {
        enhancedPrompts: 'GPT-4 Vision explicitly ignores foam and detects cup walls only',
        coordinateAdjustment: 'Automatic adjustment when foam layer interference is detected',
        cupSurfaceFocus: 'Logo placement targets physical cup surface below foam',
        transparentLogo: '60% transparent logo for realistic cup surface appearance'
      },
      results: results
    });
    
  } catch (error) {
    console.error('[API] Foam exclusion test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Foam layer exclusion test failed'
    }, { status: 500 });
  }
}