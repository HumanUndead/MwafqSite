'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

type NotFoundViewProps = {
  code?: string;
  title: string;
  message: string;
  cta: string;
  homeHref: string;
};

export function NotFoundView({
  code = '404',
  title,
  message,
  cta,
  homeHref,
}: NotFoundViewProps) {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-[#f3f4f8] px-6 text-center'>
      <motion.div
        className='flex flex-col items-center gap-6'
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo */}
        <motion.img
          src='/demo-assets/logo.svg'
          alt='Mwafq'
          className='mb-2 h-14 w-14 object-contain'
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        />

        {/* 404 number */}
        <motion.p
          className='text-[clamp(80px,14vw,140px)] font-extrabold leading-none tracking-[-4px] text-[#1e2364] select-none'
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          {code}
        </motion.p>

        {/* Divider */}
        <motion.div
          className='h-0.75 w-16 rounded-full bg-[#00a8f1]'
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.45, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Title + message */}
        <motion.div
          className='flex flex-col gap-2.5'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <h1 className='text-[clamp(20px,2.5vw,28px)] font-extrabold tracking-[-0.5px] text-[#1e2364]'>
            {title}
          </h1>
          <p className='max-w-105 text-[15px] leading-[1.6] text-[#6b7196]'>
            {message}
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Link
            href={homeHref}
            className='inline-flex h-11 items-center gap-2 rounded-full bg-[#1e2364] px-7 text-[14px] font-semibold text-white no-underline transition-colors duration-300 hover:bg-[#233567]'
          >
            {cta}
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
