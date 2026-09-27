'use client';

import {
  AlertTriangle,
  ChevronLeft,
  Download,
  Eye,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { getLocalizedRoute } from '@/i18n/routing';
import { Button } from '@/shared/components/ui/Button';
import { SarAmount } from '@/shared/components/ui/SarAmount';
import { Spinner } from '@/shared/components/ui/Spinner';
import { ROUTES } from '@/shared/constants/routes';
import { cn } from '@/shared/lib/cn';
import {
  formatDateDMY,
  formatUtcDateTime,
  utcOffsetLabel,
} from '@/shared/lib/dates';
import { interpolate } from '@/shared/lib/interpolate';
import {
  attachmentFileName,
  attachmentUrl,
  splitAttachments,
} from '@/shared/lib/media';
import { ReservationStatusBadge } from './components/ReservationStatusBadge';
import { useReservationDetails } from './hooks/useReservations';
import { ReservationStatus } from './reservationStatus.shared';

function Card({ title, children, aside }: { title: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className='rounded-[24px] border-2 border-[#e5e7f0] bg-white p-5'>
      <div className='mb-4 flex items-center justify-between gap-3'>
        <h2 className='text-[16px] font-extrabold text-[#1e2364]'>{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className='rounded-[16px] bg-[#f3f4f8] px-4 py-3'>
      <p className='text-[11.5px] font-bold uppercase tracking-wide text-[#6b7196]'>{label}</p>
      <div className='mt-1 text-sm font-bold text-[#1e2364]'>{children}</div>
    </div>
  );
}

export function ReservationDetailsView({ id }: { id: string }) {
  const t = useTranslations('reservations');
  const d = t.details;
  const locale = useLocale();
  const { data, isLoading, isError, error, refetch } = useReservationDetails(id);
  const backHref = getLocalizedRoute(locale, ROUTES.MY_RESERVATIONS);

  const back = (
    <Link
      href={backHref}
      className='mb-5 inline-flex items-center gap-2 text-[14.5px] font-bold text-[#1e2364] hover:text-[#00a8f1]'
    >
      <ChevronLeft className='size-4 rtl:rotate-180' aria-hidden />
      {d.back}
    </Link>
  );

  if (isLoading) {
    return (
      <section>
        {back}
        <div className='flex justify-center py-20'>
          <Spinner size='lg' />
        </div>
      </section>
    );
  }

  if (isError || !data) {
    const notFound = (error as { status?: number } | null)?.status === 404;
    return (
      <section>
        {back}
        <div className='flex flex-col items-center gap-3 rounded-[24px] border-2 border-dashed border-[#e5e7f0] bg-white px-6 py-14 text-center' role='alert'>
          <p className='text-lg font-extrabold text-[#1e2364]'>{d.notFoundTitle}</p>
          <p className='text-sm text-[#6b7196]'>{notFound ? d.notFound : d.loadError}</p>
          {!notFound && (
            <Button variant='outline' type='button' onClick={() => void refetch()}>
              {t.retry}
            </Button>
          )}
        </div>
      </section>
    );
  }

  const services = data.reservationServices?.services ?? [];
  const groups = data.reservationServices?.groupServices ?? [];
  const attachments = splitAttachments(data.fullPathAttachments);
  const questions = data.reservationQuestionAnswers ?? [];
  const logs = [...(data.statusLogs ?? [])].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  const isComplete = data.status === ReservationStatus.Complete;
  const reason =
    data.status === ReservationStatus.Cancel
      ? { label: d.cancellationReason, text: data.cancelationReason }
      : data.status === ReservationStatus.Reject
        ? { label: d.rejectionReason, text: data.rejectionReason }
        : null;

  return (
    <section className='flex flex-col gap-5'>
      <div>{back}</div>
      <h1 className='text-[clamp(26px,3.4vw,38px)] font-extrabold tracking-[-1px] text-[#1e2364]'>
        {d.title}
      </h1>

      <Card title={data.serviceProviderBranchName} aside={<ReservationStatusBadge status={data.status} />}>
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
          <Field label={d.orderId}>
            <span className='break-all font-mono text-[12.5px]' dir='ltr'>{data.id}</span>
          </Field>
          <Field label={d.createdBy}>{data.createdByName}</Field>
          <Field label={d.owner}>{data.ownerName}</Field>
          <Field label={d.date}>
            <span dir='ltr'>{formatDateDMY(data.dateChosen)}</span>
          </Field>
          {data.serviceProviderBranchPhone && (
            <Field label={d.branchPhone}>
              <a href={`tel:${data.serviceProviderBranchPhone}`} dir='ltr' className='hover:text-[#00a8f1]'>
                {data.serviceProviderBranchPhone}
              </a>
            </Field>
          )}
          <Field label={d.tax}>
            <SarAmount amount={data.sellPriceTax} />
          </Field>
          <Field label={d.finalTotal}>
            <SarAmount amount={data.sellPrice} className='text-[15px]' />
          </Field>
        </div>
      </Card>

      {reason?.text && (
        <div className='flex gap-3 rounded-[20px] border-2 border-red-200 bg-red-50 p-4' role='note'>
          <AlertTriangle className='size-5 shrink-0 text-red-600' aria-hidden />
          <div>
            <p className='text-sm font-extrabold text-red-700'>{reason.label}</p>
            <p className='text-sm text-red-700'>{reason.text}</p>
          </div>
        </div>
      )}

      {(services.length > 0 || groups.length > 0) && (
        <Card
          title={d.services}
          aside={
            isComplete && data.isfit !== null ? (
              <span
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-bold',
                  data.isfit ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                )}
              >
                {data.isfit ? d.fitForService : d.notFitForService}
              </span>
            ) : undefined
          }
        >
          <ul className='flex flex-col gap-2'>
            {services.map((service) => (
              <li key={service.reservationServiceId ?? service.id} className='flex items-center justify-between gap-3 rounded-[14px] bg-[#f3f4f8] px-4 py-3'>
                <div className='min-w-0'>
                  <p className='text-sm font-bold text-[#1e2364]'>{service.serviceName}</p>
                  <p className='text-xs font-semibold tabular-nums text-[#6b7196]' dir='ltr'>
                    {service.from?.slice(0, 5)} – {service.to?.slice(0, 5)}
                  </p>
                </div>
                <SarAmount amount={service.sellPrice} className='text-sm font-bold text-[#1e2364]' />
              </li>
            ))}
            {groups.map((group, index) => (
              <li key={`group-${index}`} className='rounded-[14px] bg-[#f3f4f8] px-4 py-3'>
                <div className='flex items-center justify-between gap-3'>
                  <div>
                    <p className='text-sm font-bold text-[#1e2364]'>{d.group}</p>
                    <p className='text-xs font-semibold tabular-nums text-[#6b7196]' dir='ltr'>
                      {group.from?.slice(0, 5)} – {group.to?.slice(0, 5)}
                    </p>
                  </div>
                  <SarAmount amount={group.sellPrice} className='text-sm font-bold text-[#1e2364]' />
                </div>
                {group.services?.length > 0 && (
                  <>
                    <p className='mt-2 text-[11.5px] font-bold uppercase tracking-wide text-[#6b7196]'>
                      {d.includedServices}
                    </p>
                    <p className='text-sm text-[#1e2364]'>
                      {group.services.map((service) => service.serviceName).join(' · ')}
                    </p>
                  </>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {attachments.length > 0 && (
        <Card title={d.attachments} aside={<span className='text-xs font-semibold text-[#6b7196]'>{interpolate(d.attachmentsCount, { count: attachments.length })}</span>}>
          <ul className='flex flex-col gap-2'>
            {attachments.map((path) => (
              <li key={path} className='flex flex-wrap items-center justify-between gap-3 rounded-[14px] bg-[#f3f4f8] px-4 py-3'>
                <span className='flex min-w-0 items-center gap-2 text-sm font-semibold text-[#1e2364]'>
                  <FileText className='size-4 shrink-0 text-[#00a8f1]' aria-hidden />
                  <span className='truncate'>{attachmentFileName(path)}</span>
                </span>
                <span className='flex gap-2'>
                  <a
                    href={attachmentUrl(path)}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center gap-1 text-[13px] font-bold text-[#00a8f1] hover:text-[#0090d1]'
                  >
                    <Eye className='size-4' aria-hidden />
                    {d.viewFile}
                  </a>
                  <a
                    href={attachmentUrl(path)}
                    download={attachmentFileName(path)}
                    className='inline-flex items-center gap-1 text-[13px] font-bold text-[#1e2364] hover:text-[#00a8f1]'
                  >
                    <Download className='size-4' aria-hidden />
                    {d.download}
                  </a>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card title={d.additionalInformation}>
        {questions.length === 0 ? (
          <p className='text-sm text-[#6b7196]'>{d.noQuestions}</p>
        ) : (
          <dl className='flex flex-col gap-3'>
            {questions.map((item, index) => (
              <div key={index} className='rounded-[14px] bg-[#f3f4f8] px-4 py-3'>
                <dt className='text-sm font-bold text-[#1e2364]'>{item.question}</dt>
                <dd className='mt-1 text-sm text-[#6b7196]'>{item.answer}</dd>
              </div>
            ))}
          </dl>
        )}
      </Card>

      {logs.length > 0 && (
        <Card title={d.statusHistory}>
          <ol className='relative flex flex-col gap-4 border-s-2 border-[#e5e7f0] ps-5'>
            {logs.map((log) => (
              <li key={log.id} className='relative'>
                <span className='absolute -start-[27px] top-1 size-3 rounded-full border-2 border-white bg-[#00a8f1] ring-2 ring-[#e5e7f0]' aria-hidden />
                <ReservationStatusBadge status={log.status} />
                <p className='mt-1 text-xs font-semibold text-[#6b7196]'>
                  {formatUtcDateTime(log.createdAt, locale)}
                  {log.createdByName ? ` · ${log.createdByName}` : ''}
                </p>
              </li>
            ))}
          </ol>
          <p className='mt-4 text-xs font-medium text-[#6b7196]'>
            {interpolate(d.timesShownIn, { offset: utcOffsetLabel() })}
          </p>
        </Card>
      )}
    </section>
  );
}
