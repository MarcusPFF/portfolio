-- E.G. booking demo — seed data
-- Re-run for at nulstille mock-data. Truncater først, så ingen dubletter.

truncate table bryllupper restart identity cascade;

with inserted as (
  insert into bryllupper
    (brudepar, bryllupsdato, antal_kuverter, pakke, lokation, vielsestype, koordinator, status, kontakt_email, kontakt_tlf, noter)
  values
    ('Sofie & Mikkel',     '2026-04-25', 120, 'grundpakke', 'den_gamle_lade', 'engestofte_kirke', 'lise',  'afholdt',       'sofie@example.dk',    '+45 28 11 22 33', 'Stort selskab, alt forløb planmæssigt.'),
    ('Anna & Lars',        '2026-06-14',  85, 'festpakke',  'vaerkstedet',    'maribo_domkirke',  'johan', 'booket',        'anna.lars@example.dk','+45 24 55 66 77', 'Sejlads med Anemonen tilkøbt. Mindre intim fest.'),
    ('Mette & Christian',  '2026-07-19', 140, 'grundpakke', 'den_gamle_lade', 'engestofte_kirke', 'lise',  'booket',        'mette.c@example.dk',  '+45 29 88 99 00', 'Højsæson. Live-band, fyrværkeri kl. 23.'),
    ('Camilla & Frederik', '2026-08-23', 180, 'grundpakke', 'den_gamle_lade', 'park',             'johan', 'booket',        'camilla.f@example.dk','+45 22 11 44 55', 'Vielse i parken, ceremoni kl. 14.'),
    ('Emma & Jonas',       '2026-09-12',  60, 'festpakke',  'vaerkstedet',    'borgerlig',        'lise',  'tilbud_sendt',  'emma.j@example.dk',   '+45 26 77 88 99', 'Tilbud sendt 03/05. Afventer svar.'),
    ('Julie & Andreas',    '2027-05-30', 100, null,         null,             null,               'johan', 'forespoergsel', 'julie.a@example.dk',  '+45 21 33 22 11', 'Første henvendelse. Mangler afklaring på pakke og lokation.')
  returning id, brudepar
)
select * from inserted;

do $$
declare
  v_sm uuid; v_al uuid; v_mc uuid; v_cf uuid; v_ej uuid; v_ja uuid;
begin
  select id into v_sm from bryllupper where brudepar = 'Sofie & Mikkel';
  select id into v_al from bryllupper where brudepar = 'Anna & Lars';
  select id into v_mc from bryllupper where brudepar = 'Mette & Christian';
  select id into v_cf from bryllupper where brudepar = 'Camilla & Frederik';
  select id into v_ej from bryllupper where brudepar = 'Emma & Jonas';
  select id into v_ja from bryllupper where brudepar = 'Julie & Andreas';

  insert into opgaver (bryllup_id, titel, kategori, deadline, status, ansvarlig, raekkefoelge) values
    (v_sm, 'Kontakt præst i E.G. Kirke',    'praest',       '2026-02-25', 'done', 'Lise', 1),
    (v_sm, 'Bekræft menu med køkken',             'mad',          '2026-03-25', 'done', 'Lise', 2),
    (v_sm, 'Bestil bryllupskage',                 'andet',        '2026-04-04', 'done', 'Lise', 3),
    (v_sm, 'Slutbetaling',                        'betaling',     '2026-04-11', 'done', 'Lise', 4),
    (v_sm, 'Endelig walkthrough med brudepar',    'koordinering', '2026-04-18', 'done', 'Lise', 5);
  insert into tilkoeb (bryllup_id, type, beskrivelse, pris, status) values
    (v_sm, 'bryllupskage',  'Klassisk hindbær-vanilje, 120 personer', 13320, 'leveret'),
    (v_sm, 'fotografering', 'Hele dagen, 8 timer',                   18000, 'leveret');
  insert into betalinger (bryllup_id, type, beloeb, forfald, betalt_dato, status) values
    (v_sm, 'depositum',    42850,  '2026-02-14', '2026-02-12', 'betalt'),
    (v_sm, 'slutbetaling', 128550, '2026-04-11', '2026-04-10', 'betalt');
  insert into overnatninger (bryllup_id, type, antal_personer, fra_dato, til_dato, pris) values
    (v_sm, 'hospitalet', 2, '2026-04-25', '2026-04-26', 0);

  insert into opgaver (bryllup_id, titel, kategori, deadline, status, ansvarlig, raekkefoelge) values
    (v_al, 'Kontakt præst i Maribo Domkirke',     'praest',       '2026-04-19', 'done',        'Johan', 1),
    (v_al, 'Bekræft sejlads med Anemonen',        'transport',    '2026-05-17', 'done',        'Johan', 2),
    (v_al, 'Bekræft menu med køkken',             'mad',          '2026-05-17', 'in_progress', 'Johan', 3),
    (v_al, 'Bestil bryllupskage',                 'andet',        '2026-05-24', 'todo',        'Johan', 4),
    (v_al, 'Slutbetaling',                        'betaling',     '2026-05-31', 'todo',        'Johan', 5);
  insert into tilkoeb (bryllup_id, type, beskrivelse, pris, status) values
    (v_al, 'sejlads_anemonen', 'Fra Maribo Domkirke til godset', 8500,  'bekraeftet'),
    (v_al, 'bryllupskage',     'Citron-mazarin, 85 personer',    9435,  'forespurgt');
  insert into betalinger (bryllup_id, type, beloeb, forfald, betalt_dato, status) values
    (v_al, 'depositum',    20500, '2026-02-28', '2026-02-26', 'betalt'),
    (v_al, 'slutbetaling', 61625, '2026-05-31', null,         'afventer');
  insert into overnatninger (bryllup_id, type, antal_personer, fra_dato, til_dato, pris) values
    (v_al, 'hospitalet', 2,  '2026-06-14', '2026-06-15', 0),
    (v_al, 'glamping',   8,  '2026-06-14', '2026-06-15', 4800);

  insert into opgaver (bryllup_id, titel, kategori, deadline, status, ansvarlig, raekkefoelge) values
    (v_mc, 'Kontakt præst i E.G. Kirke',    'praest',       '2026-05-24', 'done',        'Lise', 1),
    (v_mc, 'Bekræft live-band',                   'musik',        '2026-06-21', 'in_progress', 'Lise', 2),
    (v_mc, 'Bekræft fyrværkeri (kl. 23)',         'andet',        '2026-07-05', 'todo',        'Lise', 3),
    (v_mc, 'Bestil blomsterdekorationer',         'blomster',     '2026-06-28', 'todo',        'Lise', 4),
    (v_mc, 'Slutbetaling',                        'betaling',     '2026-07-05', 'todo',        'Lise', 5);
  insert into tilkoeb (bryllup_id, type, beskrivelse, pris, status) values
    (v_mc, 'musik',                 'Live-band 4 timer',          22000, 'bekraeftet'),
    (v_mc, 'fyrvaerkeri',           'Stort show, kl. 23',         15000, 'forespurgt'),
    (v_mc, 'blomsterdekorationer',  'Bordpynt + brudebuket',       8400, 'forespurgt');
  insert into betalinger (bryllup_id, type, beloeb, forfald, betalt_dato, status) values
    (v_mc, 'depositum',    49625,  '2026-03-19', '2026-03-18', 'betalt'),
    (v_mc, 'slutbetaling', 148875, '2026-07-05', null,         'afventer');
  insert into overnatninger (bryllup_id, type, antal_personer, fra_dato, til_dato, pris) values
    (v_mc, 'hospitalet', 2, '2026-07-19', '2026-07-20', 0),
    (v_mc, 'grevindens_hus',  6, '2026-07-19', '2026-07-21', 4400);

  insert into opgaver (bryllup_id, titel, kategori, deadline, status, ansvarlig, raekkefoelge) values
    (v_cf, 'Koordinér ceremoni i parken kl. 14',  'koordinering', '2026-07-26', 'in_progress', 'Johan', 1),
    (v_cf, 'Bekræft menu (180 personer)',         'mad',          '2026-07-19', 'todo',        'Johan', 2),
    (v_cf, 'Bestil shuttlebus fra Maribo',        'transport',    '2026-08-02', 'todo',        'Johan', 3),
    (v_cf, 'Slutbetaling',                        'betaling',     '2026-08-09', 'todo',        'Johan', 4);
  insert into tilkoeb (bryllup_id, type, beskrivelse, pris, status) values
    (v_cf, 'shuttlebus',    'Shuttle fra Maribo, 2 afgange',  6500,  'forespurgt'),
    (v_cf, 'fotografering', 'Hele dagen + dronebilleder',    22000,  'bekraeftet');
  insert into betalinger (bryllup_id, type, beloeb, forfald, betalt_dato, status) values
    (v_cf, 'depositum',    62875,  '2026-04-09', '2026-04-08', 'betalt'),
    (v_cf, 'slutbetaling', 188625, '2026-08-09', null,         'afventer');
  insert into overnatninger (bryllup_id, type, antal_personer, fra_dato, til_dato, pris) values
    (v_cf, 'hospitalet', 2, '2026-08-23', '2026-08-24', 0);

  insert into opgaver (bryllup_id, titel, kategori, deadline, status, ansvarlig, raekkefoelge) values
    (v_ej, 'Følg op på tilbud',                    'koordinering', '2026-05-20', 'todo', 'Lise', 1),
    (v_ej, 'Afklar tilkøb (kage, blomster)',       'koordinering', '2026-06-01', 'todo', 'Lise', 2);

  insert into opgaver (bryllup_id, titel, kategori, deadline, status, ansvarlig, raekkefoelge) values
    (v_ja, 'Send pakke-info og prisliste',         'koordinering', '2026-05-18', 'todo', 'Johan', 1),
    (v_ja, 'Foreslå datoer for besigtigelse',      'koordinering', '2026-05-25', 'todo', 'Johan', 2);
end $$;
