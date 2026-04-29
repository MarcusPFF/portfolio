Den her uge byggede jeg en RAG-chatbot ind på siden, så den faktisk ved noget om mig i stedet for bare at gætte. Du kan prøve den nede i hjørnet.

Kort fortalt: jeg har taget mit CV (og mine ture, projekter, kurser) og oversat det til vektorer, altså lange rækker af tal, og gemt det i en Supabase-database. Når du stiller et spørgsmål, bliver det også lavet om til en vektor, og så finder mit API de stykker tekst der ligger tættest på. De stykker ryger over i Llama 3.3, der bruger dem til at skrive et svar.

Flow:

1. Min første version proppede bare hele mit CV ind i system-prompten. Det virkede sådan set, men det var dyrt på tokens og det ville aldrig skalere hvis jeg ville have mere indhold med.
2. Læste mig lidt ind på RAG. Idéen er egentlig ret enkel: hent kun det der er relevant for spørgsmålet, og giv det til modellen i stedet for at smide alt ind.
3. Satte Supabase op med pgvector så jeg kunne gemme embeddings direkte i databasen. Første gang jeg arbejder med vektorer på den måde, og det var faktisk overraskende ligetil at komme i gang.
4. Skrev et embed-script der deler teksterne op i mindre stykker (chunks) og laver embeddings af hver enkelt.
5. Valgte Google Gemini til embeddings. Det er billigt og kvaliteten er god nok til det jeg laver.
6. Selve svaret kommer fra Groq med Llama 3.3 70B. Det streamer rigtig hurtigt, og prisen er til at leve med.
7. Min første retrieval var ærligt talt skidt. Den hentede for få chunks, og jeg havde sat tærsklen for højt, så jeg fik tomme eller halve svar tilbage.
8. Skruede op til 15 chunks og sænkede threshold til 0.2. Det ramte væsentligt bedre, den fangede det relevante uden at jeg fik en hel mur af tekst stoppet ind i konteksten.
9. På et tidspunkt opdagede jeg at chatten faktisk kun vidste ting fra min marcus.md. Den anede ikke noget om mine motorcykelture, mine projekter eller kurserne. Det var lidt en aha-oplevelse.
10. Skrev embed-scriptet om så det også henter fra lib/data.ts, lib/trips.ts og alle markdown-filerne i course-blogs. Pludselig kunne den svare på meget mere.
11. Fjernede så al det data jeg havde stoppet ind i system-prompten i starten. Nu står der bare et lille anker, altså hvem jeg er og hvad jeg laver, og resten kommer ind via retrieval.
12. Til sidst satte jeg en GitHub Action op der automatisk kører embed-scriptet når noget af kildedataen ændrer sig. Det betyder at jeg ikke skal huske at re-embedde manuelt hver gang jeg opdaterer en tekst.

Det store skift for mig i den her opgave var at slippe idéen om at modellen skal vide alting på forhånd. Det fungerer langt bedre at lade den hente det den skal bruge i øjeblikket.
