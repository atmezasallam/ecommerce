import { DashboardSidebarMenuInterface } from "@/src/lib/types";

export const adminDashboardSidebarOptions: DashboardSidebarMenuInterface[] = [
  {
    label: "Dashboard",
    icon: "dashboard",
    link: "/dashboard/admin",
  },
  {
    label: "Stores",
    icon: "store",
    link: "/dashboard/admin/stores",
  },
  {
    label: "Orders",
    icon: "box-list",
    link: "/dashboard/admin/orders",
  },
  {
    label: "Categories",
    icon: "categories",
    link: "/dashboard/admin/categories",
  },
  {
    label: "Sub-Categories",
    icon: "categories",
    link: "/dashboard/admin/subCategories",
  },
  {
    label: "Offer Tags",
    icon: "offer",
    link: "/dashboard/admin/offer-tags",
  },
  {
    label: "Coupons",
    icon: "coupon",
    link: "/dashboard/admin/coupons",
  },
  {
    label: "Banners",
    icon: "offer",
    link: "/dashboard/admin/banners",
  },
  {
    label: "Homepage brands",
    icon: "threeboxes",
    link: "/dashboard/admin/homepage-brands",
  },
];

export const SellerDashboardSidebarOptions: DashboardSidebarMenuInterface[] = [
  {
    label: "Dashboard",
    icon: "dashboard",
    link: "",
  },
  {
    label: "Messages",
    icon: "messages",
    link: "/dashboard/seller/messages",
  },
  {
    label: "Products",
    icon: "products",
    link: "products",
  },
  {
    label: "Orders",
    icon: "box-list",
    link: "orders",
  },
  {
    label: "Inventory",
    icon: "inventory",
    link: "inventory",
  },
  {
    label: "Coupons",
    icon: "coupon",
    link: "coupons",
  },
  {
    label: "Shipping",
    icon: "shipping",
    link: "shipping",
  },
  {
    label: "Settings",
    icon: "settings",
    link: "settings",
  },
];