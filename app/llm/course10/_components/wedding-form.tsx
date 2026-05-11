'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import type { Bryllup } from '../_lib/types';
import type { WeddingFormState } from '../_actions/weddings';
import {
  KOORDINATOR_LABELS,
  LOKATION_LABELS,
  PAKKE_LABELS,
  STATUS_LABELS,
  VIELSESTYPE_LABELS,
} from '../_lib/formatting';

type Action = (
  state: WeddingFormState,
  fd: FormData,
) => Promise<WeddingFormState>;

export default function WeddingForm({
  action,
  initialValues,
  submitLabel,
  cancelHref,
}: {
  action: Action;
  initialValues?: Partial<Bryllup>;
  submitLabel: string;
  cancelHref: string;
}) {
  const [state, formAction, pending] = useActionState<WeddingFormState, FormData>(
    action,
    { status: 'idle' },
  );

  const errors = state.status === 'error' ? state.errors : {};

  return (
    <form action={formAction} className="space-y-10">
      {errors.general ? (
        <div className="bg-[#e9d4cd] border border-[#c89a8e] text-[#7a3327] px-4 py-3 rounded-md text-sm">
          {errors.general}
        </div>
      ) : null}

      <Group title="Bryllup">
        <Field
          label="Brudepar"
          name="brudepar"
          required
          error={errors.brudepar}
          defaultValue={initialValues?.brudepar ?? ''}
          placeholder="Sofie & Mikkel"
          maxLength={120}
        />
        <Row>
          <Field
            label="Bryllupsdato"
            name="bryllupsdato"
            type="date"
            required
            error={errors.bryllupsdato}
            defaultValue={initialValues?.bryllupsdato ?? ''}
          />
          <SelectField
            label="Status"
            name="status"
            required
            error={errors.status}
            defaultValue={initialValues?.status ?? 'forespoergsel'}
            options={Object.entries(STATUS_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
          />
        </Row>
      </Group>

      <Group title="Pakke og lokation">
        <Row>
          <SelectField
            label="Pakke"
            name="pakke"
            error={errors.pakke}
            defaultValue={initialValues?.pakke ?? ''}
            options={[
              { value: '', label: 'Ikke valgt' },
              ...Object.entries(PAKKE_LABELS).map(([value, label]) => ({
                value,
                label,
              })),
            ]}
          />
          <Field
            label="Antal kuverter"
            name="antal_kuverter"
            type="number"
            min={1}
            max={500}
            error={errors.antal_kuverter}
            defaultValue={initialValues?.antal_kuverter?.toString() ?? ''}
          />
        </Row>
        <Row>
          <SelectField
            label="Lokation"
            name="lokation"
            error={errors.lokation}
            defaultValue={initialValues?.lokation ?? ''}
            options={[
              { value: '', label: 'Ikke valgt' },
              ...Object.entries(LOKATION_LABELS).map(([value, label]) => ({
                value,
                label,
              })),
            ]}
          />
          <SelectField
            label="Vielse"
            name="vielsestype"
            error={errors.vielsestype}
            defaultValue={initialValues?.vielsestype ?? ''}
            options={[
              { value: '', label: 'Ikke valgt' },
              ...Object.entries(VIELSESTYPE_LABELS).map(([value, label]) => ({
                value,
                label,
              })),
            ]}
          />
        </Row>
        <SelectField
          label="Koordinator"
          name="koordinator"
          error={errors.koordinator}
          defaultValue={initialValues?.koordinator ?? ''}
          options={[
            { value: '', label: 'Ikke tildelt' },
            ...Object.entries(KOORDINATOR_LABELS).map(([value, label]) => ({
              value,
              label,
            })),
          ]}
        />
      </Group>

      <Group title="Kontakt">
        <p className="text-xs text-[#75695b] mb-3">
          Opslagsfelter til koordinatoren. Systemet sender aldrig noget direkte
          til brudeparret.
        </p>
        <Row>
          <Field
            label="Email"
            name="kontakt_email"
            type="email"
            error={errors.kontakt_email}
            defaultValue={initialValues?.kontakt_email ?? ''}
            placeholder="sofie@example.dk"
          />
          <Field
            label="Telefon"
            name="kontakt_tlf"
            type="tel"
            defaultValue={initialValues?.kontakt_tlf ?? ''}
            placeholder="+45 28 11 22 33"
          />
        </Row>
      </Group>

      <Group title="Noter">
        <TextareaField
          label="Interne noter"
          name="noter"
          defaultValue={initialValues?.noter ?? ''}
          placeholder="Detaljer der ikke passer i de øvrige felter."
          rows={4}
        />
      </Group>

      <div className="flex items-center gap-3 pt-4 border-t border-[#dad3c4]">
        <button
          type="submit"
          disabled={pending}
          className="px-5 py-2 bg-[#3d4a3a] text-[#f0ede2] rounded-md text-sm font-medium hover:bg-[#2e3a2c] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {pending ? 'Gemmer…' : submitLabel}
        </button>
        <Link
          href={cancelHref}
          className="px-5 py-2 text-sm text-[#2a2723] hover:bg-[#dad3c4]/40 rounded-md transition-colors"
        >
          Annullér
        </Link>
      </div>
    </form>
  );
}

function Group({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="display text-2xl text-[#2a2723] mb-5 pb-2 border-b border-[#dad3c4]">
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid sm:grid-cols-2 gap-4">{children}</div>;
}

const inputClasses =
  'w-full px-3 py-2 bg-[#fffdf8] border border-[#dad3c4] rounded-md text-sm text-[#2a2723] placeholder:text-[#a89b87] focus:outline-none focus:border-[#3d4a3a] focus:ring-1 focus:ring-[#3d4a3a]/30';

function Label({
  htmlFor,
  children,
  required,
}: {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-[11px] font-medium tracking-[0.12em] uppercase text-[#75695b] mb-1.5"
    >
      {children}
      {required ? <span className="text-[#7a3327] ml-0.5">*</span> : null}
    </label>
  );
}

function ErrorMessage({ error }: { error?: string }) {
  if (!error) return null;
  return <p className="text-xs text-[#7a3327] mt-1">{error}</p>;
}

function Field({
  label,
  name,
  type = 'text',
  required,
  error,
  defaultValue,
  placeholder,
  maxLength,
  min,
  max,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  error?: string;
  defaultValue?: string;
  placeholder?: string;
  maxLength?: number;
  min?: number;
  max?: number;
}) {
  return (
    <div>
      <Label htmlFor={name} required={required}>
        {label}
      </Label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        maxLength={maxLength}
        min={min}
        max={max}
        className={inputClasses}
      />
      <ErrorMessage error={error} />
    </div>
  );
}

function SelectField({
  label,
  name,
  required,
  error,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  required?: boolean;
  error?: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <Label htmlFor={name} required={required}>
        {label}
      </Label>
      <select
        id={name}
        name={name}
        required={required}
        defaultValue={defaultValue}
        className={inputClasses}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ErrorMessage error={error} />
    </div>
  );
}

function TextareaField({
  label,
  name,
  defaultValue,
  placeholder,
  rows = 3,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <textarea
        id={name}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        rows={rows}
        className={inputClasses}
      />
    </div>
  );
}
