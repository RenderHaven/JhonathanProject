import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Mail, Phone } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="text-[10px] uppercase tracking-luxury text-muted-foreground">
              By Jonathan Ch · Est. 2014
            </p>
            <h3 className="mt-4 font-display text-4xl leading-[1.05] md:text-5xl">
              Let's create something{" "}
              <span className="italic text-gold">beautiful.</span>
            </h3>
            <Link
              to="/contact"
              className="mt-8 inline-flex items-center gap-3 border-b border-foreground pb-1 text-xs uppercase tracking-luxury hover:border-gold hover:text-gold"
            >
              Start a conversation →
            </Link>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-[10px] uppercase tracking-luxury text-muted-foreground">
              Explore
            </h4>
            <ul className="mt-5 space-y-3 font-display text-xl">
              <li><Link to="/" className="hover:text-gold">Home</Link></li>
              <li><Link to="/portfolio" className="hover:text-gold">Portfolio</Link></li>
              <li><Link to="/services" className="hover:text-gold">Services</Link></li>
              <li><Link to="/contact" className="hover:text-gold">Contact</Link></li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h4 className="text-[10px] uppercase tracking-luxury text-muted-foreground">
              Studio
            </h4>
            <ul className="mt-5 space-y-3 text-sm text-foreground/80">
              <li className="flex items-center gap-3"><Mail className="h-4 w-4 text-gold" /> hello@byjonathan.ch</li>
              <li className="flex items-center gap-3"><Phone className="h-4 w-4 text-gold" /> +91 90000 00000</li>
            </ul>
            <div className="mt-6 flex items-center gap-3">
              <a href="#" aria-label="Instagram" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 transition hover:border-gold hover:text-gold">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Facebook" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 transition hover:border-gold hover:text-gold">
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-6 text-[11px] uppercase tracking-luxury text-muted-foreground md:flex-row lg:px-10">
          <p>© {new Date().getFullYear()} By Jonathan Ch. All rights reserved.</p>
          <Link to="/admin/login" className="opacity-60 hover:text-foreground hover:opacity-100">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
