"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellRing, CircleUserRound, Gauge, House, Map, Menu, ShieldAlert, Siren, Waves, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { buttonVariants } from "./ui/button";

const links = [{ href:"/map", label:"Live map", icon:Map },{ href:"/report",label:"Report",icon:Waves },{ href:"/dashboard",label:"Dashboard",icon:Gauge }];
export function SiteNav() {
  const path = usePathname(); const [open,setOpen]=useState(false);
  return <>
    <header className="sticky top-0 z-[1000] border-b border-[var(--border)] bg-[var(--card)]/90 backdrop-blur-xl">
      <div className="page-shell flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-black tracking-tight" aria-label="Baha Tracker home"><span className="grid size-9 place-items-center rounded-xl bg-[var(--primary)] text-white"><Waves size={20}/></span>BAHA <span className="text-[var(--secondary)]">TRACKER</span></Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">{links.map(x=><Link key={x.href} href={x.href} className={cn("rounded-lg px-3 py-2 text-sm font-bold text-[var(--muted-fg)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]",path===x.href&&"bg-[var(--muted)] text-[var(--primary)]")}>{x.label}</Link>)}</nav>
        <div className="hidden items-center gap-2 md:flex"><ThemeToggle/><Link href="/login" className={buttonVariants({variant:"ghost",size:"sm"})}>Log in</Link><Link href="/emergency" className={buttonVariants({variant:"danger",size:"sm"})}><Siren size={16}/>Emergency</Link></div>
        <button className="grid size-11 place-items-center rounded-xl hover:bg-[var(--muted)] md:hidden" aria-label="Toggle menu" aria-expanded={open} onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button>
      </div>
      {open&&<nav className="page-shell grid gap-1 border-t border-[var(--border)] py-3 md:hidden">{[...links,{href:"/profile",label:"Profile",icon:CircleUserRound},{href:"/emergency",label:"Emergency SOS",icon:Siren}].map(x=><Link key={x.href} href={x.href} onClick={()=>setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 font-bold hover:bg-[var(--muted)]"><x.icon size={19}/>{x.label}</Link>)}</nav>}
    </header>
    <nav className="fixed inset-x-0 bottom-0 z-[1000] grid grid-cols-5 border-t border-[var(--border)] bg-[var(--card)]/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden" aria-label="Mobile navigation">
      {[{href:"/",label:"Home",icon:House},...links.slice(0,2),{href:"/dashboard",label:"Status",icon:BellRing},{href:"/emergency",label:"SOS",icon:ShieldAlert}].map(x=><Link key={x.href} href={x.href} className={cn("flex min-h-16 flex-col items-center justify-center gap-1 text-[10px] font-extrabold text-[var(--muted-fg)]",path===x.href&&"text-[var(--primary)]",x.href==="/emergency"&&"text-[var(--danger)]")}><x.icon size={20}/>{x.label}</Link>)}
    </nav>
  </>;
}
