
import React from "react";
import { Link } from "react-router-dom";
import { Search, PlusCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="rounded-full bg-primary p-1">
            <Search className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl">FindMyItem</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
            Home
          </Link>
          <Link to="/search" className="text-sm font-medium transition-colors hover:text-primary">
            Search Items
          </Link>
          <Link to="/report" className="text-sm font-medium transition-colors hover:text-primary">
            Report Found
          </Link>
        </nav>

        <div className="flex items-center space-x-2">
          <Link to="/search">
            <Button variant="outline" size="icon" className="hidden md:flex">
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>
          </Link>
          <Link to="/report">
            <Button className="hidden md:flex">
              <PlusCircle className="mr-2 h-4 w-4" />
              Report Found Item
            </Button>
          </Link>
          <div className="md:hidden flex space-x-2">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <Home className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/search">
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/report">
              <Button variant="ghost" size="icon">
                <PlusCircle className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
