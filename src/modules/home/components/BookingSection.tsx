'use client'
import { useEffect, useRef, useState } from 'react'
import { useTranslations } from '@/i18n/DictionaryProvider'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const WEEKDAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function pad(n: number) { return String(n).padStart(2, '0') }

interface DateVal { y: number; m: number; d: number }

function DatePicker({ value, onChange }: { value: DateVal | null; onChange: (v: DateVal) => void }) {
  const today = new Date()
  const [open, setOpen] = useState(false)
  const [viewM, setViewM] = useState(today.getMonth())
  const [viewY, setViewY] = useState(today.getFullYear())
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false) }
    function onClick(e: MouseEvent) { if (!wrapRef.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('keydown', onKey)
    document.addEventListener('click', onClick)
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('click', onClick) }
  }, [])

  const firstDay = new Date(viewY, viewM, 1).getDay()
  const daysInMonth = new Date(viewY, viewM + 1, 0).getDate()

  const cells: Array<{ d: number; out?: boolean; isToday?: boolean; isSel?: boolean }> = []
  const prevDays = new Date(viewY, viewM, 0).getDate()
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ d: prevDays - i, out: true })
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === today.getDate() && viewM === today.getMonth() && viewY === today.getFullYear()
    const isSel = value ? value.d === d && value.m === viewM && value.y === viewY : false
    cells.push({ d, isToday, isSel })
  }
  const remaining = 7 - (cells.length % 7)
  if (remaining < 7) for (let d = 1; d <= remaining; d++) cells.push({ d, out: true })

  const displayVal = value ? `${pad(value.d)} / ${pad(value.m + 1)} / ${value.y}` : null

  return (
    <div ref={wrapRef} className="relative w-full">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(p => !p)}
        className={[
          'flex h-12 w-full items-center justify-between gap-2 rounded-lg border bg-white px-3 text-left text-sm font-[inherit] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] transition-[border-color,box-shadow]',
          open ? 'border-[#00a8f1] shadow-[0_0_0_3px_rgba(0,168,241,0.20)]' : 'border-[#e5e7f0]',
        ].join(' ')}
      >
        <span className={displayVal ? 'text-[#1e2364]' : 'text-[rgba(30,35,100,0.45)]'}>
          {displayVal ?? 'DD / MM / YYYY'}
        </span>
        <svg className="flex-shrink-0 text-[rgba(30,35,100,0.55)]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </button>
      {open && (
        <div role="dialog" className="absolute left-0 top-[calc(100%+4px)] z-[100] w-[232px] rounded-lg border border-[#e5e7f0] bg-white p-2.5 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05),0_4px_6px_-4px_rgba(0,0,0,0.05)] [animation:cs-open_0.15s_ease-out]" style={{ animationName: 'none', opacity: 1 }}>
          <div className="mb-1.5 flex items-center justify-between px-0.5">
            <button type="button" onClick={() => { if (viewM === 0) { setViewM(11); setViewY(y => y - 1) } else setViewM(m => m - 1) }} className="flex h-6 w-6 items-center justify-center rounded border border-[#e5e7f0] bg-white text-[#1e2364] hover:border-[#00a8f1] hover:bg-[rgba(0,168,241,0.08)]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span className="text-[13px] font-semibold tracking-[-0.2px] text-[#1e2364]">{MONTHS[viewM]} {viewY}</span>
            <button type="button" onClick={() => { if (viewM === 11) { setViewM(0); setViewY(y => y + 1) } else setViewM(m => m + 1) }} className="flex h-6 w-6 items-center justify-center rounded border border-[#e5e7f0] bg-white text-[#1e2364] hover:border-[#00a8f1] hover:bg-[rgba(0,168,241,0.08)]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
          <div className="mb-0.5 grid grid-cols-7 gap-0.5">
            {WEEKDAYS.map(d => (
              <span key={d} className="py-1 text-center text-[10px] font-semibold uppercase tracking-[0.04em] text-[rgba(30,35,100,0.45)]">{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((cell, ci) => (
              <button
                key={ci}
                type="button"
                disabled={cell.out}
                onClick={() => {
                  if (!cell.out) { onChange({ y: viewY, m: viewM, d: cell.d }); setOpen(false) }
                }}
                className={[
                  'flex h-[26px] items-center justify-center rounded border-none bg-transparent text-[12px] font-[inherit] text-[#1e2364]',
                  cell.out ? 'cursor-default text-[rgba(30,35,100,0.25)]' : 'cursor-pointer hover:bg-[rgba(0,168,241,0.10)]',
                  cell.isToday ? 'underline decoration-[#00a8f1] decoration-2 underline-offset-[3px]' : '',
                  cell.isSel ? '!bg-transparent !font-bold !text-[#00a8f1]' : '',
                ].join(' ')}
              >
                {cell.d}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ExamSelect({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void; options: readonly string[]; placeholder: string
}) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false) }
    function onClick(e: MouseEvent) { if (!wrapRef.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('keydown', onKey)
    document.addEventListener('click', onClick)
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('click', onClick) }
  }, [])

  return (
    <div ref={wrapRef} className="relative w-full">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(p => !p)}
        className={[
          'flex h-12 w-full items-center justify-between gap-2 rounded-lg border bg-white px-3 text-left text-sm font-[inherit] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] transition-[border-color,box-shadow]',
          open ? 'border-[#00a8f1] shadow-[0_0_0_3px_rgba(0,168,241,0.20)]' : 'border-[#e5e7f0]',
        ].join(' ')}
      >
        <span className={`flex-1 truncate text-left ${value ? 'text-[#1e2364]' : 'text-[rgba(30,35,100,0.45)]'}`}>
          {value || placeholder}
        </span>
        <svg className={`flex-shrink-0 text-[rgba(30,35,100,0.55)] transition-transform duration-150 ${open ? 'rotate-180' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <ul role="listbox" className="absolute left-0 top-[calc(100%+4px)] z-[100] w-full list-none rounded-lg border border-[#e5e7f0] bg-white p-1 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05)] [animation:none] [max-height:24rem] overflow-y-auto">
          {options.map(opt => (
            <li
              key={opt}
              role="option"
              aria-selected={value === opt}
              onClick={() => { onChange(opt); setOpen(false) }}
              className="relative flex cursor-pointer select-none items-center rounded-md py-1.5 pl-8 pr-2 text-sm text-[#1e2364] transition-colors hover:bg-[rgba(0,168,241,0.08)]"
            >
              {value === opt && (
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center text-[#1e2364]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
              )}
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function BookingSection() {
  const content = useTranslations('home')
  const [exam, setExam] = useState('')
  const [city, setCity] = useState('')
  const [date, setDate] = useState<DateVal | null>(null)

  return (
    <section id="booking" className="relative z-50 px-4 pb-[60px] pt-[100px] md:px-7">
      {/* Mascot */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[9%] top-[6px] z-[6] hidden h-[320px] w-[190px] [animation:mascotFloat_7s_cubic-bezier(0.45,0,0.55,1)_infinite,mascotSway_9s_cubic-bezier(0.45,0,0.55,1)_infinite] [background-image:url('/demo-assets/character3.svg')] [background-position:center] [background-repeat:no-repeat] [background-size:contain] [transform:scaleX(-1)] xl:block"
      />

      <div className="relative mx-auto max-w-[1100px]">
        <div className="relative overflow-visible rounded-[32px] border-2 border-[#1e2364] bg-white px-14 pb-[90px] pt-[46px] text-center">
          {/* Corner pattern */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-px right-0 top-0 h-[120px] w-[120px]"
            style={{
              backgroundImage: `url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpolygon points='7.1 14.8 0 14.8 0 0 15.1 0 15.1 7.1 7.1 7.1 7.1 14.8' fill='%2300a8f1' fill-opacity='0.18'/%3E%3Cpolygon points='15.5 23.1 8.4 23.1 8.4 8.3 23.5 8.3 23.5 15.4 15.5 15.4 15.5 23.1' fill='%231e2364' fill-opacity='0.18'/%3E%3C/svg%3E")`,
              backgroundSize: '60px 60px',
              backgroundRepeat: 'repeat',
              maskImage: 'radial-gradient(circle at top right, #000, transparent 70%)',
              WebkitMaskImage: 'radial-gradient(circle at top right, #000, transparent 70%)',
            }}
          />

          {/* Eyebrow */}
          <span className="relative left-1/2 mb-3.5 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-[rgba(0,222,201,0.16)] px-3.5 py-[5px] text-[12px] font-bold uppercase tracking-[2px] text-[#007a6e] before:h-[7px] before:w-[7px] before:rounded-full before:bg-[#00dec9] before:shadow-[0_0_8px_#00dec9] before:content-['']">
            {content.booking.eyebrow}
          </span>

          <h2 className="relative z-10 mx-auto mb-9 text-[clamp(28px,3.4vw,42px)] font-extrabold leading-[1.1] tracking-[-1.2px] text-[#1e2364]">
            {content.booking.title}
          </h2>

          <form onSubmit={e => e.preventDefault()} className="relative z-[5] grid items-end gap-[18px] text-left md:grid-cols-[1.2fr_1.2fr_1fr_auto]">
            <div>
              <label className="mb-2 ml-1.5 block text-[13px] font-bold text-[#1e2364]">{content.booking.fields.exam}</label>
              <ExamSelect
                value={exam}
                onChange={setExam}
                options={content.booking.examOptions}
                placeholder={content.booking.fields.examPlaceholder}
              />
            </div>
            <div>
              <label className="mb-2 ml-1.5 block text-[13px] font-bold text-[#1e2364]">{content.booking.fields.city}</label>
              <input
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder={content.booking.fields.cityPlaceholder}
                className="h-12 w-full rounded-lg border border-[#e5e7f0] bg-white px-3 text-sm text-[#1e2364] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] outline-none placeholder:text-[rgba(30,35,100,0.45)] focus:border-[#00a8f1] focus:shadow-[0_0_0_3px_rgba(0,168,241,0.20)]"
              />
            </div>
            <div>
              <label className="mb-2 ml-1.5 block text-[13px] font-bold text-[#1e2364]">{content.booking.fields.date}</label>
              <DatePicker value={date} onChange={setDate} />
            </div>
            <button
              type="submit"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-[#1e2364] px-[22px] text-[14px] font-semibold text-white shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] transition hover:bg-[#233567]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              {content.booking.fields.search}
            </button>
          </form>

          {/* Notice */}
          <div className="absolute bottom-10 left-14 right-14 z-[2] flex items-start gap-1">
            <div
              aria-hidden="true"
              className="mt-[3px] h-2.5 w-2.5 flex-shrink-0"
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3E%3Cpath d='M 0 0 L 30 0 L 30 10 L 10 10 L 10 30 L 0 30 Z' fill='%2300a8f1'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'contain',
              }}
            />
            <p className="text-[11.5px] font-medium leading-[1.45] text-[#6b7196]">
              {content.booking.note}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
