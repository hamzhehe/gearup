import React from 'react';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="premium-footer">
          <div className="premium-footer-inner">
            {/* Left — Branding */}
            <div className="premium-footer-brand">
              <div className="premium-footer-logo">
                <span className="premium-footer-logo-text">G</span>
              </div>
              <div>
                <span className="premium-footer-title">GearUp</span>
                <span className="premium-footer-subtitle">Global B2B Sports Marketplace</span>
              </div>
            </div>

            {/* Center — Navigation Links */}
            <nav className="premium-footer-links">
              <Link href="/about">About</Link>
              <span className="premium-footer-dot"></span>
              <Link href="/wholesaler/marketplace">Marketplace</Link>
              <span className="premium-footer-dot"></span>
              <Link href="/contact">Support</Link>
              <span className="premium-footer-dot"></span>
              <Link href="/privacy">Privacy Policy</Link>
              <span className="premium-footer-dot"></span>
              <Link href="/terms">Terms of Service</Link>
              <span className="premium-footer-dot"></span>
              <Link href="/contact">Contact</Link>
            </nav>

            {/* Right — Status */}
            <div className="premium-footer-status">
              <div className="premium-footer-status-dot"></div>
              <span>All Systems Operational</span>
            </div>
          </div>

          <div className="premium-footer-copyright">
            &copy; {new Date().getFullYear()} GearUp. All rights reserved.
          </div>
        </footer>
    );
}
