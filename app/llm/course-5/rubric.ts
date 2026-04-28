/*
  Rubric to assess datamatiker internship reports ("praktikrapport").

  Derived directly from the materials in app/llm/course-5/data/:
  - laeringsmaal.md     → criteria 2 (knowledge / skills / competencies)
  - krav-til-rapport.md → criteria 1, 3, 4, 5 (required content sections)
  - dare-share-care.md  → criterion 6 (EK core values, part of grading)

  Each criterion has a name, a short description, and three plain-language
  descriptors for low / mid / high attainment. No weighting — keeping it
  simple so the LLM treats criteria evenhandedly.
*/

export type Level = 'low' | 'mid' | 'high';

export type RubricCriterion = {
  id: string;
  name: string;
  description: string;
  levels: Record<Level, string>;
};

export const RUBRIC: RubricCriterion[] = [
  {
    id: 'company',
    name: 'Virksomhedsbeskrivelse og kontekst',
    description:
      'En kort, klar beskrivelse af praktikvirksomheden og den kontekst, den studerendes arbejde foregik i.',
    levels: {
      low: 'Mangler eller kun overfladisk navngivning af virksomheden uden kontekst.',
      mid: 'Beskriver virksomheden, men kobler den ikke tydeligt til den studerendes rolle eller arbejde.',
      high: 'Klar, fokuseret beskrivelse der både rammer virksomheden, teamet og hvordan den studerendes arbejde indgår.',
    },
  },
  {
    id: 'learning-goals',
    name: 'Opfyldelse af læringsmål',
    description:
      'I hvilken grad rapporten dokumenterer at studieordningens læringsmål (viden om daglig drift; tekniske/analytiske færdigheder; strukturering, formidling, samarbejde, ny viden) faktisk er nået.',
    levels: {
      low: 'Læringsmål er knapt nævnt eller adresseres kun overfladisk; ingen konkrete eksempler.',
      mid: 'Flere læringsmål er adresseret med eksempler, men nogle mangler eller er løst koblet til praksis.',
      high: 'Alle relevante læringsmål er konkret demonstreret med tydelige eksempler fra praktikken.',
    },
  },
  {
    id: 'tasks-and-theory',
    name: 'Opgaver og teorirefleksion',
    description:
      'Beskrivelse af konkrete opgaver kombineret med refleksion over de teorier/modeller den studerende er blevet undervist i på uddannelsen.',
    levels: {
      low: 'Beskrivelse af opgaver er fraværende eller rent narrativ; ingen kobling til teori.',
      mid: 'Opgaver beskrives, og teori nævnes, men koblingen mellem teori og praksis er overfladisk.',
      high: 'Konkrete opgaver er beskrevet og analyseret gennem relevant teori, så det er tydeligt hvor teori bekræftes, udfordres eller justeres.',
    },
  },
  {
    id: 'personal-development',
    name: 'Personlig udvikling',
    description:
      'Refleksion over personlige udviklingsmål og hvad praktikken har betydet for den studerendes faglige og personlige profil.',
    levels: {
      low: 'Personlig udvikling er ikke berørt eller kun overfladisk ("jeg lærte meget").',
      mid: 'Nogle personlige udviklingspunkter er reflekteret over, men ikke konsekvent eller med stor selvindsigt.',
      high: 'Klare, selv-indsigtsfulde refleksioner om udvikling, herunder hvad der var svært, hvad der ændrede sig, og hvilke kompetencer der er styrket.',
    },
  },
  {
    id: 'mutual-value',
    name: 'Værdiskabelse for virksomhed og studerende',
    description:
      'Refleksion over hvordan praktikken har skabt værdi begge veje — for virksomheden og for den studerende selv.',
    levels: {
      low: 'Kun et af perspektiverne (eller intet af dem) er berørt.',
      mid: 'Begge perspektiver er nævnt, men ofte generisk eller uden konkrete eksempler.',
      high: 'Konkret, troværdig refleksion over bidraget til virksomheden og det udbytte den studerende har taget med sig — gerne understøttet af eksempler eller feedback.',
    },
  },
];

// Dare-Share-Care vurderes separat som et top-level felt i JSON-svaret,
// ikke som et rubric-kriterium. Indholdet af dare-share-care.md injectes
// direkte i user-prompten.

/*
  Compact context block injected into the LLM user prompt. Keeps the
  full source material accessible without bloating the prompt with
  the entire markdown.
*/
export const ASSIGNMENT_CONTEXT = `
Konteksten: Rapporten er en individuel praktikrapport fra datamatiker-uddannelsen
ved Erhvervsakademi København (EK). Den danner grundlag for en mundtlig
praktikeksamen.

Læringsmål fra studieordningen som rapporten skal dokumentere opfyldelsen af:
- Viden: den daglige drift i hele praktikvirksomheden
- Færdigheder: alsidige tekniske/analytiske arbejdsmetoder, vurdere praksisnære
  problemstillinger, strukturere/planlægge arbejdsopgaver, formidle problemstillinger
  og løsningsforslag
- Kompetencer: håndtere udviklingsorienterede situationer, tilegne sig ny viden,
  deltage i fagligt og tværfagligt samarbejde

Krav til rapportens indhold (jf. studieordning):
1. Kort beskrivelse af praktikvirksomheden
2. Hvordan studerendes har opfyldt læringsmålene
3. Udførte opgaver + refleksion over disse koblet til teorier/modeller fra uddannelsen
4. Refleksion over personlige udviklingsmål
5. Refleksion over praktikforløbets udbytte for virksomheden og den studerende
6. Kvittering for evalueringsskema

Rapportens omfang: maks. 12.000 tegn inkl. mellemrum (≈ 5 normalsider) ekskl. bilag.

EK's tre kerneværdier (indgår i bedømmelsen):
- DARE: nysgerrighed, mod, vedholdenhed, initiativ, turde fejle
- SHARE: dele viden/erfaring, skabe relationer og trygt fællesskab
- CARE: åben, tillidsfuld, ansvarlig tilgang til sig selv og omverden
`.trim();
