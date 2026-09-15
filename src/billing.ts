import {
  BillResult,
  CartItem,
  CustomerAccount,
  Payment,
  OrderStatus
} from "./types";
import { calculateSubtotal } from "./cart";
import { getCustomerDiscount } from "./customer";

const GST_RATE = 0.05;

export function calculateDiscount(
  subtotal: number,
  customer: CustomerAccount
): {
  membershipDiscount: number;
  additionalDiscount: number;
  totalDiscount: number;
} {
  const membershipDiscount =
    subtotal * (getCustomerDiscount(customer) / 100);

  const amountAfterMembership = subtotal - membershipDiscount;
  const additionalDiscount =
    subtotal > 2000 ? amountAfterMembership * 0.05 : 0;

  return {
    membershipDiscount,
    additionalDiscount,
    totalDiscount: membershipDiscount + additionalDiscount
  };
}

export function calculateTax(amountAfterDiscount: number): number {
  return amountAfterDiscount * GST_RATE;
}

export function calculateFinalAmount(
  subtotal: number,
  totalDiscount: number,
  tax: number
): number {
  return subtotal - totalDiscount + tax;
}

export function generateBill(
  orderId: string,
  customer: CustomerAccount | undefined,
  cart: CartItem[],
  payment: Payment | undefined,
  orderStatus: OrderStatus
): BillResult {
  if (!customer) {
    return { status: "error", message: "Customer has not been created." };
  }

  if (cart.length === 0) {
    return { status: "error", message: "Cart is empty." };
  }

  if (!payment) {
    return { status: "error", message: "Payment has not been processed." };
  }

  const subtotal = calculateSubtotal(cart);
  const discounts = calculateDiscount(subtotal, customer);
  const amountAfterDiscount = subtotal - discounts.totalDiscount;
  const tax = calculateTax(amountAfterDiscount);
  const finalAmount = calculateFinalAmount(
    subtotal,
    discounts.totalDiscount,
    tax
  );

  return {
    status: "success",
    bill: {
      orderId,
      customer,
      cartItems: [...cart],
      subtotal,
      membershipDiscount: discounts.membershipDiscount,
      additionalDiscount: discounts.additionalDiscount,
      totalDiscount: discounts.totalDiscount,
      amountAfterDiscount,
      tax,
      finalAmount,
      payment,
      orderStatus
    }
  };
}
