
import React, { createContext, useContext, useState, ReactNode } from "react";

// Define types for our items
export interface Item {
  id: string;
  type: "id_card" | "credit_card" | "phone" | "birth_certificate" | "other";
  itemName: string;
  description: string;
  foundDate: string;
  location: string;
  extractedInfo: {
    name?: string;
    idNumber?: string;
    dateOfBirth?: string;
    cardNumber?: string; // For credit/debit cards
    phoneNumber?: string; // For phones
  };
  contactInfo: string;
  phoneNumber?: string | null;
  imageUrl?: string | null;
  suggestedPickupLocations?: string[] | null;
  createdAt: string;
}

interface ItemsContextType {
  items: Item[];
  addItem: (item: Omit<Item, "id" | "createdAt">) => void;
  searchItems: (query: string) => Item[];
}

const ItemsContext = createContext<ItemsContextType | undefined>(undefined);

// Sample data
const initialItems: Item[] = [
  {
    id: "1",
    type: "id_card",
    itemName: "National ID Card",
    description: "Found a national ID card near Central Park",
    foundDate: "2025-04-08",
    location: "Central Park, New York",
    extractedInfo: {
      name: "John Smith",
      idNumber: "ID123456",
      dateOfBirth: "1990-05-15",
    },
    contactInfo: "Lost and Found Office, Central Park",
    createdAt: "2025-04-09T10:30:00Z",
  },
  {
    id: "2",
    type: "credit_card",
    itemName: "Visa Credit Card",
    description: "Found a Visa credit card at Starbucks",
    foundDate: "2025-04-07",
    location: "Starbucks, 5th Avenue, New York",
    extractedInfo: {
      name: "Jane Doe",
      cardNumber: "XXXX-XXXX-XXXX-1234",
    },
    contactInfo: "Starbucks Manager, 5th Avenue",
    createdAt: "2025-04-07T15:45:00Z",
  },
  {
    id: "3",
    type: "phone",
    itemName: "iPhone 15",
    description: "Found an iPhone 15 on the subway",
    foundDate: "2025-04-06",
    location: "Subway Line A, 14th Street Station",
    extractedInfo: {
      phoneNumber: "XXX-XXX-1234",
    },
    contactInfo: "Subway Lost and Found Office",
    createdAt: "2025-04-06T18:20:00Z",
  },
];

export const ItemsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Item[]>(initialItems);

  const addItem = (newItem: Omit<Item, "id" | "createdAt">) => {
    const item: Item = {
      ...newItem,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setItems((prevItems) => [...prevItems, item]);
  };

  const searchItems = (query: string): Item[] => {
    if (!query.trim()) return [];
    
    const lowercaseQuery = query.toLowerCase();
    
    return items.filter((item) => {
      // Search in all text fields
      return (
        item.itemName.toLowerCase().includes(lowercaseQuery) ||
        item.description.toLowerCase().includes(lowercaseQuery) ||
        item.location.toLowerCase().includes(lowercaseQuery) ||
        // Search in extractedInfo fields
        (item.extractedInfo.name && 
          item.extractedInfo.name.toLowerCase().includes(lowercaseQuery)) ||
        (item.extractedInfo.idNumber && 
          item.extractedInfo.idNumber.toLowerCase().includes(lowercaseQuery)) ||
        (item.extractedInfo.dateOfBirth && 
          item.extractedInfo.dateOfBirth.toLowerCase().includes(lowercaseQuery)) ||
        (item.extractedInfo.cardNumber && 
          item.extractedInfo.cardNumber.toLowerCase().includes(lowercaseQuery)) ||
        (item.extractedInfo.phoneNumber && 
          item.extractedInfo.phoneNumber.toLowerCase().includes(lowercaseQuery))
      );
    });
  };

  return (
    <ItemsContext.Provider value={{ items, addItem, searchItems }}>
      {children}
    </ItemsContext.Provider>
  );
};

export const useItems = () => {
  const context = useContext(ItemsContext);
  if (context === undefined) {
    throw new Error("useItems must be used within an ItemsProvider");
  }
  return context;
};
