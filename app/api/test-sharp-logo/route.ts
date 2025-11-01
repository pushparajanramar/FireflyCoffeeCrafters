import { NextRequest, NextResponse } from 'next/server';
import { sharpLogoCompositingServer } from '@/lib/adobe-firefly-server';

export async function GET(request: NextRequest) {
  try {
    console.log('[API] Starting Sharp logo test');
    
    // Test with a sample coffee image and our Starbucks logo
    const testImageUrl = 'https://cdn.openai.com/API/docs/images/example_generations/hot_coffee_1.png'; // OpenAI example image
    const logoUrl = 'https://sbux-logo.s3.us-east-2.amazonaws.com/Starbucks_Corporation_Logo_.png';
    
    console.log('[API] Testing with base image:', testImageUrl);
    console.log('[API] Testing with logo:', logoUrl);
    
    const result = await sharpLogoCompositingServer(testImageUrl, logoUrl);
    
    if (result) {
      console.log('[API] Sharp compositing successful');
      return NextResponse.json({
        success: true,
        imageDataUrl: result,
        message: 'Sharp logo compositing test successful'
      });
    } else {
      console.log('[API] Sharp compositing failed');
      return NextResponse.json({
        success: false,
        message: 'Sharp logo compositing failed'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('[API] Sharp logo test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Sharp logo compositing test failed'
    }, { status: 500 });
  }
}