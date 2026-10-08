'use client';

import { ChevronLeft, Download, FileText } from 'lucide-react';
import Link from 'next/link';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { getLocalizedRoute } from '@/i18n/routing';
import { ReservationDetailsSkeleton } from '@/modules/reservations/components/ReservationDetailsSkeleton';
import { ReservationStatusBadge } from '@/modules/reservations/components/ReservationStatusBadge';
import { useReservationDetails } from '@/modules/reservations/hooks/useReservations';
import { ReservationStatus } from '@/modules/reservations/reservationStatus.shared';
import {
  ErrorState,
  InfoItem,
  InfoList,
  Notice,
  PageHeader,
  Panel,
  PanelHeader,
  StatusBadge,
} from '@/shared/components/product';
import { buttonVariants } from '@/shared/components/ui/Button';
import { SarAmount } from '@/shared/components/ui/SarAmount';
import { ROUTES } from '@/shared/constants/routes';
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

function timeRange(from?: string | null, to?: string | null) {
  if (!from) return '';
  return to ? `${from.slice(0, 5)} – ${to.slice(0, 5)}` : from.slice(0, 5);
}

export function ReservationDetailsView({ id }: { id: string }) {
  const t = useTranslations('reservations');
  const d = t.details;
  const locale = useLocale();
  const { data, isLoading, isError, error, refetch } =
    useReservationDetails(id);

  const back = (
    <Link
      href={getLocalizedRoute(locale, ROUTES.MY_RESERVATIONS)}
      className={buttonVariants({
        variant: 'productText',
        size: 'compact',
        className: '-ms-3.5 w-fit',
      })}
    >
      <ChevronLeft className='size-4 rtl:rotate-180' aria-hidden />
      {d.back}
    </Link>
  );

  if (isLoading) {
    return (
      <div className='flex flex-col gap-6'>
        {back}
        <ReservationDetailsSkeleton />
      </div>
    );
  }

  if (isError || !data) {
    const notFound = (error as { status?: number } | null)?.status === 404;
    return (
      <div className='flex flex-col gap-6'>
        {back}
        <Panel>
          <ErrorState
            title={d.notFoundTitle}
            description={notFound ? d.notFound : d.loadError}
            retryLabel={notFound ? undefined : t.retry}
            onRetry={notFound ? undefined : () => void refetch()}
          />
        </Panel>
      </div>
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
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-3'>
        {back}
        <PageHeader title={d.title} />
      </div>

      <Panel className='flex flex-col gap-5'>
        <PanelHeader
          title={data.serviceProviderBranchName}
          action={<ReservationStatusBadge status={data.status} />}
        />
        <InfoList>
          <InfoItem label={d.date}>
            <bdi dir='ltr' className='tabular-nums'>
              {formatDateDMY(data.dateChosen)}
            </bdi>
          </InfoItem>
          <InfoItem label={d.owner}>{data.ownerName}</InfoItem>
          {data.serviceProviderBranchPhone ? (
            <InfoItem label={d.branchPhone}>
              <a
                href={`tel:${data.serviceProviderBranchPhone}`}
                dir='ltr'
                className='rounded-sm text-[#0077ad] underline-offset-4 transition-colors duration-150 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a8f1]'
              >
                {data.serviceProviderBranchPhone}
              </a>
            </InfoItem>
          ) : null}
          <InfoItem label={d.createdBy}>{data.createdByName}</InfoItem>
          <InfoItem label={d.tax}>
            <SarAmount amount={data.sellPriceTax} />
          </InfoItem>
          <InfoItem label={d.finalTotal}>
            <SarAmount amount={data.sellPrice} />
          </InfoItem>
          <InfoItem label={d.orderId} wide>
            <bdi
              dir='ltr'
              className='break-all font-mono text-[13px] font-normal'
            >
              {data.id}
            </bdi>
          </InfoItem>
        </InfoList>
      </Panel>

      {reason?.text ? (
        <Notice tone='warning'>
          {reason.label}: <span className='font-normal'>{reason.text}</span>
        </Notice>
      ) : null}

      {services.length > 0 || groups.length > 0 ? (
        <Panel flush>
          <PanelHeader
            title={d.services}
            className='px-5 pt-5 pb-3 sm:px-6'
            action={
              isComplete && data.isfit !== null ? (
                <StatusBadge tone={data.isfit ? 'success' : 'danger'}>
                  {data.isfit ? d.fitForService : d.notFitForService}
                </StatusBadge>
              ) : undefined
            }
          />
          <ul className='divide-y divide-[#eef0f7] border-t border-[#eef0f7]'>
            {services.map((service) => (
              <li
                key={service.reservationServiceId ?? service.id}
                className='flex items-start justify-between gap-4 px-5 py-4 sm:px-6'
              >
                <div className='min-w-0'>
                  <p className='break-words text-[15px] font-bold text-[#1e2364]'>
                    {service.serviceName}
                  </p>
                  {service.from ? (
                    <p className='text-[13px] font-semibold tabular-nums text-[#6b7196]'>
                      <bdi dir='ltr'>{timeRange(service.from, service.to)}</bdi>
                    </p>
                  ) : null}
                </div>
                <SarAmount
                  amount={service.sellPrice}
                  className='shrink-0 text-[15px] font-semibold text-[#1e2364]'
                />
              </li>
            ))}
            {groups.map((group, index) => (
              <li key={`group-${index}`} className='px-5 py-4 sm:px-6'>
                <div className='flex items-start justify-between gap-4'>
                  <div className='min-w-0'>
                    <p className='text-[15px] font-bold text-[#1e2364]'>
                      {d.group}
                    </p>
                    {group.from ? (
                      <p className='text-[13px] font-semibold tabular-nums text-[#6b7196]'>
                        <bdi dir='ltr'>{timeRange(group.from, group.to)}</bdi>
                      </p>
                    ) : null}
                  </div>
                  <SarAmount
                    amount={group.sellPrice}
                    className='shrink-0 text-[15px] font-semibold text-[#1e2364]'
                  />
                </div>
                {group.services?.length > 0 ? (
                  <div className='mt-2'>
                    <p className='text-[13px] font-semibold text-[#6b7196]'>
                      {d.includedServices}
                    </p>
                    <p className='text-[14px] leading-6 text-[#1e2364]'>
                      {group.services
                        .map((service) => service.serviceName)
                        .join(locale === 'ar' ? '، ' : ', ')}
                    </p>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}

      {attachments.length > 0 ? (
        <Panel flush>
          <PanelHeader
            title={d.attachments}
            description={interpolate(d.attachmentsCount, {
              count: attachments.length,
            })}
            className='px-5 pt-5 pb-3 sm:px-6'
          />
          <ul className='divide-y divide-[#eef0f7] border-t border-[#eef0f7]'>
            {attachments.map((path) => (
              <li
                key={path}
                className='flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6'
              >
                <span className='flex min-w-0 items-center gap-2.5 text-[14px] font-semibold text-[#1e2364]'>
                  <FileText
                    className='size-5 shrink-0 text-[#6b7196]'
                    aria-hidden
                  />
                  <bdi className='break-all'>{attachmentFileName(path)}</bdi>
                </span>
                <span className='flex shrink-0 gap-2'>
                  <a
                    href={attachmentUrl(path)}
                    target='_blank'
                    rel='noopener noreferrer'
                    className={buttonVariants({
                      variant: 'productText',
                      size: 'compact',
                    })}
                  >
                    {d.viewFile}
                  </a>
                  <a
                    href={attachmentUrl(path)}
                    download={attachmentFileName(path)}
                    className={buttonVariants({
                      variant: 'productSecondary',
                      size: 'compact',
                    })}
                  >
                    <Download className='size-4' aria-hidden />
                    {d.download}
                  </a>
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}

      <Panel className='flex flex-col gap-4'>
        <PanelHeader title={d.additionalInformation} />
        {questions.length === 0 ? (
          <p className='text-[14px] leading-6 text-[#6b7196]'>
            {d.noQuestions}
          </p>
        ) : (
          <InfoList>
            {questions.map((item, index) => (
              <InfoItem key={index} label={item.question} wide>
                {item.answer}
              </InfoItem>
            ))}
          </InfoList>
        )}
      </Panel>

      {logs.length > 0 ? (
        <Panel flush>
          <PanelHeader
            title={d.statusHistory}
            description={interpolate(d.timesShownIn, {
              offset: utcOffsetLabel(),
            })}
            className='px-5 pt-5 pb-3 sm:px-6'
          />
          <ol className='divide-y divide-[#eef0f7] border-t border-[#eef0f7]'>
            {logs.map((log) => (
              <li
                key={log.id}
                className='flex flex-col gap-1 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6'
              >
                <ReservationStatusBadge status={log.status} />
                <p className='text-[13px] font-semibold text-[#6b7196]'>
                  <bdi>{formatUtcDateTime(log.createdAt, locale)}</bdi>
                  {log.createdByName ? <> · {log.createdByName}</> : null}
                </p>
              </li>
            ))}
          </ol>
        </Panel>
      ) : null}
    </div>
  );
}
