I denne uge kom virksomheden Engestofte Gods ud og snakkede om problemstillinger de ønsker at få løst.

De har problemstillinger inden for Administrator flow, lager håndteringen, deres julemarkede samt bryllups booking.

Ud fra det har jeg udarbejdet en projekt beskrivelse til et idé forslag.

## Projektbeskrivelse

### Projektets arbejdstitel

### Projekttype

Idé- og demonstrationsløsning (pitch). Vi udarbejder en proof-of-concept på baggrund af selvopbygget mock-data, der skal vise Engestofte Gods hvordan deres interne bookingflow fremover kan se ud, hvis de erstatter den nuværende Trello-opsætning. Løsningen er ikke en bestilt produktionsversion endnu — målet er at vinde dem som kunde.

Demoen hostes som en del af mit eksisterende portfolio på marcuspff.com/llm/engestofte og er bygget som en selvstændig sub-app, så den nemt kan flyttes eller fjernes igen efter pitchet.

### Problem

Engestofte Gods styrer i dag alle bryllupsbookinger manuelt i et enkelt Trello-board, hvor hver booking er en kolonne og opgaverne ligger som kort under. Det er en forældet løsning, der ikke har skaleret med deres aktivitet. Der er ingen samlet oversigt på tværs af bryllupper, ingen kalenderfunktion, og betalinger, tilkøb og deadlines bliver hurtigt usynlige når flere bryllupper kører samtidig. Pakkevalg, gæsteantal og tilkøb er gemt som fritekst i kortbeskrivelser, hvilket gør det umuligt at filtrere, søge eller få overblik på tværs.

### Bruger

Udelukkende koordinatorerne på Engestofte, Johan Jensen og Lise Egeskov. Det er et rent internt adminsystem. Brudeparrene logger ikke ind, bruger ikke systemet og modtager ikke automatiske mails fra det. Al kundekontakt forbliver hos Johan og Lise via deres egne kanaler — mail, telefon og personlige møder. Det er et udtrykkeligt ønske fra Engestofte at de selv styrer relationen til brudeparrene.

### Nuværende proces

Når et brudepar henvender sig, opretter koordinatoren en ny kolonne i Trello opkaldt efter parret. Standardopgaver tilføjes manuelt som kort. Pakkevalg, gæsteantal og tilkøb noteres i kortbeskrivelser eller andre steder. Kommunikation med parret kører på mail uden for Trello. Der findes ingen kalenderoversigt eller samlet betalingsstatus, og deadlines er ikke koblet til bryllupsdatoen — flyttes et bryllup skal alle kort opdateres manuelt.

### Foreslået løsning

En webapp i Next.js med Supabase som backend, designet som et internt adminsystem til de to koordinatorer. Hvert bryllup bliver en struktureret post med dato, gæsteantal, pakke, tilkøb, betalinger, overnatninger og opgaver. Koordinatoren får et dashboard, en kalenderoversigt og en detaljeside pr. bryllup.

Et centralt element er en "Sync fra Trello"-knap i appen. Hver gang koordinatoren trykker på den, hentes de nyeste data fra Trello-boardet og indlæses i appen. Det betyder at Engestofte i en overgangsfase kan fortsætte med at bruge Trello som indgang for nye bookinger, mens den nye app står for overblikket. Synkroniseringen er idempotent — den samme knap kan trykkes igen og igen uden at skabe dubletter, og eksisterende bryllupper opdateres i stedet for at blive duplikeret.

Kontaktinformationer på brudeparret gemmes som opslagsfelter, men systemet sender aldrig noget direkte til parret. Tanken er at erstatte Trello, ikke at lave en pænere udgave af det.

### AI-funktion

Når koordinatoren opretter et nyt bryllup, foreslår en AI-model (Llama 3.3 70B via Groq) en opgaveliste ud fra dato, pakke, vielsestype og valgte tilkøb. Fx: vielse i Maribo Domkirke + sejlads med Anemonen giver automatisk tasks som "Kontakt præst (8 uger før)" og "Bekræft sejlads med Anemonen (4 uger før)". Koordinatoren kan godkende alle, godkende udvalgte, redigere eller afvise forslagene. AI'en arbejder kun internt og kommunikerer aldrig med brudeparret.

### MVP

- Demo hostet på marcuspff.com/llm/engestofte
- Mock-Trello board med 8–10 realistiske Engestofte-bryllupper (fake men troværdige danske navne som Sofie & Mikkel, Anna & Lars)
- "Sync fra Trello"-knap i appen, der ved klik henter de nyeste data fra Trello og opdaterer Supabase idempotent
- Visning af tidspunkt for seneste synkronisering samt antal oprettede/opdaterede bryllupper
- Login for de to koordinatorer
- Dashboard og kalenderview over bryllupperne
- Detaljeside pr. bryllup med opgaver, tilkøb, betalinger og overnatninger
- AI-genereret opgaveforslag når et nyt bryllup oprettes

### Afgrænsning

Ingen kundeportal til brudepar. Ingen automatiske mails eller SMS — systemet kommunikerer aldrig direkte med brudeparret. Ingen fakturering eller betalingsgateway. Ingen gæsteliste- eller bordplansfunktion. Ingen filupload eller kontraktopbevaring. Ingen kalendersynkronisering med Google Calendar. Synkroniseringen er additiv i MVP — kort der slettes i Trello forbliver i appen, så der ikke utilsigtet mistes data. Det er bevidst skarpt afgrænset for at holde pitchet fokuseret på koordinatorernes daglige arbejdsgang.

### Kundespørgsmål

- Hvor mange bryllupper kører de typisk pr. sæson?
- Er der en fast skabelon for opgaver pr. pakke, eller varierer det meget fra bryllup til bryllup?
- Hvilke deadlines er de kritiske?
- Bruger de Excel eller andet ved siden af Trello?
- Hvor meget skal AI'en have lov til at gøre selvstændigt, og hvad skal koordinatoren godkende inden?
- Skal systemet kunne håndtere andre typer events (konfirmationer, fester, konferencer) eller kun bryllupper?
- Hvor ofte forventer de at trykke på Sync — flere gange om dagen, eller en gang om ugen?

### Antagelser

- Engestoftes nuværende Trello-setup er det primære arbejdsværktøj for koordinatorerne i dag
- Opgavestrukturen pr. bryllup er rimeligt genkendelig på tværs
- Koordinatorerne er åbne for at skifte væk fra Trello hvis alternativet er stærkt nok
- Engestofte ønsker at bevare al kundekontakt selv — systemet er rent internt
- Vi pitcher på selvopbygget mock-data indtil der er en aftale om at bruge rigtige data
- Trello bliver indgangen for nye bookinger i en overgangsfase — Sync-knappen holder appen opdateret

### Næste tre opgaver

1. Opsætte sub-app strukturen i portfolioet under src/app/llm/engestofte/ og oprette dedikeret Supabase-projekt
2. Bygge mock-Trello board og designe datamodel (inkl. trello_list_id og trello_card_id som upsert-nøgler)
3. Bygge Sync fra Trello-funktionen: delt sync-modul, Server Action og knap-komponent i UI'et
