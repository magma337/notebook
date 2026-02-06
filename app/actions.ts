'use server'

import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

// Initialize Gemini
// Note: GOOGLE_GENERATIVE_AI_API_KEY must be in .env.local
const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const fileManager = new GoogleAIFileManager(apiKey || '');
const genAI = new GoogleGenerativeAI(apiKey || '');

export async function uploadAndSummarize(formData: FormData) {
    if (!apiKey) {
        return { error: 'Gemini API Key is missing.' };
    }

    const file = formData.get('file') as File;
    if (!file) {
        return { error: 'No file uploaded.' };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Unauthorized.' };
    }

    try {
        // 1. Save file locally (temp) to upload to Gemini
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const tempFilePath = join(tmpdir(), file.name);

        await writeFile(tempFilePath, buffer);

        // 2. Upload to Gemini Files API
        const uploadResult = await fileManager.uploadFile(tempFilePath, {
            mimeType: file.type,
            displayName: file.name,
        });

        const fileUri = uploadResult.file.uri;

        // 3. Generate Summary
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent([
            {
                fileData: {
                    mimeType: uploadResult.file.mimeType,
                    fileUri: fileUri
                }
            },
            { text: "Summarize this file in detail. Provide key points and a structured summary using markdown." }
        ]);

        const summary = result.response.text();

        // 4. Save to Supabase
        const { error: dbError } = await supabase.from('summaries').insert({
            user_id: user.id,
            file_name: file.name,
            file_type: file.type,
            summary_text: summary,
        });

        if (dbError) throw dbError;

        // 5. Cleanup
        await unlink(tempFilePath);

        // Note: Gemini files are temporary (48h). We don't delete from Gemini here to keep it simple, 
        // but in production you might want to delete it if no longer needed context-wise.

        revalidatePath('/dashboard');
        return { success: true };

    } catch (error: any) {
        console.error("Error:", error);
        return { error: error.message || 'Something went wrong.' };
    }
}

export async function deleteSummary(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('summaries').delete().eq('id', id);
    if (error) throw error;
    revalidatePath('/dashboard');
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    return { success: true }
}
