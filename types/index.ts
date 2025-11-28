export type Vector = number[];

export interface VectorRecord {
    id: string;
    vector: Vector;
    metadata?: Record<string, any>;
}

export interface SearchResult {
    id: string;
    score: number;
    metadata?: Record<string, any>;
}

export interface VectorStoreData {
    [key: string]: VectorRecord;
}