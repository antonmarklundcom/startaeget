/**
 * Tool 1, Bolagsformsväljaren (plan §5.3): eight questions → aktiebolag,
 * enskild firma or handelsbolag, with the reasoning written out.
 *
 * The scoring is deliberately transparent rather than clever: each answer adds
 * weight to one or more forms and contributes one line of "why". The result
 * panel shows those lines, so the visitor can disagree with a specific step
 * instead of distrusting a black box.
 */

export type CompanyForm = "ab" | "enskild" | "handelsbolag";

export type Option = {
  id: string;
  label: string;
  /** Weight per form. Positive favours, negative counts against. */
  weights: Partial<Record<CompanyForm, number>>;
  /** Why this answer pointed where it did — shown in the result. */
  because?: string;
  /** Makes a form impossible regardless of score (e.g. partners + enskild). */
  rules?: CompanyForm[];
};

export type Question = {
  id: string;
  /** Short label for the progress line and the shared URL. */
  key: string;
  title: string;
  help?: string;
  options: Option[];
};

export const QUESTIONS: Question[] = [
  {
    id: "vinst",
    key: "vinst",
    title: "Hur mycket räknar du med att företaget går med i vinst det första året?",
    help: "Vinst före din egen lön eller eget uttag. Gissa hellre lågt än högt.",
    options: [
      {
        id: "under-200",
        label: "Under 200 000 kr",
        weights: { enskild: 3 },
        because:
          "Vid en vinst under ungefär 200 000 kr finns sällan någon skattevinst i ett aktiebolag, och enskild firma kostar mindre att sköta.",
      },
      {
        id: "200-500",
        label: "200 000–500 000 kr",
        weights: { enskild: 1, ab: 1 },
        because:
          "I det här spannet väger skatten ungefär lika. Då avgör risk, delägare och hur du vill ta ut pengarna i stället.",
      },
      {
        id: "over-500",
        label: "Över 500 000 kr",
        weights: { ab: 3 },
        because:
          "Över ungefär en halv miljon i vinst börjar kombinationen lön och lågbeskattad utdelning i ett aktiebolag göra verklig skillnad.",
      },
    ],
  },
  {
    id: "delagare",
    key: "delagare",
    title: "Startar du själv eller tillsammans med någon?",
    options: [
      {
        id: "sjalv",
        label: "Själv",
        weights: {},
        because: "Du startar själv, så alla tre formerna är möjliga.",
      },
      {
        id: "med-andra",
        label: "Tillsammans med en eller flera",
        weights: { ab: 3, handelsbolag: 2 },
        rules: ["enskild"],
        because:
          "Enskild firma kan bara ha en ägare. Med delägare står valet mellan aktiebolag och handelsbolag.",
      },
    ],
  },
  {
    id: "risk",
    key: "risk",
    title: "Hur stor är risken i det du ska göra?",
    help: "Tänk på skulder, dyra misstag, skador på kunders egendom och stora avtal.",
    options: [
      {
        id: "lag",
        label: "Låg — jag säljer min egen tid",
        weights: { enskild: 2 },
        because:
          "Säljer du din egen tid är det personliga ansvaret sällan det som avgör valet.",
      },
      {
        id: "medel",
        label: "Medel — jag köper in varor eller har avtal",
        weights: { ab: 1 },
        because: "Med varulager och avtal finns en risk som ett aktiebolag kan bära i stället för du.",
      },
      {
        id: "hog",
        label: "Hög — jag tar lån, anställer eller kan orsaka skada",
        weights: { ab: 4 },
        because:
          "I enskild firma och handelsbolag svarar du personligen för skulderna. Vid hög risk är det aktiebolagets ansvarsbegränsning värd sin administration.",
      },
    ],
  },
  {
    id: "kapital",
    key: "kapital",
    title: "Behöver du investera eller spara vinst i företaget?",
    options: [
      {
        id: "nej",
        label: "Nej, pengarna går ut till mig direkt",
        weights: { enskild: 2 },
        because: "Ska pengarna ut direkt finns ingen anledning att lägga ett bolag emellan.",
      },
      {
        id: "ja",
        label: "Ja, jag behöver köpa utrustning eller bygga upp kapital",
        weights: { ab: 2 },
        because:
          "Ett aktiebolag kan behålla vinst till 20,6 % bolagsskatt och investera den, utan att den först beskattas som din inkomst.",
      },
    ],
  },
  {
    id: "anstalla",
    key: "anstalla",
    title: "Planerar du att anställa någon inom två år?",
    options: [
      { id: "nej", label: "Nej", weights: {}, because: "Inga anställda planerade — det påverkar inte valet." },
      {
        id: "ja",
        label: "Ja",
        weights: { ab: 2 },
        because:
          "Med anställda följer arbetsgivaransvar och större ekonomiska åtaganden. De flesta vill ha dem i ett aktiebolag.",
      },
    ],
  },
  {
    id: "salja",
    key: "salja",
    title: "Kan du tänka dig att sälja företaget i framtiden?",
    options: [
      {
        id: "nej",
        label: "Nej, det är jag som är företaget",
        weights: { enskild: 1 },
        because: "Är det du som är företaget finns inget bolag att sälja — och inget behov av ett.",
      },
      {
        id: "ja",
        label: "Ja, eller jag vill hålla dörren öppen",
        weights: { ab: 3 },
        because:
          "Ett aktiebolag går att sälja som bolag, med aktier och allt. En enskild firma kan bara sälja sina tillgångar.",
      },
    ],
  },
  {
    id: "uttag",
    key: "uttag",
    title: "Hur vill du helst ta ut pengarna?",
    options: [
      {
        id: "enkelt",
        label: "Så enkelt som möjligt — jag vill inte tänka på lön",
        weights: { enskild: 3 },
        because:
          "I enskild firma tar du ut pengar genom eget uttag, utan lönekörning och utan arbetsgivardeklaration.",
      },
      {
        id: "lon-utdelning",
        label: "Lön varje månad, och utdelning när det går bra",
        weights: { ab: 3 },
        because:
          "Lön plus utdelning är hela poängen med ett aktiebolag — men det kräver lönekörning, bokslut och koll på 3:12-reglerna.",
      },
    ],
  },
  {
    id: "omfattning",
    key: "omfattning",
    title: "Är det här en bisyssla eller din huvudsakliga inkomst?",
    options: [
      {
        id: "bisyssla",
        label: "Bisyssla vid sidan av jobbet",
        weights: { enskild: 3 },
        because:
          "Som bisyssla vinner nästan alltid det som är billigast och enklast att starta och lägga ned — enskild firma.",
      },
      {
        id: "huvudinkomst",
        label: "Min huvudsakliga inkomst",
        weights: { ab: 1 },
        because: "Ska företaget försörja dig är det värt att välja formen på sikt, inte på starten.",
      },
    ],
  },
];

export const FORM_NAMES: Record<CompanyForm, string> = {
  ab: "Aktiebolag",
  enskild: "Enskild firma",
  handelsbolag: "Handelsbolag",
};

export type Answers = Record<string, string>;

export type Recommendation = {
  /** Null until every question is answered. */
  form: CompanyForm | null;
  runnerUp: CompanyForm | null;
  scores: Record<CompanyForm, number>;
  /** One line per answered question, in question order. */
  reasons: string[];
  /** Forms an answer ruled out entirely. */
  excluded: CompanyForm[];
  answered: number;
  total: number;
  /** True when the top two are within one point — say so instead of pretending. */
  close: boolean;
};

export function getQuestion(id: string): Question | null {
  return QUESTIONS.find((q) => q.id === id) ?? null;
}

export function getOption(questionId: string, optionId: string): Option | null {
  return getQuestion(questionId)?.options.find((o) => o.id === optionId) ?? null;
}

/** Drops anything that is not a real question/option pair. */
export function sanitiseAnswers(input: Answers): Answers {
  const clean: Answers = {};
  for (const question of QUESTIONS) {
    const picked = input[question.id];
    if (picked && getOption(question.id, picked)) clean[question.id] = picked;
  }
  return clean;
}

export function recommend(input: Answers): Recommendation {
  const answers = sanitiseAnswers(input);
  const scores: Record<CompanyForm, number> = { ab: 0, enskild: 0, handelsbolag: 0 };
  const reasons: string[] = [];
  const excluded = new Set<CompanyForm>();

  for (const question of QUESTIONS) {
    const picked = answers[question.id];
    if (!picked) continue;
    const option = getOption(question.id, picked);
    if (!option) continue;

    for (const [form, weight] of Object.entries(option.weights)) {
      scores[form as CompanyForm] += weight ?? 0;
    }
    for (const form of option.rules ?? []) excluded.add(form);
    if (option.because) reasons.push(option.because);
  }

  const answered = Object.keys(answers).length;
  if (answered < QUESTIONS.length) {
    return {
      form: null,
      runnerUp: null,
      scores,
      reasons,
      excluded: [...excluded],
      answered,
      total: QUESTIONS.length,
      close: false,
    };
  }

  // Handelsbolag only ever wins when it was explicitly opened up by partners,
  // and even then an aktiebolag with the same partners usually scores higher.
  const ranked = (Object.keys(scores) as CompanyForm[])
    .filter((form) => !excluded.has(form))
    .sort((a, b) => scores[b] - scores[a]);

  const [form, runnerUp] = ranked;
  return {
    form: form ?? null,
    runnerUp: runnerUp ?? null,
    scores,
    reasons,
    excluded: [...excluded],
    answered,
    total: QUESTIONS.length,
    close: Boolean(runnerUp) && scores[form] - scores[runnerUp] <= 1,
  };
}

/** Partner slots that fit the answer (ids from content/affiliates.ts). */
export function partnersFor(form: CompanyForm | null): string[] {
  if (form === "ab") return ["standardbolag", "bokio", "fortnox", "seb-foretag"];
  if (form === "handelsbolag") return ["bokio", "visma-eekonomi", "seb-foretag"];
  return ["bokio", "visma-eekonomi", "if-foretag"];
}

/** The "så här gör du" checklist under the result. */
export function nextSteps(form: CompanyForm | null): string[] {
  if (form === "ab") {
    return [
      "Öppna ett företagskonto och sätt in aktiekapitalet på 25 000 kr.",
      "Be banken om ett bankintyg som visar att kapitalet finns.",
      "Registrera bolaget på verksamt.se — Bolagsverkets avgift är 2 400 kr via e-tjänsten.",
      "Ansök om godkännande för F-skatt och momsregistrering samtidigt, det är gratis.",
      "Välj bokföringsprogram och bestäm om du sköter bokslutet själv eller via byrå.",
      "Skriv in dig i aktieboken och spara stiftelseurkunden — du behöver dem vid varje ändring.",
    ];
  }
  if (form === "handelsbolag") {
    return [
      "Skriv ett kompanjonsavtal först — vem gör vad, vad händer om någon vill ut.",
      "Registrera handelsbolaget hos Bolagsverket, 1 800 kr.",
      "Ansök om F-skatt och momsregistrering på verksamt.se, gratis.",
      "Öppna företagskonto i bolagets namn.",
      "Bestäm hur ni delar resultatet, och skriv ned det.",
      "Kom ihåg att ni svarar solidariskt för bolagets skulder — alla, för allt.",
    ];
  }
  return [
    "Ansök om godkännande för F-skatt på verksamt.se — gratis, och tar några dagar.",
    "Momsregistrera dig i samma ansökan om du säljer momspliktigt.",
    "Registrera företagsnamnet hos Bolagsverket om du vill skydda det, 1 800 kr (frivilligt).",
    "Öppna ett separat konto för firman — inget krav, men du kommer att vilja ha det.",
    "Välj ett bokföringsprogram och börja bokföra från första kvittot.",
    "Lägg undan för skatt och egenavgifter löpande, och ansök om en debiterad preliminärskatt.",
  ];
}

/** Query string for the shareable result URL. */
export function toQuery(answers: Answers): string {
  const clean = sanitiseAnswers(answers);
  const params = new URLSearchParams();
  for (const question of QUESTIONS) {
    if (clean[question.id]) params.set(question.key, clean[question.id]);
  }
  return params.toString();
}

export function fromQuery(params: URLSearchParams | Record<string, string | undefined>): Answers {
  const read = (key: string) =>
    params instanceof URLSearchParams ? params.get(key) : params[key];
  const answers: Answers = {};
  for (const question of QUESTIONS) {
    const raw = read(question.key);
    if (raw && getOption(question.id, raw)) answers[question.id] = raw;
  }
  return answers;
}
