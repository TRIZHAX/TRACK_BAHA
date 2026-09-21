export function PageHeader({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description: string; actions?: React.ReactNode }) {
 return <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-xs font-black uppercase tracking-[.18em] text-[var(--secondary)]">{eyebrow}</p><h1 className="font-display text-3xl font-black tracking-tight sm:text-4xl">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-fg)]">{description}</p></div>{actions}</div>;
}
