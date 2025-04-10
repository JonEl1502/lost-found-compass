
export interface Claim {
  id: string;
  item_id: string;
  verification_info: Record<string, string>;
  status: "pending" | "pre-claimed" | "claimed" | "rejected";
  claim_date: string;
  tip_amount?: number;
  rating?: number;
  referral?: boolean;
  tip_message?: string;
}
