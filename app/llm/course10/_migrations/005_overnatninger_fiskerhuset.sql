-- E.G. booking demo — tilføj Fiskerhuset
-- Udvider overnatninger-typen med Fiskerhuset.

alter table overnatninger drop constraint if exists overnatninger_type_check;

alter table overnatninger
  add constraint overnatninger_type_check
  check (type in (
    'hospitalet',
    'hushovmesterboligen',
    'fiskerhuset',
    'grevindens_hus',
    'skovloeberhuset',
    'glamping'
  ));
