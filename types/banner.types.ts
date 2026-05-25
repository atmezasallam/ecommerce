import type { BannerStatus, BannerType } from "@prisma/client";

export type BannerFormData = {
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  mobileImage?: string;
  bgColor: string;
  textColor: string;
  ctaText?: string;
  ctaLink?: string;
  ctaStyle: "outline" | "solid" | "ghost";
  type: BannerType;
  status: BannerStatus;
  startDate?: Date;
  endDate?: Date;
};

export type AnnouncementBarFormData = {
  messages: string[];
  bgColor: string;
  textColor: string;
  speed: number;
  isActive: boolean;
  showFrom?: Date | null;
  showUntil?: Date | null;
};
