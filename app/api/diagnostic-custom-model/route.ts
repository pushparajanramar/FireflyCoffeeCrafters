import { NextRequest, NextResponse } from 'next/server';
import { APP_CONFIG } from '@/lib/config';
const fireflyConfig = require('@/lib/firefly-config');

export async function GET(request: NextRequest) {
  try {
    console.log('[CustomModel-Diagnostic] Running custom model diagnostic check');

    // Test custom model configuration
    const diagnostics = {
      configuration: {
        useCustomModel: APP_CONFIG.USE_CUSTOM_MODEL,
        customModelId: APP_CONFIG.CUSTOM_MODEL_ID,
        modelVersion: fireflyConfig.CUSTOM_MODEL.MODEL_VERSION,
        asyncEndpoint: fireflyConfig.GENERATE_IMAGE_ASYNC_URL,
        standardEndpoint: fireflyConfig.GENERATE_IMAGE_URL
      },
      environment: {
        customModelEnvVar: process.env.USE_FIREFLY_CUSTOM_MODEL || 'not set',
        customModelIdEnvVar: process.env.FIREFLY_CUSTOM_MODEL_ID || 'not set',
        clientId: process.env.ADOBE_CLIENT_ID ? 'configured' : 'missing',
        clientSecret: process.env.ADOBE_CLIENT_SECRET ? 'configured' : 'missing'
      },
      recommendations: [] as string[],
      status: 'unknown'
    };

    // Analyze configuration and provide recommendations
    if (!APP_CONFIG.USE_CUSTOM_MODEL) {
      diagnostics.recommendations.push('Custom model is disabled - using standard Firefly model');
      diagnostics.status = 'standard_model_active';
    } else {
      diagnostics.recommendations.push('Custom model is enabled');
      
      if (!diagnostics.environment.clientId || !diagnostics.environment.clientSecret) {
        diagnostics.recommendations.push('ERROR: Adobe API credentials are missing');
        diagnostics.status = 'credentials_missing';
      } else {
        diagnostics.status = 'custom_model_configured';
      }
      
      // Check model ID format
      if (!APP_CONFIG.CUSTOM_MODEL_ID.startsWith('urn:aaid:sc:')) {
        diagnostics.recommendations.push('WARNING: Custom model ID format may be incorrect (should start with "urn:aaid:sc:")');
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Custom model diagnostic completed',
      diagnostics,
      troubleshooting: {
        commonIssues: [
          'Custom model ID is incorrect or inactive',
          'Model not trained or still processing',
          'Insufficient permissions for custom model',
          'API quotas exceeded',
          'Model ID typo or formatting error'
        ],
        solutions: [
          'Verify custom model ID in Adobe Firefly dashboard',
          'Check model status and training completion',
          'Ensure API credentials have custom model permissions',
          'Try disabling custom model temporarily (set USE_FIREFLY_CUSTOM_MODEL=false)',
          'Test with standard model first to verify basic API connectivity'
        ]
      },
      quickFix: {
        disableCustomModel: {
          description: 'Temporarily disable custom model to use standard Firefly',
          instruction: 'Set environment variable USE_FIREFLY_CUSTOM_MODEL=false',
          impact: 'Will use standard Firefly model instead of custom coffee model'
        }
      }
    });

  } catch (error) {
    console.error('[CustomModel-Diagnostic] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Diagnostic check failed'
    }, { status: 500 });
  }
}