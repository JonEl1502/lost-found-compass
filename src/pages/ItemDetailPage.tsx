
import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useItems } from "@/context/ItemsContext";
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
} from "lucide-react";

const ItemDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { items } = useItems();

  const item = items.find((item) => item.id === id);

  if (!item) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Item Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The item you are looking for does not exist or has been removed.
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
              <Badge className="self-start md:self-auto flex items-center whitespace-nowrap">
                {getItemIcon()}
                {item.type.replace("_", " ")}
              </Badge>
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
                  {item.extractedInfo.name && (
                    <div className="flex items-center text-sm">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="font-medium">Name:</span>
                      <span className="ml-2">{item.extractedInfo.name}</span>
                    </div>
                  )}
                  {item.extractedInfo.idNumber && (
                    <div className="flex items-center text-sm">
                      <Hash className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="font-medium">ID Number:</span>
                      <span className="ml-2">{item.extractedInfo.idNumber}</span>
                    </div>
                  )}
                  {item.extractedInfo.dateOfBirth && (
                    <div className="flex items-center text-sm">
                      <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="font-medium">Date of Birth:</span>
                      <span className="ml-2">{item.extractedInfo.dateOfBirth}</span>
                    </div>
                  )}
                  {item.extractedInfo.cardNumber && (
                    <div className="flex items-center text-sm">
                      <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="font-medium">Card Number:</span>
                      <span className="ml-2">{item.extractedInfo.cardNumber}</span>
                    </div>
                  )}
                  {item.extractedInfo.phoneNumber && (
                    <div className="flex items-center text-sm">
                      <Smartphone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="font-medium">Phone Number:</span>
                      <span className="ml-2">{item.extractedInfo.phoneNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-accent/10 p-4 rounded-md">
              <h3 className="font-medium mb-2">How to Claim This Item</h3>
              <p className="text-sm text-muted-foreground">
                If this is your item, please visit the location mentioned above with proper identification to verify your ownership. You may need to provide additional details that match the information on the item.
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Back to Search
            </Button>
            <Button asChild>
              <Link to="/search">Find Another Item</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ItemDetailPage;
