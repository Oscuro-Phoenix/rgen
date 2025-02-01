import { NextResponse } from 'next/server';
import Replicate from 'replicate';
import { PDFDocument, StandardFonts } from 'pdf-lib';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: Request) {
  try {
    const { answers } = await req.json();

    // Format the prompt for LLaMA
    const prompt = `Create a professional resume using the following information:
Name: ${answers.name}
Email: ${answers.email}
Work Experience: ${answers.experience}
Education: ${answers.education}
Skills: ${answers.skills}

Please format this as a clean, professional resume with proper sections and formatting.`;

    // Call Replicate's LLaMA model
    const output = await replicate.run(
      "meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3",
      {
        input: {
          prompt,
          max_new_tokens: 1000,
          temperature: 0.7,
          top_p: 0.9,
          system_prompt: "You are a professional resume writer. Create clean, well-formatted resumes."
        }
      }
    );

    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    const resumeContent = Array.isArray(output) ? output.join('') : output;
    
    // Add content to PDF
    page.setFont(font);
    page.drawText(resumeContent, {
      x: 50,
      y: page.getHeight() - 50,
      size: 12,
      maxWidth: page.getWidth() - 100,
    });

    // Generate PDF bytes
    const pdfBytes = await pdfDoc.save();

    // Return PDF with proper headers
    return new Response(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="resume.pdf"',
      },
    });
  } catch (error) {
    console.error('Resume generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate resume' },
      { status: 500 }
    );
  }
} 