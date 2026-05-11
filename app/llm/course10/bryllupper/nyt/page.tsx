import SectionHeading from '../../_components/section-heading';
import WeddingForm from '../../_components/wedding-form';
import { createBryllup } from '../../_actions/weddings';

export default function NytBryllupPage() {
  return (
    <div>
      <SectionHeading
        eyebrow="Nyt bryllup"
        title="Opret bryllup"
        description="Brudepar og dato er påkrævet. Resten kan udfyldes senere efterhånden som detaljer falder på plads."
      />
      <WeddingForm
        action={createBryllup}
        submitLabel="Opret bryllup"
        cancelHref="/llm/course10/bryllupper"
      />
    </div>
  );
}
