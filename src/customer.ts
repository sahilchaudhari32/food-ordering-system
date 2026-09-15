import { CustomerAccount, Guest, Member } from "./types";

export function createGuest(
  id: number,
  name: string,
  phone: string | undefined,
  address: { street: string; city: string; pincode: string }
): Guest {
  return {
    id,
    name,
    phone,
    address,
    customerType: "guest"
  };
}

export function createMember(
  id: number,
  name: string,
  phone: string | undefined,
  address: { street: string; city: string; pincode: string },
  membershipLevel: "silver" | "gold" | "platinum"
): Member {
  const discountMap: Record<"silver" | "gold" | "platinum", number> = {
    silver: 5,
    gold: 10,
    platinum: 15
  };

  return {
    id,
    name,
    phone,
    address,
    customerType: "member",
    membershipId: `MEM-${id.toString().padStart(4, "0")}`,
    discountPercentage: discountMap[membershipLevel],
    membershipLevel
  };
}

export function getCustomerDiscount(customer: CustomerAccount): number {
  if ("discountPercentage" in customer) {
    return customer.discountPercentage;
  }

  return 0;
}

export function getCustomerTypeLabel(customer: CustomerAccount): string {
  if (customer.customerType === "member") {
    return `${customer.membershipLevel.toUpperCase()} Member`;
  }

  return "Guest";
}
