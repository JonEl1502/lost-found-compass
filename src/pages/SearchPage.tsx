
import React, { useState } from "react";
import { useItems } from "@/context/ItemsContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import ItemCard from "@/components/items/ItemCard";

const SearchPage = () => {
  const { items, searchItems } = useItems();
  const [searchQuery, setSearchQuery] = useState("");
  const [itemType, setItemType] = useState<string | undefined>(undefined);
  const [searchResults, setSearchResults] = useState(items);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const results = searchItems(searchQuery);
    
    // Filter by type if selected
    const filteredResults = itemType 
      ? results.filter(item => item.type === itemType)
      : results;
      
    setSearchResults(filteredResults);
    setHasSearched(true);
  };

  const handleClear = () => {
    setSearchQuery("");
    setItemType(undefined);
    setSearchResults(items);
    setHasSearched(false);
  };

  return (
    <div className="container py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center space-y-3 mb-8">
          <h1 className="text-3xl font-bold">Search for Lost Items</h1>
          <p className="text-muted-foreground">
            Enter details such as names, ID numbers, card numbers, or any other information that might help identify your lost item.
          </p>
        </div>

        <form onSubmit={handleSearch} className="space-y-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Search by name, ID number, card number, etc."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Select value={itemType} onValueChange={setItemType}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Item Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id_card">ID Card</SelectItem>
                <SelectItem value="credit_card">Credit/Debit Card</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="birth_certificate">Birth Certificate</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 justify-end">
            {(searchQuery || itemType) && (
              <Button type="button" variant="outline" onClick={handleClear}>
                Clear
              </Button>
            )}
            <Button type="submit">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </form>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {hasSearched
                ? `Search Results (${searchResults.length})`
                : "All Items"}
            </h2>
          </div>

          {searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {searchResults.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/50 rounded-lg">
              <h3 className="text-lg font-medium mb-2">No items found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
