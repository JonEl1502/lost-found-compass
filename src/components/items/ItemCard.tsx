
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, CreditCard, FileText, Smartphone, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Item } from "@/context/ItemsContext";

interface ItemCardProps {
  item: Item;
}

const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
  // Function to get the appropriate icon based on item type
  const getItemIcon = () => {
    switch (item.type) {
      case "id_card":
        return <FileText className="h-4 w-4 mr-1" />;
      case "credit_card":
        return <CreditCard className="h-4 w-4 mr-1" />;
      case "phone":
        return <Smartphone className="h-4 w-4 mr-1" />;
      case "birth_certificate":
        return <FileText className="h-4 w-4 mr-1" />;
      default:
        return <AlertCircle className="h-4 w-4 mr-1" />;
    }
  };

  return (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-medium">{item.itemName}</CardTitle>
          <Badge variant="outline" className="flex items-center">
            {getItemIcon()}
            {item.type.replace("_", " ")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{item.location}</span>
          </div>
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>Found on {new Date(item.foundDate).toLocaleDateString()}</span>
          </div>
        </div>
        
        {/* Extracted Info Preview */}
        <div className="mt-4 p-3 bg-secondary rounded-md">
          <h4 className="text-sm font-medium mb-2">Item Details:</h4>
          <ul className="space-y-1 text-xs text-muted-foreground">
            {item.extractedInfo.name && (
              <li>Name: {item.extractedInfo.name}</li>
            )}
            {item.extractedInfo.idNumber && (
              <li>ID: {item.extractedInfo.idNumber}</li>
            )}
            {item.extractedInfo.dateOfBirth && (
              <li>DOB: {item.extractedInfo.dateOfBirth}</li>
            )}
            {item.extractedInfo.cardNumber && (
              <li>Card: {item.extractedInfo.cardNumber}</li>
            )}
            {item.extractedInfo.phoneNumber && (
              <li>Phone: {item.extractedInfo.phoneNumber}</li>
            )}
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Link
          to={`/items/${item.id}`}
          className="text-primary text-sm font-medium hover:underline w-full text-center"
        >
          View Details
        </Link>
      </CardFooter>
    </Card>
  );
};

export default ItemCard;
