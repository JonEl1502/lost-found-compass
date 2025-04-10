
import React from "react";
import { Link } from "react-router-dom";
import { Search, Upload, MapPin, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useItems } from "@/context/ItemsContext";
import ItemCard from "@/components/items/ItemCard";

const HomePage = () => {
  const { items } = useItems();
  const recentItems = items.slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Lost Something Important in Kenya?
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                We help Kenyans reconnect with their lost items. Search for your lost documents or report found items from across the country.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/search">
                <Button size="lg" className="gap-1">
                  <Search className="h-4 w-4" />
                  Search for Lost Items
                </Button>
              </Link>
              <Link to="/report">
                <Button size="lg" variant="outline" className="gap-1">
                  <Upload className="h-4 w-4" />
                  Report a Found Item
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-12 md:py-16 bg-secondary/50">
        <div className="container px-4 md:px-6">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl">How It Works</h2>
            <p className="mx-auto max-w-[600px] text-muted-foreground">
              Our platform connects Kenyans who have found items with those who have lost them.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="bg-primary/10 p-3 rounded-full">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium">Report Found Items</h3>
              <p className="text-muted-foreground text-sm">
                Anonymously report any documents or items you've found with relevant details, from Nairobi to Mombasa and beyond.
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="bg-primary/10 p-3 rounded-full">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium">Search Lost Items</h3>
              <p className="text-muted-foreground text-sm">
                Search our nationwide database using details of your lost documents or items.
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="bg-primary/10 p-3 rounded-full">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium">Retrieve Your Items</h3>
              <p className="text-muted-foreground text-sm">
                Find out where your lost items are located across Kenya and get them back safely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Found Items */}
      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl">Recently Found Items</h2>
              <p className="text-muted-foreground">
                Here are some of the recently reported found items across Kenya.
              </p>
            </div>
            <Link to="/search" className="mt-4 md:mt-0">
              <Button variant="outline">View All Items</Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {recentItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Safety */}
      <section className="py-12 md:py-16 bg-accent/5">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl">Trust & Privacy</h2>
              <p className="text-muted-foreground">
                We prioritize your privacy and the security of sensitive information. Our platform is designed to protect personal details while helping Kenyans reconnect with their lost items.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                  <span>We never display full sensitive information</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                  <span>Anonymous reporting to protect finder's identity</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                  <span>Verification process to ensure rightful owners claim items</span>
                </li>
              </ul>
            </div>
            <div className="flex justify-center">
              <div className="bg-background rounded-lg shadow-lg p-6 max-w-sm w-full">
                <div className="text-center space-y-3">
                  <Shield className="h-12 w-12 text-primary mx-auto" />
                  <h3 className="text-xl font-medium">Your Privacy Matters</h3>
                  <p className="text-sm text-muted-foreground">
                    We only extract and store the minimum information needed to help Kenyans find their lost items, while keeping sensitive details protected.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
