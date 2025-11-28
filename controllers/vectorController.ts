import { Request, Response } from 'express';
import { VectorStore } from '../core/store';
import { generateEmbedding } from '../lib/ai';
import { cacheService } from '../lib/cache';
import { config } from '../config';

const store = new VectorStore();

export const addDocument = async (req: Request, res: Response): Promise<any> => {
    try {
        const { content, metadata } = req.body;
        if (!content) return res.status(400).json({ error: "Content is required" });

        const embedding = await generateEmbedding(content);
        const id = store.add(embedding, metadata);

        return res.status(201).json({ success: true, id });
    } catch (error) {
        return res.status(500).json({ error: "Failed to process document" });
    }
};

export const searchDocuments = async (req: Request, res: Response): Promise<any> => {
    try {
        const { query, threshold = 0.5, topK = 3 } = req.body;
        if (!query) return res.status(400).json({ error: "Query is required" });

        // Cache Key Generation
        const cacheKey = `search:${query}:${threshold}:${topK}`;
        
        if (config.enableCache) {
            const cached = cacheService.get(cacheKey);
            if (cached) {
                console.log('⚡ Serving from Cache');
                return res.json(cached);
            }
        }

        const embedding = await generateEmbedding(query);
        const results = store.search(embedding, topK, threshold);

        if (config.enableCache) {
            cacheService.set(cacheKey, results);
        }

        return res.json(results);
    } catch (error) {
        return res.status(500).json({ error: "Search failed" });
    }
};

export const getVectorById = (req: Request, res: Response): any => {
    const vector = store.get(req.params.id);
    if (!vector) return res.status(404).json({ error: "Not found" });
    return res.json(vector);
};