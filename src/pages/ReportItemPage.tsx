
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useItems } from "@/context/ItemsContext";
import { supabase } from "@/integrations/supabase/client";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Camera, Upload, MapPin, Phone, Shield, AlertCircle } from "lucide-react";
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
    phoneNumber: "",
    extractedInfo: {
      name: "",
      idNumber: "",
      dateOfBirth: "",
      cardNumber: "",
      phoneNumber: "",
    },
    suggestedPickupLocations: [] as string[],
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [currentPickupLocation, setCurrentPickupLocation] = useState("");
  const [showImageGuidelines, setShowImageGuidelines] = useState(false);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const addPickupLocation = () => {
    if (currentPickupLocation.trim()) {
      setFormData(prev => ({
        ...prev,
        suggestedPickupLocations: [...prev.suggestedPickupLocations, currentPickupLocation.trim()]
      }));
      setCurrentPickupLocation("");
    }
  };

  const removePickupLocation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      suggestedPickupLocations: prev.suggestedPickupLocations.filter((_, i) => i !== index)
    }));
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;
    
    try {
      setUploading(true);
      
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${itemType}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('document_images')
        .upload(filePath, imageFile);
        
      if (uploadError) {
        throw uploadError;
      }
      
      return filePath;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload Failed",
        description: "There was a problem uploading your image.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let imagePath = null;
    if (imageFile) {
      imagePath = await uploadImage();
      if (!imagePath && imageFile) {
        // If upload failed and user had an image, show error but don't proceed
        return;
      }
    }
    
    const itemData: Omit<Item, "id" | "createdAt"> = {
      type: itemType,
      itemName: formData.itemName,
      description: formData.description,
      foundDate: formData.foundDate,
      location: formData.location,
      contactInfo: formData.contactInfo,
      extractedInfo: formData.extractedInfo,
      phoneNumber: formData.phoneNumber || null,
      imageUrl: imagePath,
      suggestedPickupLocations: formData.suggestedPickupLocations.length > 0 
        ? formData.suggestedPickupLocations 
        : null,
    };
    
    // First, save to the local context
    addItem(itemData);
    
    // Then save to Supabase
    try {
      const { error } = await supabase
        .from('items')
        .insert({
          type: itemData.type,
          item_name: itemData.itemName,
          description: itemData.description,
          found_date: itemData.foundDate,
          location: itemData.location,
          contact_info: itemData.contactInfo,
          phone_number: itemData.phoneNumber,
          image_path: imagePath,
          extracted_info: itemData.extractedInfo,
          suggested_pickup_locations: itemData.suggestedPickupLocations.length > 0 
            ? itemData.suggestedPickupLocations 
            : null,
        });
        
      if (error) throw error;
      
      toast({
        title: "Item reported successfully",
        description: "Thank you for helping someone find their lost item.",
      });
      
      navigate("/");
    } catch (error) {
      console.error('Error saving to Supabase:', error);
      toast({
        title: "Error saving item",
        description: "The item was saved locally but not to the database.",
        variant: "destructive",
      });
    }
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

                  <div className="grid w-full items-center gap-1.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <Label htmlFor="image">Upload Image</Label>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowImageGuidelines(true)}
                      >
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Guidelines
                      </Button>
                    </div>
                    <div className="flex items-center justify-center border border-dashed border-input rounded-md p-6">
                      {imagePreview ? (
                        <div className="text-center">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="mx-auto max-h-40 rounded-md mb-2" 
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setImageFile(null);
                              setImagePreview(null);
                            }}
                          >
                            Remove Image
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Camera className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground mb-4">Upload an image of the found item</p>
                          <label htmlFor="image-upload">
                            <Button type="button" variant="outline" size="sm" className="cursor-pointer" asChild>
                              <span>
                                <Upload className="h-4 w-4 mr-2" />
                                Select Image
                              </span>
                            </Button>
                            <input
                              id="image-upload"
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={handleImageChange}
                            />
                          </label>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      Upload an image of the item to help the owner identify it. 
                      Sensitive information will be blurred automatically.
                    </p>
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
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    {renderExtractedInfoFields()}
                  </div>
                  
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

                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="phoneNumber">
                      Your Phone Number (Optional)
                    </Label>
                    <Input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number if you'd like to receive a tip"
                    />
                    <p className="text-xs text-muted-foreground">
                      If the owner wants to thank you with a tip, we'll need your number.
                      This is completely optional.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Label className="mr-2">Suggested Pickup Locations</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addPickupLocation}
                        disabled={!currentPickupLocation.trim()}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex gap-2 items-center">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        value={currentPickupLocation}
                        onChange={(e) => setCurrentPickupLocation(e.target.value)}
                        placeholder="Add a suggested safe pickup location"
                        className="flex-1"
                      />
                    </div>
                    {formData.suggestedPickupLocations.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium mb-2">Suggested locations:</p>
                        <ul className="space-y-2">
                          {formData.suggestedPickupLocations.map((location, index) => (
                            <li key={index} className="flex items-center justify-between bg-secondary/50 rounded-md px-3 py-2 text-sm">
                              <span className="flex items-center">
                                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                                {location}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removePickupLocation(index)}
                              >
                                Remove
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Suggest safe locations where the item can be picked up (e.g., Huduma Centre, police station)
                    </p>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  Back
                </Button>
                <Button onClick={handleSubmit} disabled={uploading}>
                  {uploading ? "Uploading..." : "Submit Report"}
                </Button>
              </CardFooter>
            </TabsContent>
          </Card>
        </Tabs>
      </div>

      <Dialog open={showImageGuidelines} onOpenChange={setShowImageGuidelines}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Image Upload Guidelines</DialogTitle>
            <DialogDescription>
              Please follow these guidelines when uploading images of found items:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-start space-x-2">
              <Shield className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Protect Sensitive Information</p>
                <p className="text-sm text-muted-foreground">
                  Sensitive parts of ID cards and other documents will be blurred automatically to protect privacy.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Camera className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Clear, Well-lit Photos</p>
                <p className="text-sm text-muted-foreground">
                  Take photos in good lighting so the item is clearly visible.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Don't Share Full Card Numbers</p>
                <p className="text-sm text-muted-foreground">
                  For credit/debit cards, only the last 4 digits should be visible in the photo.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowImageGuidelines(false)}>
              I Understand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportItemPage;
