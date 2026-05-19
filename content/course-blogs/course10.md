Den her uge byggede jeg en pitch-demo til E.G., et historisk gods på Lolland der holder bryllupper. Idéen var at vise dem hvordan deres koordinator-flow kunne se ud i en rigtig app i stedet for det Trello-board de bruger i dag. Det ligger på /llm/course10 som en sub-app inden i den her side, med eget visuelt udtryk i stedet for portfoliets pastel-glass-look.

Flow:

1. Først læste jeg system-prompten igennem og afklarede omfanget. Jeg landede på at appen skulle være public for besøgende så de kan klikke rundt og prøve AI'en, og at admin-handlinger som reset og slet ligger bag et simpelt password. Mock-data, ingen rigtig kommunikation til brudepar.
2. Stilen byggede jeg ud fra en analyse af kundens egen hjemmeside. Cream baggrund, mossy grøn til CTAs, Cormorant Garamond til overskrifter. Det skal føles som deres eget rum, ikke som en portfolio-side.
3. Database delt med portfoliets eksisterende Supabase. Fem tabeller (bryllupper, opgaver, tilkøb, betalinger, overnatninger) plus seed-data med 6 realistiske mock-bryllupper, så dashboardet er fyldt fra dag ét.
4. Phase 1 var basale views. Dashboard med stats, kalender med månedsgrid, bryllupper-liste med filtre, detalje-side per bryllup. Phase 2 tilføjede oprettelse, redigering og status-toggle på opgaver via Server Actions med useActionState.
5. Phase 3 var admin-gatet. Cookie-baseret login, "Reset til seed"-knap der nulstiller demo-data, slet-knap pr. bryllup synlig kun for admin.
6. Phase 4 var AI'en. To separate forslag-engines: opgaver til koordinatoren og tilkøb til pitch hos brudeparret. Begge kører Groq med Llama 3.3 70B via @ai-sdk/groq, samme pakke som course 5. Mit første forsøg brugte generateObject med strict JSON schema, men det fejlede mod Llama's output. Skiftede til generateText med manuel parsing og en retry på fejl. Det viste sig at være mere robust.
7. Security gik jeg igennem som det næste. Tre rate-limit buckets: AI på 6/min (delt med chat og course 5), mutationer på 30/min så folk ikke kan spamme nye bryllupper, og login på 5/min så ingen kan brute-force koden. UUID-validering på alt der tager et bryllups-id. Prompt-injection guard i system-prompten der eksplicit beder modellen om at ignorere instruktioner i brugerfelter som brudepar og noter. Cookien er HttpOnly og scoped til /llm/course10.
8. Tilføjede en audit log. Tabel i Supabase, fire-and-forget logger der aldrig blokerer den faktiske handling. Event-typer fordelt på admin (login success/failure, reset, slet), bryllup (create/update), AI (generate, approve, fejl) og Trello-sync. Vises i en filterbar tabel under /admin/log som kun admin har adgang til.
9. Phase 5 var to-vejs Trello-sync. E.G. havde ikke sendt deres egen skabelon endnu, så jeg definerede formatet selv. Hver liste = ét bryllup, første kort med titel "📋 Bryllup detaljer" indeholder metadata (dato, pakke, lokation, koordinator osv.) i sin description, alle øvrige kort = opgaver. To knapper på admin-siden: "Hent fra Trello" trækker lister og kort ind i Supabase, "Upload til Trello" skubber Supabase-data tilbage. Begge er idempotente på trello_list_id og trello_card_id, additive så sletninger i den ene ende ikke kaskaderer.
10. Til selve pitchet tilføjede jeg tre demo-kontroller: "Reset til seed" indsætter 10 mock-bryllupper med varieret status, "Fjern alle bryllupper" tømmer dashboardet, "Reset Trello board" arkiverer alle lister. Det giver et live-flow under pitchet hvor jeg kan tømme begge ender, vise upload fylde Trello, slette i appen og hente data tilbage fra Trello.

Det eneste der mangler nu er E.G.s faktiske Trello-skabelon. Når den kommer skal parsing-laget i `_lib/trello/mapping.ts` refaktoreres til at matche deres format. Resten af appen står som den er.

## Anonymisering af kunden

Kundens rigtige navn er erstattet med initialerne **E.G.** alle steder i portfolioet — i UI, blogs, AI-prompts, kommentarer, log-præfikser, CSS-klasser, cookie-navn, README og SQL-kommentarer. Selve demoen kører som normalt, men ingen offentligt synlig tekst afslører hvem kunden er. Det her er bevidst: pitchet er endnu ikke vundet, og kunden har ikke givet tilladelse til at deres navn må stå på et public portfolio.

Prøv det selv: [Open app →](/llm/course10)
