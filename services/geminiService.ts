import { GoogleGenAI } from "@google/genai";

// Note: In a real "local" app context where user inputs API key, 
// we would fetch the key from the DB settings. 
// For this demo, we assume the environment variable or a passed key.

export const generatePlanSuggestion = async (
    userProfileDescription: string, 
    goal: string, 
    apiKey: string
): Promise<string> => {
    if (!apiKey) throw new Error("API Key required");

    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
        به عنوان یک مربی بدنسازی حرفه‌ای، یک برنامه تمرینی کلی برای ورزشکاری با مشخصات زیر پیشنهاد بده:
        مشخصات: ${userProfileDescription}
        هدف: ${goal}
        
        پاسخ باید به زبان فارسی، کوتاه، علمی و انگیزشی باشد. 
        فقط کلیات برنامه (تعداد روز در هفته، سیستم تمرینی) را بگو، نه جزئیات حرکات.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || "خطا در دریافت پاسخ از هوش مصنوعی.";
    } catch (error) {
        console.error("Gemini Error:", error);
        return "خطا در ارتباط با هوش مصنوعی. لطفا کلید API را بررسی کنید.";
    }
};

export const suggestExercisesForMuscle = async (muscle: string, apiKey: string): Promise<string[]> => {
    if (!apiKey) return [];
    
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `5 تمرین موثر بدنسازی برای عضله "${muscle}" لیست کن. فقط نام تمرین‌ها را به فارسی در فرمت JSON آرایه رشته‌ها برگردان. مثال: ["پرس سینه", "قفسه سینه"]`;
    
    try {
         const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        });
        const text = response.text;
        if(text) return JSON.parse(text);
        return [];
    } catch (e) {
        console.error(e);
        return [];
    }
}
