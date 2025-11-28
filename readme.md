# 🔥 CrackDB

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)

# 🔥 CrackDB

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)

> **A high-performance, lightweight, file-based Vector Database Microservice.**

CrackDB is a standalone semantic search engine that handles vector embeddings, persistence, and cosine-similarity calculations. It's a small, educational RAG-style engine built with TypeScript and Node.js.

---

## 🏗️ System Architecture

CrackDB uses a layered microservice-like structure that separates API handling from core computation and storage.

```mermaid
graph TD
    %% 1. Define Styles
    classDef client fill:#f9f9f9,stroke:#333,stroke-width:2px;
    classDef api fill:#e1f5fe,stroke:#01579b,stroke-width:2px;
    classDef core fill:#fff3e0,stroke:#e65100,stroke-width:2px;
    classDef storage fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px;
    classDef external fill:#f3e5f5,stroke:#4a148c,stroke-width:2px,stroke-dasharray: 5 5;

    %% 2. Define Nodes and Subgraphs
    subgraph Client_Side [User / Client Application]
        Client(Web App / Agent)
    end

    subgraph CrackDB_System [CrackDB Microservice]
        direction TB
        
        subgraph API_Layer [API Interface]
            Router(Express Router)
            Controller(Crack Controller)
            Validator(Input Validation)
        end

        subgraph Core_Engine [Core Engine]
            Vectorizer(Embedder Service)
            MathEngine(Cosine Similarity Algo)
            Cache(MemoryBank / LRU Cache)
        end

        subgraph Persistence_Layer [Persistence]
            DB_Instance(DB Manager)
            FileSystem[(JSON Storage)]
        end
    end

    subgraph External_Cloud [External APIs]
        Gemini[Google Gemini API]
    end

    %% 3. Define Connections
    Client -->|HTTP POST /v1/ingest| Router
    Client -->|HTTP POST /v1/scan| Router
    
    Router --> Validator
    Validator --> Controller

    %% Ingestion Flow
    Controller -->|1. Raw Text| Vectorizer
    Vectorizer -->|2. Get Embeddings| Gemini
    Gemini -->|3. Return Float32 Array| Vectorizer
    Vectorizer -->|4. Vector Data| DB_Instance
    DB_Instance -->|5. Serialize & Write| FileSystem

    %% Query Flow
    Controller -->|Check Cache| Cache
    Cache -.->|Hit| Controller
    Cache -->|Miss| Vectorizer
    Controller -->|Query Vector| MathEngine
    MathEngine -->|Fetch All Vectors| DB_Instance
    MathEngine -->|Compute & Rank| Controller
    Controller -->|Update Cache| Cache

    %% 4. Apply Styles
    class Client client;
    class Router,Controller,Validator api;
    class Vectorizer,MathEngine,Cache core;
    class DB_Instance,FileSystem storage;
    class Gemini external;
```

## Key Features

-  Automated Embedding Generation using external embedding providers.
-  Semantic Search with Cosine Similarity ranking.
-  JSON Persistence (`crack_storage.json`) for zero-setup usage.
-  Smart LRU Caching to reduce repeated embedding calls.
-  TypeScript-first with strict typing for maintainability.

## Project Structure

```
src/
├── config/           # Environment variables & constants
├── controllers/      # HTTP request handlers
├── core/             # Database engine, I/O, in-memory management
├── lib/              # External integrations (Gemini, cache, etc.)
├── routes/           # API route definitions
├── types/            # TypeScript interfaces and types
├── utils/            # Pure functions (cosine math, helpers)
└── index.ts          # Application entry point
```

## 🛠️ Installation & Setup

### Prerequisites

- Node.js v18+
- Google Gemini API key (optional for embeddings)


```

### Install

```bash
npm install
```

### Environment

Create a `.env` in the project root:

```env
PORT=8080
GEMINI_API_KEY=your_google_api_key_here
CACHE_API=true
```

### Run

Development:

```bash
npm run dev
```

Production:

```bash
npm run build
npm start
```

## 📡 API Reference

### POST /v1/ingest

Converts text to a vector and stores it with metadata.

Body example:

```json
{
  "text": "The mitochondria is the powerhouse of the cell.",
  "payload": { "category": "biology", "grade": 10 }
}
```

### POST /v1/scan

Semantic search endpoint.

```json
{
  "query": "What gives a cell energy?",
  "limit": 3,
  "threshold": 0.6
}
```

### GET /v1/doc/:id

Retrieve a document by its ID.



#  Technical Deep Dive: Inside CrackDB

This document provides an engineering overview of how **CrackDB** functions under the hood. It explores the mathematical principles, architectural decisions, and trade-offs made during development.

---

## 1. Vector Embeddings & Dimensionality

At its core, CrackDB relies on **Vector Embeddings**. Computers cannot natively understand the semantic meaning of text. To bridge this gap, we use an external model (Google Gemini `text-embedding-004`) to transform text into numbers.

*   **Input:** "The sky is blue."
*   **Output:** A 768-dimensional array of floating-point numbers: `[0.012, -0.931, 0.442, ...]`.

These numbers represent the text's location in a high-dimensional semantic space. Concepts that are similar (e.g., "King" and "Queen") are located closer together in this space than dissimilar concepts (e.g., "King" and "Blender").

---

## 2. The Math: Cosine Similarity

To find the "nearest neighbor" (the most similar search result), CrackDB does not use keyword matching (like SQL `LIKE` or Regex). Instead, it calculates the **Cosine Similarity** between the Query Vector and every Document Vector in the database.

We use Cosine Similarity over Euclidean Distance because we care about the **angle** of the vectors (the semantic direction), not the magnitude (length).

### The Formula
$$ \text{similarity} = \cos(\theta) = \frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\| \|\mathbf{B}\|} = \frac{\sum_{i=1}^{n} A_i B_i}{\sqrt{\sum_{i=1}^{n} A_i^2} \sqrt{\sum_{i=1}^{n} B_i^2}} $$

### The Implementation (`src/utils/calc.ts`)
The math is manually implemented in pure TypeScript to ensure zero dependencies on heavy math libraries:

```typescript
export function computeCosine(vecA: number[], vecB: number[]): number {
    // 1. Calculate Dot Product
    const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);

    // 2. Calculate Magnitudes (Euclidean Norm)
    const magA = Math.sqrt(vecA.reduce((acc, val) => acc + val ** 2, 0));
    const magB = Math.sqrt(vecB.reduce((acc, val) => acc + val ** 2, 0));

    // 3. Return Cosine Score (0 to 1)
    return dotProduct / (magA * magB);
}
```
