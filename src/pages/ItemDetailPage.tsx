import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useItems } from "@/context/ItemsContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Phone,
  CreditCard,
  FileText,
  Smartphone,
  AlertCircle,
  User,
  CalendarDays,
  Hash,
  Loader2,
} from "lucide-react";
import ClaimItemForm from "@/components/claim/ClaimItemForm";
import { Item } from "@/context/ItemsContext";
import BlurredImage from "@/components/ui/blurred-image";

const ItemDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { items, refreshItems } = useItems();
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the specific item from Supabase
  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // First try to find it in the context
        const contextItem = items.find((item) => item.id === id);
        
        if (contextItem) {
          setItem(contextItem);
          // Check if it's already claimed
          setClaimed(contextItem.status === "claimed" || contextItem.status === "pre-claimed");
        } else {
          // If not in context, fetch from Supabase
          const { data, error } = await supabase
            .from('items')
            .select('*')
            .eq('id', id)
            .single();
            
          if (error) throw error;
          
          if (data) {
            // Transform to match our Item interface
            const transformedItem: Item = {
              id: data.id,
              type: data.type as "id_card" | "credit_card" | "phone" | "birth_certificate" | "other",
              itemName: data.item_name,
              description: data.description || "",
              foundDate: data.found_date,
              location: data.location,
              extractedInfo: data.extracted_info as unknown as Item['extractedInfo'], // Type assertion
              contactInfo: data.contact_info,
              phoneNumber: data.phone_number,
              imageUrl: data.image_path,
              suggestedPickupLocations: data.suggested_pickup_locations,
              createdAt: data.created_at,
              status: data.status
            };
            
            setItem(transformedItem);
            // Check if it's already claimed
            setClaimed(data.status === "claimed" || data.status === "pre-claimed");
          }
        }
      } catch (err) {
        console.error("Error fetching item:", err);
        setError("Failed to load item details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchItem();
    
    // Set up real-time subscription for this specific item
    const itemSubscription = supabase
      .channel(`item-${id}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'items',
        filter: `id=eq.${id}`
      }, payload => {
        console.log('Item updated:', payload);
        fetchItem();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(itemSubscription);
    };
  }, [id, items]);

  // If loading, show loading indicator
  if (isLoading) {
    return (
      <div className="container py-16 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <h1 className="text-2xl font-bold mb-4">Loading item details...</h1>
      </div>
    );
  }

  // If error or item not found
  if (error || !item) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Item Not Found</h1>
        <p className="text-muted-foreground mb-8">
          {error || "The item you are looking for does not exist or has been removed."}
        </p>
        <Button asChild>
          <Link to="/search">Back to Search</Link>
        </Button>
      </div>
    );
  }

  // Function to get the appropriate icon based on item type
  const getItemIcon = () => {
    switch (item.type) {
      case "id_card":
        return <FileText className="h-5 w-5 mr-2" />;
      case "credit_card":
        return <CreditCard className="h-5 w-5 mr-2" />;
      case "phone":
        return <Smartphone className="h-5 w-5 mr-2" />;
      case "birth_certificate":
        return <FileText className="h-5 w-5 mr-2" />;
      default:
        return <AlertCircle className="h-5 w-5 mr-2" />;
    }
  };
  
  const handleClaimSuccess = async () => {
    setClaimed(true);
    setIsClaiming(false);
    // Refresh items to get updated status
    await refreshItems();
  };

  // If the user is in claiming mode, show the claim form
  if (isClaiming) {
    return (
      <div className="container py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => setIsClaiming(false)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Item Details
          </Button>
          
          <ClaimItemForm item={item} onClaimSuccess={handleClaimSuccess} />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">{item.itemName}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={item.status === "pending" ? "default" : "outline"} 
                  className="self-start md:self-auto flex items-center whitespace-nowrap"
                >
                  {item.status === "pending" ? "Available" : item.status === "pre-claimed" ? "Being Claimed" : "Claimed"}
                </Badge>
                <Badge className="self-start md:self-auto flex items-center whitespace-nowrap">
                  {getItemIcon()}
                  {item.type.replace("_", " ")}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium text-lg">Found Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="font-medium">Location:</span>
                    <span className="ml-2">{item.location}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="font-medium">Date Found:</span>
                    <span className="ml-2">
                      {new Date(item.foundDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="font-medium">Contact Info:</span>
                    <span className="ml-2">{item.contactInfo}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-lg">Item Details</h3>
                <div className="bg-secondary p-4 rounded-md space-y-3">
                  {/* Only show partial details for verification purposes */}
                  {item.extractedInfo.name && (
                    <div className="flex items-center text-sm">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="font-medium">Name:</span>
                      <span className="ml-2">
                        {item.extractedInfo.name.substring(0, 2)}
                        {"••••••"}
                        {item.extractedInfo.name.slice(-2)}
                      </span>
                    </div>
                  )}
                  {item.extractedInfo.idNumber && (
                    <div className="flex items-center text-sm">
                      <Hash className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="font-medium">ID Number:</span>
                      <span className="ml-2">
                        {"••••"}
                        {item.extractedInfo.idNumber.slice(-4)}
                      </span>
                    </div>
                  )}
                  {item.extractedInfo.dateOfBirth && (
                    <div className="flex items-center text-sm">
                      <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="font-medium">Date of Birth:</span>
                      <span className="ml-2">••/••/••••</span>
                    </div>
                  )}
                  {item.extractedInfo.cardNumber && (
                    <div className="flex items-center text-sm">
                      <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="font-medium">Card Number:</span>
                      <span className="ml-2">
                        {"XXXX-XXXX-XXXX-"}
                        {item.extractedInfo.cardNumber.slice(-4)}
                      </span>
                    </div>
                  )}
                  {item.extractedInfo.phoneNumber && (
                    <div className="flex items-center text-sm">
                      <Smartphone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="font-medium">Phone Number:</span>
                      <span className="ml-2">
                        {"••••••"}
                        {item.extractedInfo.phoneNumber.slice(-4)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {item.imageUrl && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Item Image</h3>
                <div className="bg-secondary/20 p-4 rounded-md">
                  <BlurredImage
                    src={`https://agyxtvarmnpxqvsdiejm.supabase.co/storage/v1/object/public/document_images/${item.imageUrl}`}
                    alt={item.itemName}
                    itemType={item.type}
                    className="max-h-64 mx-auto"
                  />
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    Sensitive information is blurred for security.
                  </p>
                </div>
              </div>
            )}

            <div className="bg-accent/10 p-4 rounded-md">
              <h3 className="font-medium mb-2">How to Claim This Item</h3>
              <p className="text-sm text-muted-foreground">
                {claimed
                  ? "You have claimed this item. Please visit the location mentioned above with proper identification to pick it up."
                  : "If this is your item, click the 'Claim This Item' button below. You'll need to verify your ownership by providing some details that match the information on the item."}
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Back to Search
            </Button>
            {!claimed && item.status === "pending" && (
              <Button 
                onClick={() => setIsClaiming(true)}
                disabled={item.status !== "pending"}
              >
                Claim This Item
              </Button>
            )}
            {claimed && (
              <Button variant="outline" disabled>
                Item Claimed
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ItemDetailPage;
