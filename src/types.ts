export type ID = number;

export type FoodCategory = "pizza" | "burger" | "drink" | "dessert";

export interface FoodItem {
  readonly id: ID;
  readonly name: string;
  readonly category: FoodCategory;
  readonly price: number;
  isAvailable: boolean;
}

export interface Address {
  street: string;
  city: string;
  pincode: string;
}

export interface Customer {
  id: ID;
  name: string;
  phone?: string;
  address: Address;
}

export type Guest = Customer & {
  customerType: "guest";
};

export type Member = Customer & {
  customerType: "member";
  membershipId: string;
  discountPercentage: number;
  membershipLevel: "silver" | "gold" | "platinum";
};

export type CustomerAccount = Guest | Member;

export type OrderInfo = {
  quantity: number;
  specialInstruction?: string;
};

export type CartItem = FoodItem & OrderInfo;

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "delivered"
  | "cancelled";

export type CashPayment = {
  method: "cash";
  receivedAmount: number;
};

export type CardPayment = {
  method: "card";
  last4Digits: string;
};

export type UpiPayment = {
  method: "upi";
  transactionId: string;
};

export type Payment = CashPayment | CardPayment | UpiPayment;

export interface Bill {
  orderId: string;
  customer: CustomerAccount;
  cartItems: CartItem[];
  subtotal: number;
  membershipDiscount: number;
  additionalDiscount: number;
  totalDiscount: number;
  amountAfterDiscount: number;
  tax: number;
  finalAmount: number;
  payment: Payment;
  orderStatus: OrderStatus;
}

export type BillResult =
  | {
      status: "success";
      bill: Bill;
    }
  | {
      status: "error";
      message: string;
    };
