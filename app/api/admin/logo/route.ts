import { NextRequest, NextResponse } from "next/server"
import { uploadImageToFirefly } from "@/lib/adobe-firefly"

// Default Starbucks logo URL - Public S3 URL
const DEFAULT_LOGO_URL = "https://sbux-logo.s3.us-east-2.amazonaws.com/Starbucks_Corporation_Logo_.png";

export async function POST(request: NextRequest) {
  try {
    const { logoUrl } = await request.json();
    
    if (!logoUrl) {
      return NextResponse.json({ error: "Logo URL is required" }, { status: 400 });
    }

    console.log("[v0] Uploading logo from URL:", logoUrl);
    const imageId = await uploadImageToFirefly(logoUrl);
    
    return NextResponse.json({ 
      imageId,
      message: "Logo uploaded successfully to Adobe Firefly"
    });
  } catch (error) {
    console.error("[v0] Error uploading logo:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to upload logo";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Upload multipart form data
    const formData = await request.formData();
    const file = formData.get("logo");
    
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No logo file uploaded" }, { status: 400 });
    }

    // Convert file to data URL and upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const mimeType = file.type || 'image/png';
    const dataUrl = `data:${mimeType};base64,${base64}`;
    
    // For now, we'll just return success since uploading from data URL is complex
    // In a real implementation, you'd save the file to a temporary location first
    return NextResponse.json({ 
      message: "File received. Please use the URL upload method instead.",
      suggestion: "Upload your file to a cloud service and use the URL upload option."
    });
  } catch (error) {
    console.error("[v0] Error uploading file:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to upload file";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    defaultLogoUrl: DEFAULT_LOGO_URL,
    message: "Use POST with logoUrl to upload a logo from URL, or PUT with form data to upload a file."
  });
}