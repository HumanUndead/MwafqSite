'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { useTranslations } from '@/i18n/DictionaryProvider';
import { ReorderIcon } from '@/shared/components/icons/reservations';
import { EASE } from '../constants';

export function ReorderAppointmentLink({ className }: { className: string }) {
  const [spin, setSpin] = useState(0);
  const t = useTranslations('profileReservations');
  return (
    <Link
      href="#"
      data-cursor
      onMouseEnter={() => {
        setSpin((n) => n + 1);
      }}
      className={className}
    >
      {t.reorder}
      <motion.span
        key={spin}
        className="inline-flex size-4 shrink-0 items-center justify-center"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <ReorderIcon className="size-4 text-current" />
      </motion.span>
    </Link>
  );
}
