import { Toaster as SonnerToaster, toast, type ToasterProps } from 'sonner'

// Sonner toast pre-themed against our shadcn variables so toasts
// pick up the brand palette automatically (dark surface, brand
// accents). Wrap the host app once in `<Toaster />` and call
// `toast()` from anywhere.
const Toaster = ({ ...props }: ToasterProps) => (
    <SonnerToaster
        theme="dark"
        className="toaster group"
        toastOptions={{
            classNames: {
                toast:
                    'group toast group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border group-[.toaster]:border-border group-[.toaster]:shadow-lg',
                description: 'group-[.toast]:text-muted-foreground',
                actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
                cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
            },
        }}
        {...props}
    />
)

export { Toaster, toast }
