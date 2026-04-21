export type QuizOption = {
  id: string;
  label: string;
  correct: boolean;
};

export type QuizQuestion = {
  id: string;
  number: number;
  prompt: string;
  options: QuizOption[];
};

export type QuizSection = {
  id: string;
  number: number;
  title: string;
  questions: QuizQuestion[];
};

export const course3Quiz: QuizSection[] = [
  {
    id: 's0',
    number: 0,
    title: 'Om meditation – og vælge ikke at have et problem',
    questions: [
      {
        id: 's0q1',
        number: 1,
        prompt: 'Målet med meditation er at være helt tom for tanker',
        options: [
          { id: 'a', label: 'Rigtigt', correct: false },
          { id: 'b', label: 'Forkert', correct: true },
        ],
      },
      {
        id: 's0q2',
        number: 2,
        prompt: 'Hvor længe skal man meditere?',
        options: [
          { id: 'a', label: 'Det er lige meget', correct: false },
          { id: 'b', label: '20 minutter om dagen', correct: false },
          { id: 'c', label: 'Så længe man på forhånd har besluttet sig for at gøre det', correct: true },
          { id: 'd', label: 'Altid over 10 minutter ad gangen', correct: false },
        ],
      },
      {
        id: 's0q3',
        number: 3,
        prompt: 'Man kan kun meditere rigtigt hvis man sidder i lotusstilling',
        options: [
          { id: 'a', label: 'Rigtigt', correct: false },
          { id: 'b', label: 'Forkert', correct: true },
        ],
      },
      {
        id: 's0q4',
        number: 4,
        prompt: 'Meditation er en teknik',
        options: [
          { id: 'a', label: 'Rigtigt', correct: false },
          { id: 'b', label: 'Forkert', correct: true },
        ],
      },
      {
        id: 's0q5',
        number: 5,
        prompt: 'Hvis jeg opdager, at jeg tænker på et problem, hvad gør jeg så?',
        options: [
          { id: 'a', label: 'Gennemgår instruktionerne og vender tilbage til meditationen', correct: false },
          { id: 'b', label: 'Tænker på noget andet', correct: false },
          { id: 'c', label: 'Ingenting – jeg er allerede fri af tankerne', correct: true },
          { id: 'd', label: 'Skubber tankerne væk', correct: false },
        ],
      },
      {
        id: 's0q6',
        number: 6,
        prompt: 'Hvis jeg synes det er svært at meditere, hvad gør jeg så?',
        options: [
          { id: 'a', label: 'Så vælger jeg ikke at gøre et problem ud af det', correct: true },
          { id: 'b', label: 'Så forsøger jeg at tænke på noget positivt', correct: false },
          { id: 'c', label: 'Så gør jeg det forkert', correct: false },
        ],
      },
    ],
  },
  {
    id: 's1',
    number: 1,
    title: 'Om at være stille',
    questions: [
      {
        id: 's1q1',
        number: 1,
        prompt: 'At være stille har både en indre og en ydre del',
        options: [
          { id: 'a', label: 'Rigtigt', correct: true },
          { id: 'b', label: 'Forkert', correct: false },
        ],
      },
      {
        id: 's1q2',
        number: 2,
        prompt: 'Den indre del betyder:',
        options: [
          { id: 'a', label: 'At jeg ikke forholder mig til tanker og følelser', correct: true },
          { id: 'b', label: 'At alle tanker og følelser står stille', correct: false },
          { id: 'c', label: 'At jeg kan fjerne alle tanker og følelser', correct: false },
          { id: 'd', label: 'At jeg ikke dagdrømmer', correct: false },
        ],
      },
      {
        id: 's1q3',
        number: 3,
        prompt: 'Man kan ikke være stille når der er larm i nærheden?',
        options: [
          { id: 'a', label: 'Rigtigt', correct: false },
          { id: 'b', label: 'Forkert', correct: true },
        ],
      },
      {
        id: 's1q4',
        number: 4,
        prompt: 'Man kan godt være fuldkommen stille og samtidig have hovedet fuld af tanker igennem hele meditationen?',
        options: [
          { id: 'a', label: 'Rigtigt', correct: true },
          { id: 'b', label: 'Forkert', correct: false },
        ],
      },
      {
        id: 's1q5',
        number: 5,
        prompt: 'Man kan kun meditere hvis man sidder fuldkommen stille?',
        options: [
          { id: 'a', label: 'Rigtigt', correct: false },
          { id: 'b', label: 'Forkert', correct: true },
        ],
      },
      {
        id: 's1q6',
        number: 6,
        prompt: 'Stilhed er …',
        options: [
          { id: 'a', label: 'en følelse', correct: false },
          { id: 'b', label: 'en oplevelse', correct: false },
          { id: 'c', label: 'en måde at have det på', correct: false },
          { id: 'd', label: 'en indre position i forhold til tanker og følelser', correct: true },
        ],
      },
    ],
  },
  {
    id: 's2',
    number: 2,
    title: 'Om at være afspændt (ease of being)',
    questions: [
      {
        id: 's2q1',
        number: 1,
        prompt: 'Den indre del af instruktionen er den vigtigste?',
        options: [
          { id: 'a', label: 'Rigtigt', correct: true },
          { id: 'b', label: 'Forkert', correct: false },
        ],
      },
      {
        id: 's2q2',
        number: 2,
        prompt: 'Det indre og ydre afspejler hinanden i meditationen. Hvad betyder det?',
        options: [
          { id: 'a', label: 'Hvis man ser anstrengt ud i ansigtet, så har man psykiske problemer', correct: false },
          { id: 'b', label: 'At hvis man smiler, så virker meditationen bedre', correct: false },
          { id: 'c', label: 'At hvis der er fred på ydersiden, så er der også fred på indersiden', correct: false },
          { id: 'd', label: 'At hvis man er afspændt på ydersiden, er det lettere at være afspændt på indersiden og omvendt', correct: true },
        ],
      },
      {
        id: 's2q3',
        number: 3,
        prompt: 'Det gælder om at blive mere og mere afspændt i kroppen i løbet af meditationen?',
        options: [
          { id: 'a', label: 'Rigtigt', correct: false },
          { id: 'b', label: 'Forkert', correct: true },
        ],
      },
      {
        id: 's2q4',
        number: 4,
        prompt: 'At være afspændt i forhold til sin oplevelse betyder, at vi',
        options: [
          { id: 'a', label: 'ikke blander os i hvad vi oplever', correct: true },
          { id: 'b', label: 'observerer vores tanker og skubber dem væk', correct: false },
          { id: 'c', label: 'ikke må føle noget når vi mediterer', correct: false },
        ],
      },
      {
        id: 's2q5',
        number: 5,
        prompt: 'Meditation virker ikke hvis man er anspændt i kroppen',
        options: [
          { id: 'a', label: 'Rigtigt', correct: false },
          { id: 'b', label: 'Forkert', correct: true },
        ],
      },
      {
        id: 's2q6',
        number: 6,
        prompt: 'Hvis jeg er helt afspændt i kroppen efter en meditation er det et tegn på at jeg har gjort det rigtigt?',
        options: [
          { id: 'a', label: 'Rigtigt', correct: false },
          { id: 'b', label: 'Forkert', correct: false },
          { id: 'c', label: 'Måske', correct: true },
        ],
      },
    ],
  },
  {
    id: 's3',
    number: 3,
    title: 'Om at være opmærksom og lysvågen',
    questions: [
      {
        id: 's3q1',
        number: 1,
        prompt: 'I denne meditationsform retter man sin opmærksomhed mod objekter i bevidstheden',
        options: [
          { id: 'a', label: 'Rigtigt', correct: false },
          { id: 'b', label: 'Forkert', correct: true },
        ],
      },
      {
        id: 's3q2',
        number: 2,
        prompt: 'Objekter i bevidstheden er:',
        options: [
          { id: 'a', label: 'Tanker, følelser og lyde', correct: false },
          { id: 'b', label: 'Alt som har en begyndelse og en afslutning', correct: true },
          { id: 'c', label: 'Tanker og genstande', correct: false },
        ],
      },
      {
        id: 's3q3',
        number: 3,
        prompt: 'Man kan ikke småsove og være opmærksom på samme tid?',
        options: [
          { id: 'a', label: 'Rigtigt', correct: true },
          { id: 'b', label: 'Forkert', correct: false },
        ],
      },
      {
        id: 's3q4',
        number: 4,
        prompt: 'At være opmærksom i meditation er …',
        options: [
          { id: 'a', label: 'at være opmærksom på alt, der rører sig i bevidstheden', correct: false },
          { id: 'b', label: 'ikke at hænge fast i noget', correct: true },
          { id: 'c', label: 'at være fast fokuseret på et punkt', correct: false },
        ],
      },
      {
        id: 's3q5',
        number: 5,
        prompt: 'Når man er opmærksom er der ingen tanker?',
        options: [
          { id: 'a', label: 'Rigtigt', correct: false },
          { id: 'b', label: 'Forkert', correct: true },
        ],
      },
      {
        id: 's3q6',
        number: 6,
        prompt: 'Man skal anstrenge sig for at være opmærksom?',
        options: [
          { id: 'a', label: 'Rigtigt', correct: false },
          { id: 'b', label: 'Forkert', correct: false },
          { id: 'c', label: 'Hverken rigtigt eller forkert', correct: true },
        ],
      },
    ],
  },
  {
    id: 's4',
    number: 4,
    title: 'Om at lade alting være',
    questions: [
      {
        id: 's4q1',
        number: 1,
        prompt: 'Hvis man overholder den første instruktion og er fuldkommen stille, så lader man også alting være?',
        options: [
          { id: 'a', label: 'Rigtigt', correct: true },
          { id: 'b', label: 'Forkert', correct: false },
        ],
      },
      {
        id: 's4q2',
        number: 2,
        prompt: 'Du er dine tanker og følelser?',
        options: [
          { id: 'a', label: 'Rigtigt', correct: false },
          { id: 'b', label: 'Forkert', correct: true },
        ],
      },
      {
        id: 's4q3',
        number: 3,
        prompt: 'At lade alting være, som det er, er det samme som at vælge ikke at have et problem?',
        options: [
          { id: 'a', label: 'Rigtigt', correct: true },
          { id: 'b', label: 'Forkert', correct: false },
        ],
      },
      {
        id: 's4q4',
        number: 4,
        prompt: 'At lade alting være som det er, betyder at man først og fremmest skal lade de negative tanker være?',
        options: [
          { id: 'a', label: 'Rigtigt', correct: false },
          { id: 'b', label: 'Forkert', correct: true },
        ],
      },
      {
        id: 's4q5',
        number: 5,
        prompt: 'Når vi lader ALTING være, så har vi droppet vores relation til alt bevidsthedsindhold',
        options: [
          { id: 'a', label: 'Rigtigt', correct: true },
          { id: 'b', label: 'Forkert', correct: false },
        ],
      },
    ],
  },
];

export const totalQuestions = course3Quiz.reduce(
  (sum, section) => sum + section.questions.length,
  0,
);
