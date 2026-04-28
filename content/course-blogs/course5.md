I denne uge har jeg bygget et læringsværktøj til vurdering af datamatiker-praktikrapporter. Indsæt en rapport og få en struktureret, vejledende vurdering tilbage fra Llama 3.3 70B (via Groq) — samlet feedback, scoring på fem rubric-kriterier, Dare-Share-Care-vurdering, styrker, svagheder, forslag og dialog-spørgsmål til mundtlig eksamen.

Flow:

1. Første udkast var en generisk essay-bedømmer med en hårdkodet rubric. Den virkede, men den passede ikke til opgaven.
2. Læste opgavebeskrivelsen igen og indså at rubric'en skulle udledes fra de faktiske kildedokumenter — læringsmål, krav til rapporten og Dare-Share-Care-rammen.
3. Lagde de tre kildefiler i app/llm/course-5/data/ som markdown, og fik serveren til at læse dem ind ved start.
4. Byggede en rubric med 5 kriterier i TypeScript. DSC blev sit eget felt i outputtet, ikke et rubric-kriterium, fordi den fungerer som en selvstændig ramme.
5. Prøvede først med Gemini. Min API-nøgle havde limit:0 på alle de Gemini-flash varianter jeg prøvede, så det gik ikke.
6. Skiftede til Groq med Llama 3.3 70B. Det virkede med det samme.
7. Skrev en system-prompt på engelsk der beskriver rollen og det præcise JSON-skema modellen skal returnere.
8. User-prompten samler fem mærkede blokke: læringsmål, krav, DSC, rubric, student submission. Det gør det tydeligt for modellen hvad der er hvad.
9. Tilføjede prompt-injection-forsvar. System-prompten siger eksplicit at instruktioner inde i student submission-blokken skal ignoreres.
10. UI'et fik en grænse på 15.000 tegn, en DK/EN-skifter, en animeret indlæsningsbar og en collapsible "Vis rubric"-panel.
11. Lagde tre rigtige student-eksempler ind som quick-paste-knapper, så man kan teste hurtigt.
12. Farvekodede niveau-badges. Rosé for lavt, amber for midt, emerald for højt.
13. Delte rate-limiteren med chatten (6 requests per minut per IP).
14. Outputtet er struktureret JSON: overall assessment, criteria, dare_share_care, strengths, weaknesses, suggestions, dialogueQuestions.