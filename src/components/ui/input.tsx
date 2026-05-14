import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

const inputAffixGroupClass =
  "flex h-8 w-full min-w-0 items-center gap-2 rounded-lg border border-input bg-transparent px-2.5 transition-colors outline-none has-[input:disabled]:pointer-events-none has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-50 has-[input[aria-invalid=true]]:border-destructive has-[input[aria-invalid=true]]:ring-3 has-[input[aria-invalid=true]]:ring-destructive/20 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30 dark:has-[input:disabled]:bg-input/80 dark:has-[input[aria-invalid=true]]:border-destructive/50 dark:has-[input[aria-invalid=true]]:ring-destructive/40"

const inputAffixSlotClass =
  "inline-flex shrink-0 items-center text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"

const inputStandaloneClass =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"

const inputInAffixGroupClass =
  "h-full min-h-0 min-w-0 flex-1 border-0 bg-transparent px-0 py-0 text-base shadow-none ring-0 outline-none file:border-0 file:bg-transparent placeholder:text-muted-foreground focus-visible:border-transparent focus-visible:ring-0 disabled:bg-transparent md:text-sm dark:bg-transparent dark:disabled:bg-transparent"

export type InputProps = Omit<React.ComponentProps<"input">, "prefix"> & {
  /** Renders before the field (e.g. icon). Enables affix layout when set with or without `suffix`. */
  prefix?: React.ReactNode
  /** Renders after the field (e.g. icon or unit). */
  suffix?: React.ReactNode
  /**
   * When `prefix` / `suffix` are set, merged onto the outer `data-slot="input-group"` wrapper.
   * Use to restyle (e.g. borderless inside a custom shell).
   */
  affixWrapperClassName?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, type, prefix, suffix, affixWrapperClassName, ...props },
  ref
) {
  const hasAffix = prefix != null || suffix != null

  const control = (
    <InputPrimitive
      ref={ref}
      type={type}
      data-slot="input"
      className={cn(
        hasAffix ? inputInAffixGroupClass : inputStandaloneClass,
        className
      )}
      {...props}
    />
  )

  if (!hasAffix) {
    return control
  }

  return (
    <div
      data-slot="input-group"
      className={cn(inputAffixGroupClass, affixWrapperClassName)}
    >
      {prefix != null ? (
        <span data-slot="input-prefix" className={inputAffixSlotClass}>
          {prefix}
        </span>
      ) : null}
      {control}
      {suffix != null ? (
        <span data-slot="input-suffix" className={inputAffixSlotClass}>
          {suffix}
        </span>
      ) : null}
    </div>
  )
})

export { Input }
