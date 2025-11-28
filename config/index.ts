import dotenv from 'dotenv';
dotenv.config();

export const config = {
    port: process.env.PORT || 8080,
    geminiApiKey: process.env.GEMINI_API_KEY as string,
    enableCache: process.env.CACHE_API === 'true',
    vectorFilePath: 'vectors.json'
};