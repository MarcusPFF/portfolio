export type Lang = 'en' | 'dk' | 'de';

export type Localized<T = string> = Record<Lang, T>;

export function pick<T>(field: Localized<T>, lang: Lang): T {
  return field[lang] ?? field.en;
}

const LOCALE: Record<Lang, string> = { en: 'en-US', dk: 'da-DK', de: 'de-DE' };

export function formatKm(km: number, lang: Lang): string {
  return `${new Intl.NumberFormat(LOCALE[lang]).format(km)} km`;
}

export function formatDate(isoMonth: string, lang: Lang): string {
  const [y, m] = isoMonth.split('-').map(Number);
  const d = new Date(Date.UTC(y, (m ?? 1) - 1, 1));
  return new Intl.DateTimeFormat(LOCALE[lang], {
    month: 'long',
    year: 'numeric',
  }).format(d);
}

export type Waypoint = {
  name: string;
  lat?: number;
  lng?: number;
};

import cityCoords from './cityCoords.json';

const CITY_COORDS = cityCoords as Record<string, { lat: number; lng: number }>;

export function resolveWaypoint(w: Waypoint): { lat: number; lng: number } | null {
  if (typeof w.lat === 'number' && typeof w.lng === 'number') {
    return { lat: w.lat, lng: w.lng };
  }
  const hit = CITY_COORDS[w.name];
  return hit ?? null;
}

export type Trip = {
  slug: string;
  dateSort: string; // YYYY-MM
  distanceKm: number;
  color: string;
  hexColor: string;
  waypoints: Waypoint[];
  title: Localized;
  subtitle: Localized;
  location: Localized;
  duration: Localized;
  summary: Localized;
  highlights: Localized<string[]>;
  story: Localized<string[]>;
  images?: string[];
  bike?: string;
};

export const trips: Trip[] = [
  {
    slug: 'europa-grand-tour',
    dateSort: '2025-07',
    distanceKm: 10000,
    color: 'from-violet-400/20 to-purple-400/20',
    hexColor: '#8b5cf6',
    bike: 'Honda Africa Twin XRV 750 (RD07)',
    waypoints: [
      { name: 'Fredensborg' },
      { name: 'Tappernøje' },
      { name: 'Güstrow' },
      { name: 'Sternberg' },
      { name: 'Godern' },
      { name: 'Schwerin-Ostorf' },
      { name: 'Seehof' },
      { name: 'Berlin-Heinersdorf' },
      { name: 'Cybinka' },
      { name: 'Zielona Góra' },
      { name: 'Szprotawa-Witków' },
      { name: 'Stara Kamienica-Kopaniec' },
      { name: 'Dolní Staré Buky' },
      { name: 'Náchod-Jizbice' },
      { name: 'Brno' },
      { name: 'Jablonové' },
      { name: 'Hviezdoslavovo námestie, Bratislava' },
      { name: 'Győr' },
      { name: 'Szombathely-Kámon' },
      { name: 'Gleisdorf' },
      { name: 'Zagreb' },
      { name: 'Super Konzum' },
      { name: 'Vrhovac' },
      { name: 'Ogulin-Podvrh' },
      { name: 'Senj' },
      { name: 'Lukovo' },
      { name: 'Staništa' },
      { name: 'Zadar' },
      { name: 'Pag' },
      { name: 'Plitvička Jezera' },
      { name: 'Bihać' },
      { name: 'Krupa na Uni' },
      { name: 'Banja Luka' },
      { name: 'Laktaši' },
      { name: 'Gradiška' },
      { name: 'Slavonski Brod' },
      { name: 'Lipovac' },
      { name: 'Batrovci' },
      { name: 'Beograd' },
      { name: 'Smederevo' },
      { name: 'Boljetin' },
      { name: 'Golubinje' },
      { name: 'Tekija' },
      { name: 'Coțofenii din Față' },
      { name: 'Caracal' },
      { name: 'Islaz' },
      { name: 'Arbanasi' },
      { name: 'Edirne' },
      { name: 'Demirtaş' },
      { name: 'Karakaş' },
      { name: 'Edirne' },
      { name: 'Kastanies' },
      { name: 'Doxa' },
      { name: 'Kipia' },
      { name: 'Ampelokipoi' },
      { name: 'Thessaloniki' },
      { name: 'Atalanti' },
      { name: 'Artemida' },
      { name: 'Vari' },
      { name: 'Nea Smyrni' },
      { name: 'Athen' },
      { name: 'Kedros' },
      { name: 'Belokomiti' },
      { name: 'Karditsa' },
      { name: 'Kastraki' },
      { name: 'Meteora' },
      { name: 'Serviana' },
      { name: 'Ioannina' },
      { name: 'Agios Georgios' },
      { name: 'Patras' },
      { name: 'Araxos' },
      { name: 'Limenas Patron' },
      { name: 'Rimini' },
      { name: 'San Marino' },
      { name: 'Bologna' },
      { name: 'Belluno' },
      { name: 'Cibiana di Cadore' },
      { name: 'Val di Zoldo' },
      { name: 'Selva di Cadore' },
      { name: 'Colle Santa Lucia' },
      { name: "Cortina d'Ampezzo" },
      { name: 'Toblach' },
      { name: 'Völs am Schlern' },
      { name: 'Eben im Pongau' },
      { name: 'Kaufbeuren' },
      { name: 'Hohenschwangau' },
      { name: 'Illertissen' },
      { name: 'Reilingen' },
      { name: 'Metz' },
      { name: 'Berchem' },
      { name: 'Recogne' },
      { name: 'Dhuy' },
      { name: 'Antwerpen' },
      { name: 'Den Hout' },
      { name: 'Amsterdam' },
      { name: 'Vojens' },
      { name: 'Sorø' },
      { name: 'Fredensborg' },
    ],
    title: {
      en: 'Europa Grand Tour',
      dk: 'Europæisk Grand Tour',
      de: 'Europäische Grand Tour',
    },
    subtitle: {
      en: '35 days, 10,000 km across 20+ countries on an Africa Twin',
      dk: '35 dage, 10.000 km gennem 20+ lande på en Africa Twin',
      de: '35 Tage, 10.000 km durch 20+ Länder auf einer Africa Twin',
    },
    location: {
      en: 'Across Europe',
      dk: 'Gennem Europa',
      de: 'Quer durch Europa',
    },
    duration: {
      en: '35 days',
      dk: '35 dage',
      de: '35 Tage',
    },
    summary: {
      en: 'A 35-day, ~10,000 km loop across Europe on the Africa Twin — south through Germany, Poland, Czechia, Slovakia, Hungary and Austria into the Balkans, down to Greece and the Turkish border, then back via Italy, the Dolomites, Bavaria, France and the Benelux.',
      dk: 'En 35-dages, ~10.000 km sløjfe gennem Europa på Africa Twin\'en — sydpå gennem Tyskland, Polen, Tjekkiet, Slovakiet, Ungarn og Østrig ind i Balkan, ned til Grækenland og den tyrkiske grænse, og hjem via Italien, Dolomitterne, Bayern, Frankrig og Beneluxlandene.',
      de: 'Eine 35-tägige, ~10.000 km Schleife durch Europa auf der Africa Twin — über Deutschland, Polen, Tschechien, Slowakei, Ungarn und Österreich auf den Balkan, hinunter nach Griechenland und zur türkischen Grenze, zurück über Italien, die Dolomiten, Bayern, Frankreich und die Benelux-Staaten.',
    },
    highlights: {
      en: [
        'Berlin to the Polish border at Cybinka',
        'Bratislava and Győr',
        'Croatian coast: Senj, Pag, Zadar, Plitvice',
        'Banja Luka, Belgrade and the Iron Gates on the Danube',
        'Meteora monasteries and the road south through Greece',
        'Turkish border at Edirne',
        'Ferry from Patras to Italy',
        "San Marino, the Dolomites and Cortina d'Ampezzo",
        'Neuschwanstein / Hohenschwangau',
        'Home via Luxembourg, Belgium and the Netherlands',
      ],
      dk: [
        'Berlin til den polske grænse ved Cybinka',
        'Bratislava og Győr',
        'Kroatiens kyst: Senj, Pag, Zadar, Plitvice',
        'Banja Luka, Beograd og Jernporten på Donau',
        'Meteora-klostrene og sydpå gennem Grækenland',
        'Tyrkisk grænse ved Edirne',
        'Færge fra Patras til Italien',
        "San Marino, Dolomitterne og Cortina d'Ampezzo",
        'Neuschwanstein / Hohenschwangau',
        'Hjem via Luxembourg, Belgien og Holland',
      ],
      de: [
        'Berlin bis zur polnischen Grenze bei Cybinka',
        'Bratislava und Győr',
        'Kroatische Küste: Senj, Pag, Zadar, Plitvice',
        'Banja Luka, Belgrad und das Eiserne Tor an der Donau',
        'Meteora-Klöster und die Reise südwärts durch Griechenland',
        'Türkische Grenze bei Edirne',
        'Fähre von Patras nach Italien',
        "San Marino, Dolomiten und Cortina d'Ampezzo",
        'Neuschwanstein / Hohenschwangau',
        'Heim über Luxemburg, Belgien und die Niederlande',
      ],
    },
    story: {
      en: ['Placeholder — add trip notes later.'],
      dk: ['Placeholder — tilføj tur-noter senere.'],
      de: ['Platzhalter — Tournotizen später ergänzen.'],
    },
  },
  {
    slug: 'sverige-tur',
    dateSort: '2024-08',
    distanceKm: 1155,
    color: 'from-blue-400/20 to-indigo-400/20',
    hexColor: '#3b82f6',
    bike: 'Yamaha R7 (2022)',
    waypoints: [
      { name: 'Fredensborg' },
      { name: 'Helsingør' },
      { name: 'Västra Kullaberg' },
      { name: 'Jonstorp' },
      { name: 'Fjärås' },
      { name: 'Strömstad' },
      { name: 'Kornsjø' },
      { name: 'Otteid' },
      { name: 'Arvika' },
      { name: 'Frändefors' },
      { name: 'Helsingborg' },
      { name: 'Helsingør' },
      { name: 'Fredensborg' },
    ],
    title: {
      en: 'Sweden Loop',
      dk: 'Sverige-tur',
      de: 'Schweden-Tour',
    },
    subtitle: {
      en: 'Southern Sweden from Kullaberg to the Värmland border',
      dk: 'Det sydlige Sverige fra Kullaberg til Värmlands grænse',
      de: 'Südschweden von Kullaberg bis zur Värmland-Grenze',
    },
    location: {
      en: 'Denmark · Sweden',
      dk: 'Danmark · Sverige',
      de: 'Dänemark · Schweden',
    },
    duration: {
      en: 'A few days',
      dk: 'Et par dage',
      de: 'Ein paar Tage',
    },
    summary: {
      en: 'A loop up through western Sweden — Kullaberg cliffs, the west coast to Strömstad, inland through Värmland forests and home via Helsingborg.',
      dk: 'En sløjfe op gennem Vestsverige — Kullabergs klipper, vestkysten op til Strömstad, indlandet gennem Värmlands skove og hjem via Helsingborg.',
      de: 'Eine Schleife durch Westschweden — Klippen am Kullaberg, Westküste bis Strömstad, durch die Värmland-Wälder und zurück über Helsingborg.',
    },
    highlights: {
      en: [
        'Västra Kullaberg cliffs',
        'West coast ride to Strömstad',
        'Värmland forest roads',
        'Ferry crossing Helsingborg → Helsingør',
      ],
      dk: [
        'Västra Kullabergs klipper',
        'Vestkysten op til Strömstad',
        'Skovveje i Värmland',
        'Færge Helsingborg → Helsingør',
      ],
      de: [
        'Klippen am Västra Kullaberg',
        'Westküstenfahrt nach Strömstad',
        'Waldstraßen in Värmland',
        'Fähre Helsingborg → Helsingør',
      ],
    },
    story: {
      en: ['Placeholder — add trip notes later.'],
      dk: ['Placeholder — tilføj tur-noter senere.'],
      de: ['Platzhalter — Tournotizen später ergänzen.'],
    },
  },
  {
    slug: 'norge-tur',
    dateSort: '2024-10',
    distanceKm: 2950,
    color: 'from-red-400/20 to-rose-400/20',
    hexColor: '#ef4444',
    bike: 'Yamaha R7 (2022)',
    waypoints: [
      { name: 'Fredensborg' },
      { name: 'Helsingør' },
      { name: 'Fjärås' },
      { name: 'Tanumshede' },
      { name: 'Hølen' },
      { name: 'Sokna' },
      { name: 'Gol' },
      { name: 'Fossen camping' },
      { name: 'Øystre slidreåne' },
      { name: 'Beitostølen' },
      { name: 'Tessand' },
      { name: 'Nordberg' },
      { name: 'Grotli' },
      { name: 'Hjelledalen' },
      { name: 'Oppstryn' },
      { name: 'Loen' },
      { name: 'Briksdalsbre' },
      { name: 'Byrkjelo' },
      { name: 'Breim' },
      { name: 'Byrkjelo' },
      { name: 'Skei' },
      { name: 'Sogndal' },
      { name: 'Vangsnes' },
      { name: 'Vossestrand' },
      { name: 'Ulvik' },
      { name: 'Skare' },
      { name: 'Røldal' },
      { name: 'Etne' },
      { name: 'Skjoldastraumen' },
      { name: 'Årdal' },
      { name: 'Sognesand' },
      { name: 'Jørpeland' },
      { name: 'Egersund' },
      { name: 'Flekkefjord' },
      { name: 'Mandal' },
      { name: 'Kristiansand' },
      { name: 'Lillesand' },
      { name: 'Grimstad' },
      { name: 'Alti harebakken' },
      { name: 'Tvedestrand' },
      { name: 'Risør' },
      { name: 'Kragerø' },
      { name: 'Langesund' },
      { name: 'Helsingborg' },
      { name: 'Helsingør' },
      { name: 'Fredensborg' },
    ],
    title: {
      en: 'Norway Grand Tour',
      dk: 'Norgestur',
      de: 'Norwegen-Tour',
    },
    subtitle: {
      en: 'Fjords, mountain passes and glacier roads',
      dk: 'Fjorde, bjergpas og gletsjerveje',
      de: 'Fjorde, Bergpässe und Gletscherstraßen',
    },
    location: {
      en: 'Denmark · Sweden · Norway',
      dk: 'Danmark · Sverige · Norge',
      de: 'Dänemark · Schweden · Norwegen',
    },
    duration: {
      en: 'About a week',
      dk: 'Omkring en uge',
      de: 'Etwa eine Woche',
    },
    summary: {
      en: 'A long loop into Norway — mountain plateaus at Beitostølen and Grotli, glacier arm at Briksdalsbre, fjords from Sogndal down to Jørpeland, and the south coast back via Kristiansand.',
      dk: 'En lang sløjfe op gennem Norge — højfjeldet ved Beitostølen og Grotli, gletsjerarmen ved Briksdalsbre, fjordene fra Sogndal ned til Jørpeland, og sydkysten tilbage via Kristiansand.',
      de: 'Eine lange Schleife durch Norwegen — Hochgebirge bei Beitostølen und Grotli, Gletscherarm bei Briksdalsbre, Fjorde von Sogndal bis Jørpeland und die Südküste zurück über Kristiansand.',
    },
    highlights: {
      en: [
        'Briksdalsbre glacier arm',
        'Beitostølen and Grotli mountain plateaus',
        'Sognefjord crossings (Vangsnes, Sogndal)',
        'Lysefjord detour via Jørpeland',
        'South coast ride from Kristiansand',
      ],
      dk: [
        'Gletsjerarmen ved Briksdalsbre',
        'Højfjeldet ved Beitostølen og Grotli',
        'Sognefjord-overfarter (Vangsnes, Sogndal)',
        'Lysefjord-afstikker via Jørpeland',
        'Sydkysten fra Kristiansand',
      ],
      de: [
        'Gletscherarm Briksdalsbre',
        'Hochgebirge bei Beitostølen und Grotli',
        'Sognefjord-Überfahrten (Vangsnes, Sogndal)',
        'Lysefjord-Abstecher über Jørpeland',
        'Südküste ab Kristiansand',
      ],
    },
    story: {
      en: ['Placeholder — add trip notes later.'],
      dk: ['Placeholder — tilføj tur-noter senere.'],
      de: ['Platzhalter — Tournotizen später ergänzen.'],
    },
  },
];

export function getTripBySlug(slug: string): Trip | undefined {
  return trips.find((t) => t.slug === slug);
}
