Interaktiv quiz i 5 sektioner med 29 spørgsmål om meditation — stilhed, afspændthed, opmærksomhed og at lade alting være. Vælg svar, aflever, og få facit med markering af rigtigt/forkert.

Flow:

1. Sad med noterne fra meditationskurset og tænkte at en quiz var den mest naturlige måde at gøre stoffet interaktivt.
2. Skrev 29 spørgsmål ud, fordelt på 5 sektioner der følger emnerne fra kurset.
3. Blandede formaterne. Nogle er sandt/falsk, nogle er multiple choice (rigtigt/forkert/måske).
4. Lagde alle data i en separat fil (lib/course3Data.ts) så selve komponenten kun handler om visning og state.
5. State'en holder styr på hvilke svar man har valgt, og om man har afleveret eller ej.
6. Lavede en sticky progress-tæller øverst så man hele tiden kan se hvor langt man er.
7. Tilføjede validering. Man kan ikke aflevere før alle 29 spørgsmål er besvaret.
8. Efter aflevering bliver svarene markeret grønt eller rødt, og en reset-knap gør det nemt at tage den igen.
9. Holdt UI'et på dansk siden indholdet er det.
10. Sørgede for at touch-områderne er mindst 44px så det også fungerer på mobil.

Det fede ved en quiz er at logikken er enkel. Den svære del var at formulere spørgsmålene præcist nok til at svaret faktisk er entydigt.
