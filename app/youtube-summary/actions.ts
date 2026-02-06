'use server';

export async function summarizeYoutubeVideo(youtubeUrl: string) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return { success: false, error: "GEMINI_API_KEY is not configured." };
    }

    if (!youtubeUrl) {
        return { success: false, error: "URL is required." };
    }

    try {
        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": apiKey,
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: "영상의 내용을 아주 상세하고 꼼꼼하게 요약해줘." },
                            {
                                file_data: {
                                    file_uri: youtubeUrl
                                }
                            }
                        ]
                    }]
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            return { success: false, error: `API Error: ${response.status} ${response.statusText} - ${errorText}` };
        }

        const data = await response.json();

        // Extract text from response
        // Response structure usually: candidates[0].content.parts[0].text
        const summary = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!summary) {
            return { success: false, error: "No summary generated." };
        }

        return { success: true, data: summary };

    } catch (error: any) {
        return { success: false, error: error.message || "An unexpected error occurred." };
    }
}
