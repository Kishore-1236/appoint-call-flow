import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarCheck, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight text-foreground">
      <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">
        <CalendarCheck className="h-4 w-4" strokeWidth={2.2} />
      </span>
      AppointFlow
    </Link>
  );
}

const links = [
  { label: "Home", to: "/", hash: undefined },
  { label: "How It Works", to: "/", hash: "how-it-works" },
  { label: "Book Appointment", to: "/", hash: "book" },
  { label: "Status", to: "/status", hash: undefined },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          {links.map((l) => (
            <Link key={l.label} to={l.to} hash={l.hash} className="transition-colors hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:block">
          <Button asChild size="sm">
            <Link to="/" hash="book">Book Appointment</Link>
          </Button>
        </div>
        <button className="md:hidden" aria-label="Toggle menu" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-border px-5 py-3 md:hidden">
          {links.map((l) => (
            <Link key={l.label} to={l.to} hash={l.hash} onClick={() => setOpen(false)} className="block py-2 text-sm">
              {l.label}
            </Link>
          ))}
          <Button asChild className="mt-2 w-full">
            <Link to="/" hash="book" onClick={() => setOpen(false)}>Book Appointment</Link>
          </Button>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <Logo />
          <p className="mt-2 text-sm text-muted-foreground">Book an appointment. We'll handle the call.</p>
        </div>
        <nav className="flex flex-wrap gap-6 text-sm text-muted-foreground">
          {links.map((l) => (
            <Link key={l.label} to={l.to} hash={l.hash} className="hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} AppointFlow. All rights reserved.
      </div>
    </footer>
  );
}
