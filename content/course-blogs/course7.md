Den her uge byggede jeg ikke noget nyt. Det handlede mere om hvordan man overhovedet arbejder fornuftigt sammen med en kodeagent. Temaet var spec driven development, og så de juridiske og etiske ting der følger med når AI er en del af ens udvikling.

Det jeg har lavet indtil nu har været prompt baseret. Jeg skriver en besked, agenten gør noget, jeg retter, så kører vi videre. Det fungerer til småting. Men det er også derfor jeg af og til er endt med kode jeg ikke selv ville have skrevet, fordi jeg ikke havde defineret hvad jeg egentlig ville have inden.

Flow:

1. Læste Peter Naurs "Programming as Theory Building". Hans pointe er at koden ikke er programmet. Teorien i hovedet på dem der har skrevet koden, dét er programmet. Det er derfor det er svært at overtage en andens kode, selv hvis den er ren og veldokumenteret. Du har ikke teorien.
2. Det rammer hårdt i en AI kontekst. Hvis agenten skriver koden og jeg bare godkender, hvem har så teorien? Det har agenten i hvert fald ikke, og hvis jeg ikke selv har bygget den op, kan jeg heller ikke vedligeholde det jeg får tilbage.
3. Det er dét specs løser, hvis man bruger dem rigtigt. En spec er et sted hvor jeg tvinger mig selv til at skrive teorien ned, før jeg sætter agenten i gang.
4. Læste også Martin Fowlers artikel om hvorfor AI agenter stadig har brug for klare specs. Det stemmer med min egen oplevelse. Vage prompts giver generisk kode tilbage, og det er nok dér jeg har lavet flest fejl i de andre opgaver.
5. På det juridiske: GDPR forsvinder ikke fordi man bruger AI. Hvis jeg sender personlige data til Groq eller OpenAI, så er de databehandlere, og det skal stå i en aftale. Jeg skal også vide hvor data ligger henne, og hvor længe.
6. EU's AI forordning kategoriserer systemer efter risiko. Et CV vurderingsværktøj kunne nemt være high risk hvis det havde rigtige konsekvenser for nogen. Det jeg har bygget er stadig legetøj, men jeg kan godt se hvor det bliver alvorligt.
7. Bias bliver først et problem når man tror modellen er neutral. Den er trænet på det vi har skrevet, og det er ikke neutralt. Ansvaret ligger hos den der deployer modellen, ikke hos modellen selv.
8. Min plan fremover er at skrive et lille spec afsnit øverst i en markdown fil før jeg går i gang. Et par sætninger om hvad det her skal kunne, og hvilke cases der skal være opfyldt før jeg er færdig. Hellere det end ingenting, og hellere det end de tunge dokumenter.
9. Til større ting prøver jeg at bygge en lille proces. Skrive spec først, så lade agenten implementere, og bagefter sammenligne med det jeg startede med. Det er dér review henter sin værdi. Uden noget at holde det op imod bliver det bare smagsdom.

Det jeg tager med mig er at specs er stedet hvor jeg holder fast i teorien. Skriver jeg den ikke ned, så mister jeg den til agenten, og så er det agentens kode der står tilbage.
