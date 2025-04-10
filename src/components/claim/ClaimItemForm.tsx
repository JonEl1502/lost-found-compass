
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Item } from "@/context/ItemsContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, CheckCircle } from "lucide-react";

interface ClaimItemFormProps {
  item: Item;
  onClaimSuccess: () => void;
}

const ClaimItemForm: React.FC<ClaimItemFormProps> = ({ item, onClaimSuccess }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [step, setStep] = useState<"verify" | "confirm" | "payment" | "success">("verify");
  const [verificationInfo, setVerificationInfo] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tipAmount, setTipAmount] = useState<number>(100);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [showTipDialog, setShowTipDialog] = useState(false);
  const [isTipping, setIsTipping] = useState(false);
  const [claimId, setClaimId] = useState<string | null>(null);
  
  // Generate verification fields based on item type
  const getVerificationFields = () => {
    switch (item.type) {
      case "id_card":
        return [
          { key: "name", label: "Full Name on ID", type: "text" },
          { key: "idNumber", label: "ID Number", type: "text" },
          { key: "dateOfBirth", label: "Date of Birth", type: "date" },
        ];
      case "credit_card":
        return [
          { key: "name", label: "Name on Card", type: "text" },
          { key: "cardNumber", label: "Last 4 Digits of Card", type: "text" },
        ];
      case "phone":
        return [
          { key: "phoneNumber", label: "Phone Number", type: "text" },
          { key: "phoneModel", label: "Phone Model (if known)", type: "text" },
        ];
      case "birth_certificate":
        return [
          { key: "name", label: "Full Name on Certificate", type: "text" },
          { key: "dateOfBirth", label: "Date of Birth", type: "date" },
        ];
      default:
        return [
          { key: "description", label: "Describe the item", type: "text" },
        ];
    }
  };
  
  const handleInputChange = (key: string, value: string) => {
    setVerificationInfo((prev) => ({ ...prev, [key]: value }));
  };
  
  const verifyInformation = () => {
    // Basic validation
    for (const field of getVerificationFields()) {
      if (!verificationInfo[field.key]) {
        toast({
          title: "Missing information",
          description: `Please provide ${field.label}`,
          variant: "destructive",
        });
        return;
      }
    }
    
    // Check against item's extracted info
    let isValid = true;
    const extractedInfo = item.extractedInfo;
    
    for (const [key, value] of Object.entries(verificationInfo)) {
      if (extractedInfo[key as keyof typeof extractedInfo] && 
          extractedInfo[key as keyof typeof extractedInfo] !== value) {
        isValid = false;
        break;
      }
    }
    
    if (isValid) {
      setStep("confirm");
    } else {
      toast({
        title: "Verification failed",
        description: "The information provided doesn't match our records.",
        variant: "destructive",
      });
    }
  };
  
  const submitClaim = async () => {
    try {
      setIsSubmitting(true);
      
      // Create a claim record
      const { data, error } = await supabase
        .from("claims")
        .insert({
          item_id: item.id,
          verification_info: verificationInfo,
          status: "pre-claimed",
        })
        .select()
        .single();
        
      if (error) throw error;
      
      setClaimId(data.id);
      
      // Update item status
      await supabase
        .from("items")
        .update({ status: "pre-claimed" })
        .eq("id", item.id);
      
      setStep("payment");
      
      // If the finder provided a phone number, show the tip dialog
      if (item.phoneNumber) {
        setShowTipDialog(true);
      } else {
        // If no phone number, skip to success
        setStep("success");
        onClaimSuccess();
      }
      
    } catch (error) {
      console.error("Error claiming item:", error);
      toast({
        title: "Error",
        description: "Failed to claim the item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const processTip = async () => {
    if (!phoneNumber) {
      toast({
        title: "Missing information",
        description: "Please provide your phone number",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsTipping(true);
      
      // Get the current session
      const { data: sessionData } = await supabase.auth.getSession();
      
      // Call the M-Pesa payment function
      const response = await fetch(
        "https://agyxtvarmnpxqvsdiejm.supabase.co/functions/v1/mpesa-payment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${sessionData.session?.access_token}`,
          },
          body: JSON.stringify({
            phoneNumber,
            amount: tipAmount,
            itemId: item.id,
            claimId,
          }),
        }
      );
      
      const result = await response.json();
      
      if (result.ResponseCode === "0") {
        toast({
          title: "Payment Initiated",
          description: "Check your phone for the M-Pesa prompt to complete the payment.",
        });
        
        // Close the dialog and show success
        setShowTipDialog(false);
        setStep("success");
        onClaimSuccess();
      } else {
        throw new Error(result.ResponseDescription || "Payment failed");
      }
    } catch (error: any) {
      console.error("Error processing payment:", error);
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTipping(false);
    }
  };
  
  const skipTip = () => {
    setShowTipDialog(false);
    setStep("success");
    onClaimSuccess();
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Claim Your Item</CardTitle>
        <CardDescription>
          {step === "verify" && "Please verify your ownership of this item."}
          {step === "confirm" && "Confirm your claim for this item."}
          {step === "payment" && "Optional: Thank the finder with a tip."}
          {step === "success" && "Item claimed successfully!"}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {step === "verify" && (
          <div className="space-y-4">
            {getVerificationFields().map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key}>{field.label}</Label>
                <Input
                  id={field.key}
                  type={field.type}
                  value={verificationInfo[field.key] || ""}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                />
              </div>
            ))}
          </div>
        )}
        
        {step === "confirm" && (
          <div className="space-y-4">
            <p>
              You're about to claim this item. Please visit the location mentioned
              in the item details with proper identification to pick it up.
            </p>
            
            {item.suggestedPickupLocations && item.suggestedPickupLocations.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Suggested Pickup Locations:</h4>
                <ul className="space-y-1">
                  {item.suggestedPickupLocations.map((location, index) => (
                    <li key={index} className="text-sm bg-secondary p-2 rounded">
                      {location}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <p className="text-sm text-muted-foreground mt-4">
              You'll have 72 hours to pick up your item, after which the claim may expire.
            </p>
          </div>
        )}
        
        {step === "success" && (
          <div className="text-center py-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">Item Claimed Successfully!</h3>
            <p className="mb-4">
              Your item has been successfully claimed. Please visit the location 
              mentioned with proper identification to pick it up.
            </p>
            <p className="text-sm text-muted-foreground">
              You have 72 hours to pick up your item.
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {step === "verify" && (
          <>
            <Button variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button onClick={verifyInformation}>
              Verify Information
            </Button>
          </>
        )}
        
        {step === "confirm" && (
          <>
            <Button variant="outline" onClick={() => setStep("verify")}>
              Back
            </Button>
            <Button 
              onClick={submitClaim} 
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Claim
            </Button>
          </>
        )}
        
        {step === "success" && (
          <Button 
            className="mx-auto" 
            onClick={() => navigate("/")}
          >
            Return Home
          </Button>
        )}
      </CardFooter>
      
      {/* Tip Dialog */}
      <AlertDialog open={showTipDialog} onOpenChange={setShowTipDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Thank the Finder</AlertDialogTitle>
            <AlertDialogDescription>
              Would you like to send a tip to the person who found your item? 
              10% of your tip goes towards maintaining this platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="phone-number">Your M-Pesa Phone Number</Label>
              <Input
                id="phone-number"
                type="tel"
                placeholder="07XX XXX XXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tip-amount">Tip Amount (KES)</Label>
              <Input
                id="tip-amount"
                type="number"
                min={50}
                step={50}
                value={tipAmount}
                onChange={(e) => setTipAmount(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Minimum tip: KES 50. 90% goes to the finder, 10% supports the platform.
              </p>
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel onClick={skipTip}>Skip</AlertDialogCancel>
            <AlertDialogAction 
              onClick={processTip}
              disabled={isTipping}
            >
              {isTipping && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Tip
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default ClaimItemForm;
