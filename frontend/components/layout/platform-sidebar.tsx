"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Command,
  Sparkles,
  Activity,
  Brain,
  Cpu
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { platformNav } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";

export function PlatformSidebar() {
  const pathname = usePathname();
  const { setCommandMenuOpen, setMobileNavOpen } = useUiStore();

  return (
<div
className="
sticky
top-0
h-screen
w-[290px]
flex
flex-col
bg-gradient-to-b
from-[#020817]
via-[#071329]
to-[#020617]
backdrop-blur-2xl
border-r
border-white/10
shadow-[0_0_50px_rgba(56,189,248,0.08)]
"
>

{/* Header */}

<div className="px-5 py-5">

<div className="flex items-center justify-between">

<div>

<Logo href="/dashboard"/>

<p className="
mt-1
text-xs
bg-gradient-to-r
from-cyan-400
via-sky-500
to-purple-500
bg-clip-text
text-transparent
font-medium
">

Adaptive Hiring Engine

</p>

</div>

<ThemeToggle/>

</div>

</div>


{/* Search / Quick jump */}

<div className="px-5">

<Button
variant="outline"
className="
w-full
justify-between
rounded-xl
bg-white/5
border-white/10
hover:bg-white/10
"
onClick={() => setCommandMenuOpen(true)}
>

Quick Jump

<span
className="
text-xs
rounded-md
border
px-2
py-1
"
>

⌘K

</span>

</Button>

</div>


<ScrollArea className="h-[calc(100vh-180px)] px-4 py-6">

{/* OVERVIEW */}

<p className="
mb-2
ml-2
text-[10px]
uppercase
tracking-[0.25em]
text-muted-foreground
">

Overview

</p>

<nav className="space-y-1">

{platformNav.slice(0,3).map((item)=>{

const active=pathname===item.href;
const Icon=item.icon;

  return(

    <Link
    key={item.href}
    href={item.href}
    className={cn(

    "flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300 hover:translate-x-1",

    active
    ? `
    bg-gradient-to-r
    from-cyan-500/20
    to-purple-500/20
    border
    border-cyan-400/30
    shadow-[0_0_20px_rgba(56,189,248,0.2)]
    text-white
    `
    : `
    hover:bg-white/5
    hover:translate-x-1
    text-muted-foreground
    `

    )}

    >

    <Icon className="h-4 w-4"/>

    <span>{item.title}</span>

    </Link>

    );

    })}

    </nav>


    {/* INTELLIGENCE */}

    <p className="
    mt-6
    mb-2
    ml-2
    text-[10px]
    uppercase
    tracking-[0.25em]
    text-muted-foreground
    ">

    Intelligence

    </p>

    <nav className="space-y-1">

    {platformNav.slice(3).map((item)=>{

    const active=pathname===item.href;
    const Icon=item.icon;

    return(

    <Link
    key={item.href}
    href={item.href}
    className={cn(

    "flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300 hover:translate-x-1",

    active
    ? "bg-gradient-to-r from-sky-500/20 to-purple-500/20 border-l-4 border-sky-400"
    : "hover:bg-white/5"

    )}

    >

    <Icon className="h-4 w-4"/>

    <span>{item.title}</span>

    </Link>

    );

    })}

    </nav>


    {/* Runtime card */}

    <div className="
    mt-8
    rounded-2xl
    border
    border-white/10
    bg-white/5
    p-4
    ">

    <div className="flex gap-2 items-center">

    <div className="
    h-2
    w-2
    rounded-full
    bg-green-500
    animate-pulse
    "/>

    <p className="text-sm font-medium">

    Runtime Healthy

    </p>

    </div>

    <p className="
    mt-2
    text-xs
    text-muted-foreground
    ">

    CascadeFlow + Hindsight active

    </p>

    </div>

    </ScrollArea>


    {/* User */}

    <div className="
    border-t
    border-white/10
    p-5
    ">

    <div className="flex items-center gap-3">

    <div className="
    h-10
    w-10
    rounded-full
    bg-gradient-to-r
    from-cyan-400
    to-purple-500
    flex
    items-center
    justify-center
    ">

    👤

    </div>

    <div>

    <p className="text-sm font-medium">
      AI Workspace
    </p>
    <p className="text-xs text-muted-foreground">
      Adaptive Hiring System
    </p>
    <p className="
    text-xs
    text-muted-foreground
    ">

    AI Recruiter Workspace

    </p>

    </div>

    </div>

    </div>

    </div>
  );
}
