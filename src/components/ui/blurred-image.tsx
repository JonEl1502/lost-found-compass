
import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface BlurredImageProps {
  src: string;
  alt: string;
  itemType: "id_card" | "credit_card" | "phone" | "birth_certificate" | "other";
  className?: string;
}

const BlurredImage: React.FC<BlurredImageProps> = ({ 
  src, 
  alt, 
  itemType,
  className = ""
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Get blur overlay based on item type
  const getBlurOverlay = () => {
    switch (itemType) {
      case "id_card":
        return (
          <>
            {/* Blur ID number area */}
            <div className="absolute top-[40%] left-[40%] w-[50%] h-[15%] bg-black/30 backdrop-blur-md rounded-sm" />
            {/* Blur date of birth area */}
            <div className="absolute top-[60%] left-[40%] w-[40%] h-[10%] bg-black/30 backdrop-blur-md rounded-sm" />
          </>
        );
      case "credit_card":
        return (
          <>
            {/* Blur card number area */}
            <div className="absolute top-[50%] left-[10%] w-[80%] h-[15%] bg-black/30 backdrop-blur-md rounded-sm" />
            {/* Blur CVV area */}
            <div className="absolute top-[70%] right-[10%] w-[15%] h-[10%] bg-black/30 backdrop-blur-md rounded-sm" />
          </>
        );
      case "birth_certificate":
        return (
          <>
            {/* Blur ID number area */}
            <div className="absolute top-[30%] left-[50%] w-[40%] h-[10%] bg-black/30 backdrop-blur-md rounded-sm" />
            {/* Blur additional sensitive info */}
            <div className="absolute top-[45%] left-[40%] w-[50%] h-[10%] bg-black/30 backdrop-blur-md rounded-sm" />
          </>
        );
      case "phone":
        // Phones don't typically need blurring
        return null;
      default:
        // Default minimal blurring
        return (
          <div className="absolute top-[40%] left-[40%] w-[40%] h-[20%] bg-black/30 backdrop-blur-md rounded-sm" />
        );
    }
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-secondary/20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-secondary/20 text-center p-4">
          <p className="text-sm text-muted-foreground">Failed to load image</p>
        </div>
      )}
      
      <img
        src={src}
        alt={alt}
        className="max-w-full h-auto object-contain rounded-md"
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      />
      
      {!loading && !error && getBlurOverlay()}
      
      <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
        Sensitive data blurred
      </div>
    </div>
  );
};

export default BlurredImage;
