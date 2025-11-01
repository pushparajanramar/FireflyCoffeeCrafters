import { NextRequest, NextResponse } from 'next/server';
import { generateDrinkImageCustom, generateDrinkImageStandard } from '@/lib/adobe-firefly';

export async function POST(request: NextRequest) {
  try {
    console.log('[Test-CustomModel] Testing custom model for coffee cup generation');
    
    const { prompt, negativePrompt, useCustomModel = true } = await request.json();
    
    if (!prompt) {
      return NextResponse.json({ 
        error: 'prompt is required',
        success: false 
      }, { status: 400 });
    }

    console.log('[Test-CustomModel] Prompt:', prompt);
    console.log('[Test-CustomModel] Use custom model:', useCustomModel);
    if (negativePrompt) {
      console.log('[Test-CustomModel] Negative prompt:', negativePrompt);
    }
    
    // Test custom model vs standard model
    let result: string;
    let modelUsed: string;
    
    if (useCustomModel) {
      console.log('[Test-CustomModel] Generating with custom coffee cup model...');
      result = await generateDrinkImageCustom(prompt, negativePrompt);
      modelUsed = 'Custom Coffee Cup Model';
    } else {
      console.log('[Test-CustomModel] Generating with standard Firefly model...');
      result = await generateDrinkImageStandard(prompt, negativePrompt);
      modelUsed = 'Standard Firefly Model';
    }
    
    if (!result) {
      return NextResponse.json({
        success: false,
        error: 'Image generation failed',
        result: null
      });
    }

    return NextResponse.json({
      success: true,
      result: result,
      modelUsed: modelUsed,
      message: `Image generated successfully using ${modelUsed}`,
      customModelConfig: {
        modelId: useCustomModel ? 'urn:aaid:sc:VA6C2:2b3a8a94-767c-488d-afd4-f766e4e41256' : 'N/A',
        modelVersion: useCustomModel ? 'image3_custom' : 'standard',
        endpoint: useCustomModel ? 'generate-async' : 'generate',
        isAsync: useCustomModel
      },
      technicalDetails: {
        prompt: prompt,
        negativePrompt: negativePrompt || 'None',
        useCustomModel: useCustomModel,
        imageSize: '1024x1024',
        stylePresets: ['photo']
      },
      benefits: useCustomModel ? [
        'Specialized for coffee cup generation',
        'Better understanding of coffee aesthetics',
        'Improved cup shapes and proportions',
        'Enhanced beverage rendering',
        'Consistent coffee shop quality'
      ] : [
        'General purpose image generation',
        'Faster generation (no polling)',
        'Standard Firefly capabilities',
        'No custom model dependencies'
      ],
      debugInfo: {
        approach: useCustomModel ? 'Custom Model (Async)' : 'Standard Model (Sync)',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[Test-CustomModel] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      result: null,
      troubleshooting: [
        'Check if custom model ID is correct',
        'Verify Adobe Firefly API credentials',
        'Ensure custom model is trained and available',
        'Check API quotas and limits'
      ]
    }, { status: 500 });
  }
}