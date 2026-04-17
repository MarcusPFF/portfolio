# Marcus Forsberg - Developer Portfolio & RAG Chatbot
   
This project hosts my personal portfolio at [marcuspff.com](https://marcuspff.com/), featuring an intelligent, integrated assistant. The core focus of this repository is its Retrieval-Augmented Generation (RAG) capabilities, answering queries using my actual work history and experience. 

## LLM Course (Exam) Documentation

As part of this portfolio, there is a dedicated section titled **LLM Course (Exam)**. This serves as a live journal where I document my entire learning journey. Every time there is a new course or significant milestone, it is logged and appended there.

## Search & Automation Infrastructure

- **RAG Chatbot:** Powered by Groq (Llama-3) to handle user queries.
- **Vector Database:** Uses Supabase with pgvector. Google Generative AI handles text embeddings.
- **Automation Pipeline:** A GitHub Actions workflow automatically detects changes to the underlying knowledge base (`marcus.md`). On every push to main, the action fires a script that regenerates embeddings and updates the Supabase vector database in real time.

### Why use a Vector Database?
Traditional databases require exact keyword matches, but vector databases understand semantic intent. This allows the AI to accurately retrieve relevant experience from the database even if the user asks their question using entirely different words.

## How the Chatbot Context Works

The chatbot uses a hybrid context approach that blends static injection and vector retrieval to ensure accurate responses:

1. **Short-Term Static Context:** Structural information such as project arrays and skill lists (handled in `lib/data.ts`) are injected into the chatbot's system prompt natively. This anchors the model on factual data without requiring an API lookup, entirely preventing hallucinations about core projects.
2. **Long-Term Retrieval (RAG):** Deep-dive background details and long-form experience notes are stored in `marcus.md`. When a user submits a query:
   - The query itself is vectorized.
   - The API fetches semantically similar knowledge chunks from the Supabase pgvector database.
   - These retrieved contexts are appended directly to the end of the prompt before passing it to Llama-3.


## Setup Instructions

If you intend to test the AI services locally, you will need Node.js and API keys for the interconnected services.

1. Clone the repository and install packages:
   ```bash
   git clone https://github.com/MarcusPFF/portfolio.git
   cd portfolio
   npm install
   ```

2. Establish your environment variables. Create a `.env.local` file:
   ```env
   GROQ_API_KEY=your_groq_key
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   GOOGLE_GENERATIVE_AI_API_KEY=your_google_key
   ```

3. Run the application:
   ```bash
   npm run dev
   ```
