export type PromoCodeType = "percentage" | "fixed";

export interface PromoCode {
  code: string;
  type: PromoCodeType;
  value: number;
  description: string;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  usageLimit?: number;
  currentUsage?: number;
  minOrderAmount?: number;
  applicableCategories?: string[];
  applicableProducts?: string[];
}

export interface AppliedPromoCode extends PromoCode {
  appliedAt: Date;
  discountAmount: number;
}
