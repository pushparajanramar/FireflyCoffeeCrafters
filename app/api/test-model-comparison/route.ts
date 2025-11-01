import { NextRequest, NextResponse } from 'next/server';
import { generateDrinkImageCustom, generateDrinkImageStandard } from '@/lib/adobe-firefly';

export async function POST(request: NextRequest) {
  try {
    console.log('[Test-ModelComparison] Testing custom vs standard model comparison');
    
    const { prompt, negativePrompt } = await request.json();
    
    if (!prompt) {
      return NextResponse.json({ 
        error: 'prompt is required',
        success: false 
      }, { status: 400 });
    }

    console.log('[Test-ModelComparison] Prompt:', prompt);
    if (negativePrompt) {
      console.log('[Test-ModelComparison] Negative prompt:', negativePrompt);
    }
    
    const startTime = Date.now();
    
    // Generate with both models in parallel for comparison
    const [customResult, standardResult] = await Promise.allSettled([
      generateDrinkImageCustom(prompt, negativePrompt),
      generateDrinkImageStandard(prompt, negativePrompt)
    ]);
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;

    // Process results
    const customImage = customResult.status === 'fulfilled' ? customResult.value : null;
    const customError = customResult.status === 'rejected' ? customResult.reason?.message : null;
    
    const standardImage = standardResult.status === 'fulfilled' ? standardResult.value : null;
    const standardError = standardResult.status === 'rejected' ? standardResult.reason?.message : null;

    return NextResponse.json({
      success: true,
      comparison: {
        customModel: {
          success: !!customImage,
          imageUrl: customImage,
          error: customError,
          modelId: 'urn:aaid:sc:VA6C2:2b3a8a94-767c-488d-afd4-f766e4e41256',
          modelVersion: 'image3_custom',
          endpoint: 'generate-async',
          isAsync: true,
          benefits: [
            'Specialized for coffee cup generation',
            'Better understanding of coffee aesthetics',
            'Improved cup shapes and proportions',
            'Enhanced beverage rendering',
            'Consistent coffee shop quality',
            'Custom training on coffee imagery'
          ]
        },
        standardModel: {
          success: !!standardImage,
          imageUrl: standardImage,
          error: standardError,
          modelId: 'firefly-standard',
          modelVersion: 'standard',
          endpoint: 'generate',
          isAsync: false,
          benefits: [
            'General purpose image generation',
            'Faster generation (no polling)',
            'Standard Firefly capabilities',
            'No custom model dependencies',
            'Immediate response',
            'Wider variety of subjects'
          ]
        }
      },
      performance: {
        totalTimeMs: totalTime,
        totalTimeSeconds: (totalTime / 1000).toFixed(2),
        parallelGeneration: true,
        note: 'Custom model may take longer due to async processing and polling'
      },
      recommendations: {
        useCustomModel: customImage && !customError,
        reasoning: customImage && !customError ? 
          'Custom model succeeded and should provide better coffee-specific results' :
          standardImage && !standardError ?
          'Standard model succeeded, use as fallback when custom model fails' :
          'Both models failed, check prompts and API status'
      },
      technicalDetails: {
        prompt: prompt,
        negativePrompt: negativePrompt || 'None',
        imageSize: '1024x1024',
        stylePresets: ['photo'],
        customModelConfig: {
          asyncPolling: true,
          maxPollAttempts: 30,
          pollIntervalSeconds: 10
        }
      },
      debugInfo: {
        approach: 'Parallel model comparison',
        timestamp: new Date().toISOString(),
        customModelAvailable: !!customImage,
        standardModelAvailable: !!standardImage
      }
    });

  } catch (error) {
    console.error('[Test-ModelComparison] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      troubleshooting: [
        'Check if custom model ID is correct',
        'Verify Adobe Firefly API credentials',
        'Ensure custom model is trained and available',
        'Check API quotas and limits',
        'Verify network connectivity'
      ]
    }, { status: 500 });
  }
}