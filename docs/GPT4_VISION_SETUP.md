# GPT-4 Vision Logo Placement System

## Environment Variables Required

Add these to your `.env.local` file:

```env
# OpenAI API Key for GPT-4 Vision
OPENAI_API_KEY=your_openai_api_key_here

# Adobe Firefly credentials (existing)
ADOBE_CLIENT_ID=your_adobe_client_id
ADOBE_CLIENT_SECRET=your_adobe_client_secret
ADOBE_ORG_ID=your_adobe_org_id
```

## Testing Endpoints

1. **Test OpenAI Vision API Directly**
   ```
   GET /api/test-openai-vision
   ```
   Tests basic cup detection and advanced image analysis with GPT-4 Vision.

2. **Test Complete GPT-4 Vision Workflow**
   ```
   GET /api/test-gpt4-vision
   ```
   Generates a coffee image, analyzes it with GPT-4 Vision, and places the logo intelligently.

3. **Test Complete Logo Workflow**
   ```
   GET /api/test-complete-logo
   ```
   Tests the full logo compositing workflow with the enhanced AI placement.

## Features

### Intelligent Cup Detection
- Uses GPT-4 Vision to analyze coffee cup images
- Detects cup coordinates, type, and optimal logo placement areas
- Provides multiple placement suggestions with confidence scores

### Advanced Logo Placement
- Precisely positions logos based on detected cup coordinates
- Scales logos proportionally to cup dimensions (35-40% of cup width)
- Provides multiple fallback strategies for robust placement

### Comprehensive Analysis
- Cup type detection (paper, plastic, ceramic, glass)
- Image quality assessment (lighting, background complexity)
- Multiple placement area suggestions (center, upper, lower, etc.)

## How It Works

1. **Image Analysis**: GPT-4 Vision analyzes the coffee image and returns:
   - Primary cup coordinates and characteristics
   - Alternative placement suggestions
   - Overall image analysis (lighting, background, cup count)

2. **Intelligent Sizing**: Logo size is calculated as a percentage of the detected cup width:
   - Primary placement: 40% of cup width
   - Alternative placements: 35% of cup width

3. **Precise Positioning**: Uses detected cup center coordinates to place the logo exactly on the cup surface

4. **Fallback Strategy**: Multiple layers of fallback:
   - GPT-4 Vision primary detection
   - GPT-4 Vision alternative suggestions
   - Basic Sharp center placement
   - Adobe Firefly object composite (final fallback)

## Benefits

- **Intelligent Placement**: No more logos in backgrounds or wrong positions
- **Adaptive Sizing**: Logo size adapts to actual cup dimensions
- **Robust Fallbacks**: Multiple strategies ensure logo placement succeeds
- **High Accuracy**: GPT-4 Vision provides precise cup detection and analysis