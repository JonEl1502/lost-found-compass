
import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">FindMyItem Kenya</h3>
            <p className="text-sm text-muted-foreground">
              Reconnecting Kenyans with their lost items since 2025.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/search" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Search Items
                </Link>
              </li>
              <li>
                <Link 
                  to="/report" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Report Found
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <p className="text-sm text-muted-foreground">
              For support or inquiries, please contact us at:
              <br />
              <a 
                href="mailto:support@findmyitemkenya.co.ke" 
                className="text-primary hover:underline"
              >
                support@findmyitemkenya.co.ke
              </a>
            </p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© 2025 FindMyItem Kenya. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
