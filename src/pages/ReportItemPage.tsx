
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useItems } from "@/context/ItemsContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Item } from "@/context/ItemsContext";

const ReportItemPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addItem } = useItems();
  
  const [step, setStep] = useState(1);
  const [itemType, setItemType] = useState<"id_card" | "credit_card" | "phone" | "birth_certificate" | "other">("id_card");
  
  const [formData, setFormData] = useState({
    itemName: "",
    description: "",
    foundDate: new Date().toISOString().split("T")[0],
    location: "",
    contactInfo: "",
    extractedInfo: {
      name: "",
      idNumber: "",
      dateOfBirth: "",
      cardNumber: "",
      phoneNumber: "",
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleExtractedInfoChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      extractedInfo: {
        ...prev.extractedInfo,
        [name]: value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const itemData: Omit<Item, "id" | "createdAt"> = {
      type: itemType,
      itemName: formData.itemName,
      description: formData.description,
      foundDate: formData.foundDate,
      location: formData.location,
      contactInfo: formData.contactInfo,
      extractedInfo: formData.extractedInfo,
    };
    
    addItem(itemData);
    
    toast({
      title: "Item reported successfully",
      description: "Thank you for helping someone find their lost item.",
    });
    
    navigate("/");
  };

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const renderExtractedInfoFields = () => {
    switch (itemType) {
      case "id_card":
        return (
          <>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="name">Name on ID</Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.extractedInfo.name}
                onChange={handleExtractedInfoChange}
                placeholder="Enter the name on the ID"
              />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="idNumber">ID Number</Label>
              <Input
                type="text"
                id="idNumber"
                name="idNumber"
                value={formData.extractedInfo.idNumber}
                onChange={handleExtractedInfoChange}
                placeholder="Enter the ID number"
              />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.extractedInfo.dateOfBirth}
                onChange={handleExtractedInfoChange}
              />
            </div>
          </>
        );
      case "credit_card":
        return (
          <>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="name">Name on Card</Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.extractedInfo.name}
                onChange={handleExtractedInfoChange}
                placeholder="Enter the name on the card"
              />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="cardNumber">Last 4 Digits of Card</Label>
              <Input
                type="text"
                id="cardNumber"
                name="cardNumber"
                value={formData.extractedInfo.cardNumber}
                onChange={handleExtractedInfoChange}
                placeholder="XXXX-XXXX-XXXX-1234"
                maxLength={4}
              />
              <p className="text-xs text-muted-foreground">
                For security, only enter the last 4 digits
              </p>
            </div>
          </>
        );
      case "phone":
        return (
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="phoneNumber">Phone Number (if visible)</Label>
            <Input
              type="text"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.extractedInfo.phoneNumber}
              onChange={handleExtractedInfoChange}
              placeholder="Enter the phone number if visible"
            />
            <p className="text-xs text-muted-foreground">
              If the phone is locked, you can enter any visible information
            </p>
          </div>
        );
      case "birth_certificate":
        return (
          <>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="name">Name on Certificate</Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.extractedInfo.name}
                onChange={handleExtractedInfoChange}
                placeholder="Enter the name on the certificate"
              />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.extractedInfo.dateOfBirth}
                onChange={handleExtractedInfoChange}
              />
            </div>
          </>
        );
      default:
        return (
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="description">
              Enter any identifying information
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter any details that might help identify the item"
              rows={3}
            />
          </div>
        );
    }
  };

  return (
    <div className="container py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center space-y-3 mb-8">
          <h1 className="text-3xl font-bold">Report a Found Item</h1>
          <p className="text-muted-foreground">
            Please provide information about the item you've found to help reconnect it with its owner.
          </p>
        </div>

        <Tabs value={`step-${step}`} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="step-1" disabled={true}>
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="step-2" disabled={true}>
              Item Details
            </TabsTrigger>
          </TabsList>
          
          <Card className="mt-6">
            <TabsContent value="step-1">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Provide general information about the found item.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="itemType">Item Type</Label>
                    <Select 
                      value={itemType} 
                      onValueChange={(value) => setItemType(value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select item type" />
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

                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="itemName">Item Name</Label>
                    <Input
                      type="text"
                      id="itemName"
                      name="itemName"
                      value={formData.itemName}
                      onChange={handleInputChange}
                      placeholder="E.g., National ID Card, Visa Credit Card"
                      required
                    />
                  </div>

                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe the item, its condition, and where exactly you found it"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="foundDate">Date Found</Label>
                    <Input
                      type="date"
                      id="foundDate"
                      name="foundDate"
                      value={formData.foundDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="location">Location Found</Label>
                    <Input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="E.g., Central Park, 5th Avenue, etc."
                      required
                    />
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => navigate("/")}>
                  Cancel
                </Button>
                <Button onClick={nextStep}>Next</Button>
              </CardFooter>
            </TabsContent>
            
            <TabsContent value="step-2">
              <CardHeader>
                <CardTitle>Item Details</CardTitle>
                <CardDescription>
                  Enter any information visible on the item that might help identify the owner.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {renderExtractedInfoFields()}
                  
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="contactInfo">Contact Information</Label>
                    <Input
                      type="text"
                      id="contactInfo"
                      name="contactInfo"
                      value={formData.contactInfo}
                      onChange={handleInputChange}
                      placeholder="Where can the owner retrieve this item?"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      This could be a location, lost and found office, or other contact point
                    </p>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  Back
                </Button>
                <Button onClick={handleSubmit}>Submit Report</Button>
              </CardFooter>
            </TabsContent>
          </Card>
        </Tabs>
      </div>
    </div>
  );
};

export default ReportItemPage;
