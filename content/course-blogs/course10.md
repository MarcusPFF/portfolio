Den her uge byggede jeg en pitch-demo til Engestofte Gods, et historisk gods på Lolland der holder bryllupper. Idéen var at vise dem hvordan deres koordinator-flow kunne se ud i en rigtig app i stedet for det Trello-board de bruger i dag. Det ligger på /llm/course10 som en sub-app inden i den her side, med eget visuelt udtryk i stedet for portfoliets pastel-glass-look.

Flow:

1. Først læste jeg system-prompten igennem og afklarede omfanget. Jeg landede på at appen skulle være public for besøgende så de kan klikke rundt og prøve AI'en, og at admin-handlinger som reset og slet ligger bag et simpelt password. Mock-data, ingen rigtig kommunikation til brudepar.
2. Stilen byggede jeg ud fra en analyse af engestofte.com. Cream baggrund, mossy grøn til CTAs, Cormorant Garamond til overskrifter. Det skal føles som deres eget rum, ikke som en portfolio-side.
3. Database delt med portfoliets eksisterende Supabase. Fem tabeller (bryllupper, opgaver, tilkøb, betalinger, overnatninger) plus seed-data med 6 realistiske mock-bryllupper, så dashboardet er fyldt fra dag ét.
4. Phase 1 var basale views. Dashboard med stats, kalender med månedsgrid, bryllupper-liste med filtre, detalje-side per bryllup. Phase 2 tilføjede oprettelse, redigering og status-toggle på opgaver via Server Actions med useActionState.
5. Phase 3 var admin-gatet. Cookie-baseret login, "Reset til seed"-knap der nulstiller demo-data, slet-knap pr. bryllup synlig kun for admin.
6. Phase 4 var AI'en. To separate forslag-engines: opgaver til koordinatoren og tilkøb til pitch hos brudeparret. Begge kører Groq med Llama 3.3 70B via @ai-sdk/groq, samme pakke som course 5. Mit første forsøg brugte generateObject med strict JSON schema, men det fejlede mod Llama's output. Skiftede til generateText med manuel parsing og en retry på fejl. Det viste sig at være mere robust.
7. Security gik jeg igennem som det næste. Tre rate-limit buckets: AI på 6/min (delt med chat og course 5), mutationer på 30/min så folk ikke kan spamme nye bryllupper, og login på 5/min så ingen kan brute-force koden. UUID-validering på alt der tager et bryllups-id. Prompt-injection guard i system-prompten der eksplicit beder modellen om at ignorere instruktioner i brugerfelter som brudepar og noter. Cookien er HttpOnly og scoped til /llm/course10.
8. Til sidst tilføjede jeg en audit log. Tabel i Supabase, fire-and-forget logger der aldrig blokerer den faktiske handling. 12 event-typer fordelt på admin (login success/failure, reset, slet), bryllup (create/update) og AI (generate, approve, fejl). Vises i en filterbar tabel under /admin/log som kun admin har adgang til.

Trello-sync er næste phase. Det afventer at Engestofte sender deres mock-board, så vi har noget at importere fra. Datamodellen er allerede tænkt igennem med trello_list_id og trello_card_id som upsert-nøgler, så sync-knappen bliver additiv og idempotent når data kommer.

Prøv det selv: [Open app →](/llm/course10)
