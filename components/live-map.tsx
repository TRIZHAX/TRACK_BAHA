"use client";
import dynamic from "next/dynamic";
import { LoaderCircle } from "lucide-react";
const MapCanvas=dynamic(()=>import("./map-canvas"),{ssr:false,loading:()=> <div className="grid h-[560px] place-items-center rounded-2xl bg-[var(--muted)]"><LoaderCircle className="animate-spin"/><span className="sr-only">Loading map</span></div>});
export function LiveMap(){return <MapCanvas/>}
