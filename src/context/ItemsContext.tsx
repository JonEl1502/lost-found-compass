
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  status?: string;
}

interface ItemsContextType {
  items: Item[];
  addItem: (item: Omit<Item, "id" | "createdAt">) => Promise<string | null>;
  searchItems: (query: string) => Item[];
  isLoading: boolean;
  error: string | null;
  refreshItems: () => Promise<void>;
}

const ItemsContext = createContext<ItemsContextType | undefined>(undefined);

export const ItemsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch items from Supabase
  const fetchItems = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      // Transform Supabase data to match our Item interface
      const transformedItems: Item[] = data.map(item => ({
        id: item.id,
        type: item.type as "id_card" | "credit_card" | "phone" | "birth_certificate" | "other",
        itemName: item.item_name,
        description: item.description || "",
        foundDate: item.found_date,
        location: item.location,
        extractedInfo: item.extracted_info,
        contactInfo: item.contact_info,
        phoneNumber: item.phone_number,
        imageUrl: item.image_path,
        suggestedPickupLocations: item.suggested_pickup_locations,
        createdAt: item.created_at,
        status: item.status
      }));
      
      setItems(transformedItems);
    } catch (err) {
      console.error("Error fetching items:", err);
      setError("Failed to load items. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch items on initial load
  useEffect(() => {
    fetchItems();
    
    // Set up a real-time subscription for items
    const itemsSubscription = supabase
      .channel('public:items')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'items' 
      }, payload => {
        console.log('Change received!', payload);
        fetchItems();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(itemsSubscription);
    };
  }, []);

  const addItem = async (newItem: Omit<Item, "id" | "createdAt">) => {
    try {
      // Transform the item to match Supabase schema
      const supabaseItem = {
        type: newItem.type,
        item_name: newItem.itemName,
        description: newItem.description,
        found_date: newItem.foundDate,
        location: newItem.location,
        contact_info: newItem.contactInfo,
        phone_number: newItem.phoneNumber,
        image_path: newItem.imageUrl,
        extracted_info: newItem.extractedInfo,
        suggested_pickup_locations: newItem.suggestedPickupLocations,
        status: newItem.status || 'pending'
      };
      
      const { data, error } = await supabase
        .from('items')
        .insert(supabaseItem)
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      // Transform the new item back to our interface and add to state
      const newItemWithId: Item = {
        id: data.id,
        type: data.type,
        itemName: data.item_name,
        description: data.description || "",
        foundDate: data.found_date,
        location: data.location,
        extractedInfo: data.extracted_info,
        contactInfo: data.contact_info,
        phoneNumber: data.phone_number,
        imageUrl: data.image_path,
        suggestedPickupLocations: data.suggested_pickup_locations,
        createdAt: data.created_at,
        status: data.status
      };
      
      setItems((prevItems) => [newItemWithId, ...prevItems]);
      return data.id;
    } catch (err) {
      console.error("Error adding item:", err);
      setError("Failed to add item. Please try again.");
      return null;
    }
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

  const refreshItems = async () => {
    await fetchItems();
  };

  return (
    <ItemsContext.Provider value={{ items, addItem, searchItems, isLoading, error, refreshItems }}>
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
