# PixelForge

Fullstack e-commerce application with an AI customer support and shopping assistant built with React, Express, LangChain, Ollama, and Supabase.

## Prerequisites

- [Node.js](https://nodejs.org/) (v20+ recommended) and npm
- [Ollama](https://ollama.com/) installed and running locally (`http://localhost:11434`)
- A [Supabase](https://supabase.com/) project

## 1. Ollama Setup

Pull a chat model (with tool-calling and thinking support, such as `qwen3`) and an embedding model:

```bash
ollama pull qwen3:8b
ollama pull nomic-embed-text
```

Make sure Ollama is running in the background before seeding or starting the backend.

## 2. Supabase Setup

Run the following SQL in your Supabase **SQL Editor** to enable `pgvector`, create the `documents` table, and add the `match_documents` search function (configured for `768` dimensions to match `nomic-embed-text`):

```sql
create extension if not exists vector;

create table documents (
  id bigserial primary key,
  content text,
  metadata jsonb,
  embedding vector(768)
);

create or replace function match_documents (
  query_embedding vector(768),
  match_count int default null,
  filter jsonb default '{}'
) returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
#variable_conflict use_column
begin
  return query
  select
    id,
    content,
    metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where metadata @> filter
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$;
```

## 3. Backend Setup

1. Navigate to the backend folder and install dependencies:

```bash
cd pixelforge-backend
npm install
```

2. Create a `.env` file inside `pixelforge-backend/`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-api-key
OLLAMA_LLM=qwen3:8b
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
PORT=8080
```

> **Note:** Keep `PORT=8080` as the frontend sends chat requests to `http://localhost:8080/api/chat`.

3. Seed the PDF support documents into Supabase (only run once to avoid duplicates):

```bash
npm run seed
```

4. Start the backend server:

```bash
npm run dev
```

## 4. Frontend Setup

Open a second terminal, navigate to the frontend folder, install the dependencies (including local npm workspaces), and start Vite:

```bash
cd pixelforge-frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.
