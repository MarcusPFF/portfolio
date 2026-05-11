import { notFound } from 'next/navigation';
import { getSupabase } from '../../../_lib/supabase';
import { isUuid } from '../../../_lib/validation';
import type { Bryllup } from '../../../_lib/types';
import SectionHeading from '../../../_components/section-heading';
import WeddingForm from '../../../_components/wedding-form';
import { updateBryllup } from '../../../_actions/weddings';

export const dynamic = 'force-dynamic';

export default async function RedigerBryllupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const supabase = getSupabase();
  const { data } = await supabase
    .from('bryllupper')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!data) notFound();
  const bryllup = data as Bryllup;

  const updateAction = updateBryllup.bind(null, id);

  return (
    <div>
      <SectionHeading
        eyebrow="Rediger"
        title={bryllup.brudepar}
        description="Opdatér detaljerne på bryllupet."
      />
      <WeddingForm
        action={updateAction}
        initialValues={bryllup}
        submitLabel="Gem ændringer"
        cancelHref={`/llm/course10/bryllupper/${id}`}
      />
    </div>
  );
}
