import { Link } from "@tanstack/react-router";
import { Instagram, Mail, Phone } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-full bg-gradient-brand" />
            <span className="font-display text-xl font-semibold">
              By Jonathan <span className="text-gradient-brand">Ch</span>
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Weddings, birthdays, corporate events — captured with cinematic
            intent and a quiet eye for the unscripted.
          </p>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold">Explore</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/portfolio" className="hover:text-foreground">Portfolio</Link></li>
            <li><Link to="/services" className="hover:text-foreground">Services</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
            <li><Link to="/cart" className="hover:text-foreground">Cart</Link></li>
            <li><Link to="/admin/login" className="hover:text-foreground">Admin</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold">Reach out</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> hello@byjonathan.ch</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +91 90000 00000</li>
            <li className="flex items-center gap-2"><Instagram className="h-4 w-4" /> @byjonathan.ch</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/40">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} By Jonathan Ch. All rights reserved.</p>
          <Link to="/admin/login" className="opacity-60 transition hover:text-foreground hover:opacity-100">
            Admin login
          </Link>
        </div>
      </div>
    </footer>
  );
}
