"use server";

import { GoogleGenAI } from "@google/genai";

// Export the type to fix TS2459
export type PDFProcessResult =
  | { fileName: string; summary: string }
  | { fileName: string; error: string };

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

// Check if the API key is actually set
if (!apiKey) {
  console.error("FATAL: GEMINI_API_KEY environment variable is not set!");
  // Optionally, you could throw an error here or handle it differently
  // For now, let's try initializing with an empty string, but the error is logged.
}

const ai = new GoogleGenAI({ apiKey: apiKey ?? "" }); // Initialize with the potentially checked key

export async function processPDF(formData: FormData): Promise<PDFProcessResult> {
  const file = formData.get("file") as File | null;
  const prompt = (formData.get("prompt") as string) || "Summarize this document";
  const fileName = file?.name || "Unknown File";

  try {
    if (!file) {
      throw new Error("No file found in FormData");
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileSizeMB = file.size / (1024 * 1024);

    // Prepare content for small PDFs (<20MB)
    const inlineContents = [
      { text: prompt },
      {
        inlineData: {
          mimeType: file.type || "application/pdf",
          data: fileBuffer.toString("base64"),
        },
      },
    ];

    let response;

    if (fileSizeMB > 20 && fileSizeMB <= 2000) {
      console.log(`[PDF Processing] Using File API for large PDF: ${fileName} (${fileSizeMB.toFixed(2)} MB)`);

      // Create a Blob to fix TS2353
      const fileBlob = new Blob([fileBuffer], { type: file.type || "application/pdf" });

      // Upload the file
      const uploadedFile = await ai.files.upload({
        file: fileBlob,
        config: {
          displayName: fileName,
        },
      });

      if (!uploadedFile.name) {
        throw new Error("Uploaded file name is undefined after File API upload");
      }
      console.log(`[PDF Processing] File uploaded: ${uploadedFile.name}, waiting for processing...`);

      // Wait for processing
      let getFile = await ai.files.get({ name: uploadedFile.name });
      const startTime = Date.now();
      const timeout = 120000;

      while (getFile.state === "PROCESSING" && Date.now() - startTime < timeout) {
        console.log(`[PDF Processing] File state: ${getFile.state}, waiting 5s...`);
        await new Promise((resolve) => setTimeout(resolve, 5000));
        getFile = await ai.files.get({ name: uploadedFile.name });
      }

      if (getFile.state === "FAILED") {
        console.error(`[PDF Processing] File processing failed for ${uploadedFile.name}`, getFile);
        throw new Error(`File processing failed. State: ${getFile.state}`);
      }
      if (getFile.state !== "ACTIVE") {
        console.error(`[PDF Processing] File processing timed out or ended in unexpected state for ${uploadedFile.name}: ${getFile.state}`);
        throw new Error(`File processing did not complete successfully. Final State: ${getFile.state}`);
      }

      console.log(`[PDF Processing] File processed successfully: ${uploadedFile.name}`);

      // Prepare content using the processed file URI
      const fileApiContent = [
        { text: prompt },
        {
          fileData: {
            fileUri: getFile.uri!,
            mimeType: getFile.mimeType!,
          },
        },
      ];

      response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: fileApiContent,
      });
      console.log(`[PDF Processing] Content generated using File API for ${fileName}`);
    } else if (fileSizeMB <= 20) {
      console.log(`[PDF Processing] Processing small PDF inline: ${fileName} (${fileSizeMB.toFixed(2)} MB)`);
      response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: inlineContents,
      });
      console.log(`[PDF Processing] Content generated inline for ${fileName}`);
    } else {
      throw new Error(`File size (${fileSizeMB.toFixed(2)} MB) exceeds the maximum limit of 2GB.`);
    }

    // Extract text result
    const textResult = response?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof textResult !== "string") {
      console.error("[PDF Processing] Invalid response structure from Gemini:", response);
      throw new Error("Failed to get valid text summary from the PDF.");
    }

    return {
      fileName,
      summary: textResult,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error processing PDF";
    console.error(`[PDF Processing] Error for ${fileName}:`, errorMessage);
    return {
      error: errorMessage,
      fileName,
    };
  }
}