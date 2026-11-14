'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { enquirySchema, type Enquiry } from '@/lib/validation';
import { services } from '@/lib/content';
export default function EnquiryForm({
  kind,
  brief = '',
}: {
  kind: string;
  brief?: string;
}) {
  const [status, setStatus] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Enquiry>({
    resolver: zodResolver(enquirySchema),
    defaultValues: { kind, message: brief, consent: false, website: '' },
  });
  async function submit(data: Enquiry) {
    setStatus('');
    try {
      const r = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await r.json();
      setStatus(
        typeof result.message === 'string'
          ? result.message
          : 'Unable to send right now. Please email info@vrksolutions.in.',
      );
    } catch {
      setStatus(
        'Unable to send right now. Please email info@vrksolutions.in or contact us on WhatsApp.',
      );
    }
  }
  return (
    <form className="enquiry-form" onSubmit={handleSubmit(submit)} noValidate>
      <input type="hidden" {...register('kind')} />
      <div className="form-grid">
        {[
          ['name', 'Your name', 'text'],
          ['email', 'Work email', 'email'],
          ['company', 'Company (optional)', 'text'],
          ['phone', 'Phone (optional)', 'tel'],
        ].map(([key, label, type]) => (
          <label key={key}>
            {label}
            <input
              type={type}
              autoComplete={
                key === 'name'
                  ? 'name'
                  : key === 'email'
                    ? 'email'
                    : key === 'phone'
                      ? 'tel'
                      : 'organization'
              }
              {...register(key as 'name')}
            />
            <span className="field-error">
              {errors[key as keyof Enquiry]?.message}
            </span>
          </label>
        ))}
      </div>
      <label>
        Service of interest
        <select {...register('service')}>
          <option value="">Please select</option>
          {services.map((s) => (
            <option key={s.slug}>{s.title}</option>
          ))}
        </select>
        <span className="field-error">{errors.service?.message}</span>
      </label>
      <label>
        Tell us about your project
        <textarea rows={6} {...register('message')} />
        <span className="field-error">{errors.message?.message}</span>
      </label>
      <label className="honeypot" aria-hidden="true">
        Website
        <input tabIndex={-1} autoComplete="off" {...register('website')} />
      </label>
      <label className="consent">
        <input type="checkbox" {...register('consent')} />
        <span>
          I agree to the <Link href="/privacy-policy">privacy policy</Link> and
          consent to being contacted about my enquiry.
        </span>
      </label>
      <span className="field-error">{errors.consent?.message}</span>
      <button className="button" disabled={isSubmitting}>
        {isSubmitting ? 'Sending enquiry…' : 'Send enquiry ↗'}
      </button>
      <p role="status">{status}</p>
    </form>
  );
}
