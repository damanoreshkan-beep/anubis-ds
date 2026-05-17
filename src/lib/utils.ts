import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Standard shadcn className helper — joins conditional classes with
// clsx then resolves Tailwind conflicts (so the *last* `px-4` wins
// over an earlier `px-2`) via tailwind-merge.
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}
