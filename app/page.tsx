import Link from "next/link";
import { ArrowRight, CarFront, CheckCircle2, MapPinned, RadioTower, ShieldCheck, Siren, TriangleAlert, Waves } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return <main>
    <section className="grid-texture relative overflow-hidden border-b border-[var(--border)]">
      <div className="absolute -right-24 -top-24 size-[28rem] rounded-full bg-[var(--secondary)]/10 blur-3xl" />
      <div className="page-shell relative grid min-h-[660px] items-center gap-10 py-16 lg:grid-cols-[1.15fr_.85fr]">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-extrabold text-[var(--secondary)] shadow-sm"><RadioTower size={14}/><span className="size-2 rounded-full bg-emerald-500"/>Community-powered flood intelligence</div>
          <h1 className="font-display max-w-3xl text-5xl font-black leading-[.98] tracking-[-.045em] sm:text-6xl lg:text-7xl">Know the water.<br/><span className="text-[var(--primary)]">Navigate with context.</span></h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--muted-fg)]">Baha Tracker connects timely flood observations with responders and communities—so every route decision starts with better information.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/map" className={buttonVariants({size:"lg"})}><MapPinned size={19}/>View live map</Link><Link href="/report" className={buttonVariants({variant:"outline",size:"lg"})}><Waves size={19}/>Report flooding</Link></div>
          <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-[var(--muted-fg)]"><TriangleAlert size={15} className="mt-0.5 shrink-0 text-[var(--warning)]"/>Crowdsourced conditions can change rapidly. Never enter floodwater based on an indicator alone.</p>
        </div>
        <div className="relative mx-auto w-full max-w-md">
          <div className="absolute -inset-8 rotate-3 rounded-[2.5rem] bg-[var(--primary)]/8"/>
          <div className="relative overflow-hidden rounded-[2rem] border border-white/50 bg-[#082b3e] p-5 text-white shadow-2xl shadow-blue-950/20">
            <div className="mb-8 flex items-center justify-between"><span className="text-xs font-black uppercase tracking-[.18em] text-cyan-200">Field snapshot</span><span className="rounded-full bg-white/10 px-3 py-1 text-xs">Live data only</span></div>
            <div className="relative h-64 overflow-hidden rounded-2xl bg-[#0d4052]">
              <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:34px_34px]"/>
              <svg viewBox="0 0 400 260" className="absolute inset-0 h-full w-full" aria-hidden="true"><path d="M-20 200 C60 130 100 220 180 140 S300 70 430 115" fill="none" stroke="#52c8be" strokeWidth="16" opacity=".55"/><path d="M40 -20 C110 50 80 95 160 130 S260 210 330 280" fill="none" stroke="#f8fafc" strokeWidth="4" opacity=".6"/></svg>
              <div className="absolute left-[38%] top-[44%] size-5 rounded-full border-4 border-white bg-red-500 shadow-[0_0_0_8px_rgba(239,68,68,.2)]"/><div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/10 bg-[#071b26]/80 p-3 backdrop-blur"><p className="text-xs text-cyan-100">Condition legend</p><div className="mt-2 flex justify-between text-xs font-bold"><span>● Passable*</span><span className="text-amber-300">● Caution</span><span className="text-red-300">● Hazard</span></div></div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl bg-white/8 p-4"><CarFront size={19} className="text-cyan-300"/><p className="mt-3 text-sm font-bold">Vehicle-aware</p><p className="mt-1 text-xs text-slate-300">Configurable thresholds</p></div><div className="rounded-xl bg-white/8 p-4"><ShieldCheck size={19} className="text-cyan-300"/><p className="mt-3 text-sm font-bold">Verification</p><p className="mt-1 text-xs text-slate-300">Moderation status</p></div></div>
          </div>
        </div>
      </div>
    </section>
    <section className="page-shell py-20"><div className="mb-10 max-w-2xl"><p className="text-xs font-black uppercase tracking-[.18em] text-[var(--secondary)]">Built for decisive moments</p><h2 className="font-display mt-3 text-3xl font-black sm:text-4xl">One shared operating picture</h2></div><div className="grid gap-4 md:grid-cols-3">{[[MapPinned,"Live field observations","See recent community reports, depth, age, and verification on an interactive map."],[CarFront,"Vehicle context","Compare observed depth against configurable vehicle thresholds—with uncertainty stated clearly."],[Siren,"Accountable SOS flow","Create a traceable alert and follow real responder status updates without false delivery claims."]].map(([Icon,title,text])=><article key={String(title)} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow)]"><span className="grid size-11 place-items-center rounded-xl bg-[var(--secondary-soft)] text-[var(--secondary)]"><Icon size={21}/></span><h3 className="font-display mt-5 text-xl font-bold">{title as string}</h3><p className="mt-2 text-sm leading-6 text-[var(--muted-fg)]">{text as string}</p><CheckCircle2 className="mt-5 text-[var(--secondary)]" size={18}/></article>)}</div></section>
    <section className="bg-[var(--primary)] text-white"><div className="page-shell flex flex-col items-start justify-between gap-6 py-12 sm:flex-row sm:items-center"><div><p className="font-display text-2xl font-bold">In immediate danger?</p><p className="mt-1 text-sm text-blue-100">Contact local emergency services first. Baha Tracker supplements—not replaces—official channels.</p></div><Link href="/emergency" className={buttonVariants({variant:"danger",size:"lg"})}><Siren size={19}/>Open emergency SOS<ArrowRight size={18}/></Link></div></section>
    <footer className="page-shell flex flex-col gap-4 py-8 text-xs text-[var(--muted-fg)] sm:flex-row sm:items-center sm:justify-between"><span>© 2026 Baha Tracker. Community observations are informational.</span><div className="flex gap-5"><Link href="/map">Map</Link><Link href="/login">Sign in</Link><Link href="/register">Create account</Link></div></footer>
  </main>;
}
