I denne uge har jeg smidt en RAG-chatbot (Retrieval-Augmented Generation) på siden, så den ikke bare står og gætter. Rent teknisk har jeg oversat hele mit CV til matematiske vektorer og lagt det i en Supabase-database. Når du stiller et spørgsmål, bliver det også lavet om til en vektor. Så sammenligner mit API de to vektorer for at finde de steder i mit CV, der bedst matcher det du spørger om. Til sidst ryger teksten over i Llama-3, som bruger den til at stykke et fornuftigt svar sammen.

Flow:

1. Første version proppede hele mit CV ind i system-prompten. Det virkede, men det var spild af tokens og kunne ikke skalere.
2. Læste mig ind på RAG. Idéen er simpel: hent kun det der er relevant, og giv det til modellen.
3. Satte Supabase op med pgvector så jeg kunne gemme embeddings i en database.
4. Skrev et embed-script der deler teksten op i chunks og laver embeddings.
5. Valgte Google Gemini til embeddings. Billigt og god kvalitet.
6. Valgte Groq med Llama 3.3 70B til selve svaret. Det streamer hurtigt, og prisen er til at leve med.
7. Første retrieval var dårligt. Den hentede for få chunks og tærsklen var for høj, så jeg fik tomme svar.
8. Justerede til top 15 chunks med threshold 0.2. Det fangede mere af det relevante uden at flyde ud.
9. Indså at chatten kun vidste ting fra marcus.md. Den vidste ikke noget om mine motorcykelture, projekter eller kurser.
10. Skrev embed-scriptet om så det også henter fra lib/data.ts, lib/trips.ts og course-blogs/*.md.
11. Fjernede alt det inline data fra system-prompten. Nu står der bare et lille anker (rolle + status), resten kommer fra retrieval.
12. Satte en GitHub Action op der kører embed-scriptet automatisk når data ændrer sig.

Det største skift var at lade være med at proppe alt ind i system-prompten og i stedet lade modellen hente det den skal bruge.
