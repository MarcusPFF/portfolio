<!--
  Blogindlæg for Course 2 + 3 (RAG chatbot).
  Skriv din egen tekst med markdown — overskrifter (#, ##), lister (-, 1.),
  fed (**...**), kursiv (*...*), kode (`...`), links [tekst](url), osv.
  Renders automatisk på /llm/course2/blog ved næste build.
-->

I denne uge har jeg smidt en RAG-chatbot (Retrieval-Augmented Generation) på siden, så den ikke bare står og gætter. Rent teknisk har jeg oversat hele mit CV til matematiske vektorer og lagt det i en Supabase-database. Når du stiller et spørgsmål, bliver det også lavet om til en vektor. Så sammenligner mit API de to vektorer for at finde de steder i mit CV, der bedst matcher det du spørger om. Til sidst ryger teksten over i Llama-3, som bruger den til at stykke et fornuftigt svar sammen.

Flow: