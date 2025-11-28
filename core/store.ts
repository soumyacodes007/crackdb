import fs from 'fs';
import { v4 as uuid } from 'uuid';
import { config } from '../config';
import { cosineSimilarity } from '../utils/math';
import { VectorRecord, VectorStoreData, SearchResult } from '../types';

export class VectorStore {
    private data: VectorStoreData;
    private filePath: string;

    constructor() {
        this.filePath = config.vectorFilePath;
        this.data = this.loadData();
    }

    private loadData(): VectorStoreData {
        if (!fs.existsSync(this.filePath)) return {};
        try {
            return JSON.parse(fs.readFileSync(this.filePath, 'utf-8'));
        } catch (e) {
            console.error("Error loading vectors:", e);
            return {};
        }
    }

    private saveData(): void {
        fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
    }

    public add(vector: number[], metadata: any): string {
        const id = uuid();
        this.data[id] = { id, vector, metadata };
        this.saveData();
        return id;
    }

    public get(id: string): VectorRecord | undefined {
        return this.data[id];
    }

    public search(queryVector: number[], topK: number = 5, threshold: number = 0): SearchResult[] {
        return Object.values(this.data)
            .map(record => ({
                id: record.id,
                score: cosineSimilarity(queryVector, record.vector),
                metadata: record.metadata,
            }))
            .filter(r => r.score >= threshold)
            .sort((a, b) => b.score - a.score)
            .slice(0, topK);
    }
}