import type { Localized } from './trips';

export const UI: Record<string, Localized> = {
  adventurer: { en: 'Adventurer', dk: 'Eventyrer', de: 'Abenteurer' },
  motorcycle_trips: {
    en: 'Motorcycle Trips',
    dk: 'Motorcykelture',
    de: 'Motorradtouren',
  },
  intro: {
    en: 'A growing logbook of the rides I have taken — from weekend loops along the Danish coast to multi-week expeditions across Europe. Click any card to read more.',
    dk: 'En voksende logbog over de ture jeg har taget — fra weekend-sløjfer langs den danske kyst til flere uger lange ekspeditioner gennem Europa. Klik på et kort for at læse mere.',
    de: 'Ein wachsendes Logbuch meiner Touren — von Wochenendrunden an der dänischen Küste bis zu mehrwöchigen Expeditionen durch Europa. Klicke auf eine Karte, um mehr zu lesen.',
  },
  overview_on_maps: {
    en: 'Overview on maps',
    dk: 'Oversigt på kort',
    de: 'Übersicht auf der Karte',
  },
  hide_overview: {
    en: 'Hide overview',
    dk: 'Skjul oversigt',
    de: 'Übersicht ausblenden',
  },
  globe_hint: {
    en: 'Click a line to open that trip',
    dk: 'Klik på en linje for at åbne turen',
    de: 'Klicke auf eine Linie, um die Tour zu öffnen',
  },
  sort_latest: { en: 'Latest first', dk: 'Nyeste først', de: 'Neueste zuerst' },
  sort_oldest: { en: 'Oldest first', dk: 'Ældste først', de: 'Älteste zuerst' },
  sort_longest: { en: 'Longest (km)', dk: 'Længste (km)', de: 'Längste (km)' },
  read_more: { en: 'Read more', dk: 'Læs mere', de: 'Mehr lesen' },
  back_to_trips: {
    en: 'Back to all trips',
    dk: 'Tilbage til alle ture',
    de: 'Zurück zu allen Touren',
  },
  all_trips: { en: 'All trips', dk: 'Alle ture', de: 'Alle Touren' },
  highlights: { en: 'Highlights', dk: 'Højdepunkter', de: 'Höhepunkte' },
  the_trip: { en: 'The trip', dk: 'Turen', de: 'Die Reise' },
  pictures: { en: 'Pictures', dk: 'Billeder', de: 'Bilder' },
  pictures_coming_soon: {
    en: 'Pictures coming soon',
    dk: 'Billeder kommer snart',
    de: 'Bilder folgen bald',
  },
};
