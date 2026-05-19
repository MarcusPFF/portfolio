-- E.G. booking demo — navngivne overnatningsejendomme
-- Erstatter den generiske brudesuite/sommerhus/glamping-enum med de faktiske
-- ejendomme E.G. tilbyder. Idempotent: drop_constraint + update + add_constraint.

alter table overnatninger drop constraint if exists overnatninger_type_check;

update overnatninger set type = 'hospitalet'        where type = 'brudesuite';
update overnatninger set type = 'grevindens_hus'    where type = 'sommerhus';

alter table overnatninger
  add constraint overnatninger_type_check
  check (type in (
    'hospitalet',
    'hushovmesterboligen',
    'grevindens_hus',
    'skovloeberhuset',
    'glamping'
  ));
