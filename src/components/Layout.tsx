import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../lib/cartContext';
import { OWNER_DISPLAY_PHONE, OWNER_WHATSAPP } from '../lib/whatsapp';
import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  const { cart } = useCart();
  return (
    <div className="app">
      <header className="header">
        <div className="container header-inner">
          <Link to="/" className="brand">
            <span className="brand-mark">●</span>
            <span>Gear Rental</span>
          </Link>
          <nav className="nav">
            <NavLink to="/" end>Catalog</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/agreement">Terms</NavLink>
            <NavLink to="/cart" className="cart-link">
              Cart
              {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="container main">{children}</main>

      <footer className="footer">
        <div className="container footer-inner">
          <div>
            <strong>Gear Rental</strong> · Reem Island, Abu Dhabi
            <br />
            Camera, lens, gimbal &amp; action-cam rental — pickup by appointment.
          </div>
          <div className="footer-contact">
            <a href={`tel:+${OWNER_WHATSAPP}`}>Call {OWNER_DISPLAY_PHONE}</a>
            <a href={`https://wa.me/${OWNER_WHATSAPP}`} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
            <Link to="/admin" className="footer-admin">Admin</Link>
          </div>
        </div>
        <nav className="container footer-links" aria-label="Site sections">
          <Link to="/">Camera rental Abu Dhabi</Link>
          <Link to="/?filter=lens">Lens rental Reem Island</Link>
          <Link to="/?filter=gimbal">Gimbal rental UAE</Link>
          <Link to="/?filter=action">Action camera rental</Link>
          <Link to="/agreement">Rental terms</Link>
          <Link to="/about">About</Link>
        </nav>
      </footer>
    </div>
  );
}
