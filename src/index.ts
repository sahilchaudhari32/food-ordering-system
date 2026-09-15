import * as readline from "readline/promises";
import { stdin as input, stdout as output } from "process";
import { foodItems } from "./data";
import {
  addToCart,
  calculateItemTotal,
  calculateSubtotal,
  removeFromCart,
  updateQuantity
} from "./cart";
import {
  createGuest,
  createMember,
  getCustomerTypeLabel
} from "./customer";
import { calculateDiscount, calculateTax, generateBill } from "./billing";
import { processPayment } from "./payment";
import { updateOrderStatus } from "./order";
import {
  Bill,
  CartItem,
  CustomerAccount,
  OrderStatus,
  Payment
} from "./types";

const rl = readline.createInterface({ input, output });

let customer: CustomerAccount | undefined;
let cart: CartItem[] = [];
let orderStatus: OrderStatus = "pending";
let orderCounter = 1001;

function printHeader(title: string): void {
  console.log("\n==============================================");
  console.log(`              ${title}`);
  console.log("==============================================");
}

function showFoodMenu(): void {
  printHeader("FOOD MENU");

  foodItems.forEach((item) => {
    const availability = item.isAvailable ? "Available" : "Unavailable";
    console.log(
      `${item.id}. ${item.name.padEnd(24)} ₹${item.price
        .toFixed(2)
        .padStart(7)}  [${item.category}] ${availability}`
    );
  });
}

function showCart(): void {
  printHeader("YOUR CART");

  if (cart.length === 0) {
    console.log("Cart is empty.");
    return;
  }

  cart.forEach((item) => {
    console.log(
      `${item.name.padEnd(24)} x${item.quantity
        .toString()
        .padStart(2)}  ₹${calculateItemTotal(item).toFixed(2)}`
    );

    if (item.specialInstruction) {
      console.log(`   Note: ${item.specialInstruction}`);
    }
  });

  console.log("----------------------------------------------");
  console.log(`Subtotal: ₹${calculateSubtotal(cart).toFixed(2)}`);
}

async function createCustomerPrompt(): Promise<void> {
  printHeader("CREATE CUSTOMER");

  const name = (await rl.question("Customer name: ")).trim();

  if (!name) {
    console.log("Name cannot be empty.");
    return;
  }

  const phoneInput = (await rl.question("Phone (optional): ")).trim();
  const street = (await rl.question("Street: ")).trim();
  const city = (await rl.question("City: ")).trim();
  const pincode = (await rl.question("Pincode: ")).trim();

  const type = (
    await rl.question("Customer type (guest/member): ")
  ).trim().toLowerCase();

  const address = { street, city, pincode };
  const phone = phoneInput || undefined;

  if (type === "member") {
    const levelInput = (
      await rl.question("Membership level (silver/gold/platinum): ")
    ).trim().toLowerCase();

    if (
      levelInput !== "silver" &&
      levelInput !== "gold" &&
      levelInput !== "platinum"
    ) {
      console.log("Invalid membership level.");
      return;
    }

    const member = createMember(
      Date.now(),
      name,
      phone,
      address,
      levelInput
    );
    customer = member;

    console.log(
      `Member created successfully. Membership ID: ${member.membershipId}`
    );
  } else if (type === "guest") {
    customer = createGuest(Date.now(), name, phone, address);
    console.log("Guest customer created successfully.");
  } else {
    console.log("Invalid customer type.");
  }
}

async function addItemPrompt(): Promise<void> {
  showFoodMenu();

  const id = Number(await rl.question("\nEnter food item ID: "));
  const item = foodItems.find((food) => food.id === id);

  if (!item) {
    console.log("Food item not found.");
    return;
  }

  if (!item.isAvailable) {
    console.log("This item is currently unavailable.");
    return;
  }

  const quantity = Number(await rl.question("Quantity: "));

  if (!Number.isInteger(quantity) || quantity <= 0) {
    console.log("Quantity must be a positive whole number.");
    return;
  }

  const instructionInput = (
    await rl.question("Special instruction (optional): ")
  ).trim();

  cart = addToCart(
    cart,
    item,
    quantity,
    instructionInput || undefined
  );

  console.log(`${item.name} added to cart.`);
}

async function updateQuantityPrompt(): Promise<void> {
  showCart();

  if (cart.length === 0) return;

  const id = Number(await rl.question("\nEnter food item ID: "));
  const quantity = Number(await rl.question("New quantity: "));

  if (!Number.isInteger(quantity) || quantity < 0) {
    console.log("Quantity must be 0 or a positive whole number.");
    return;
  }

  const exists = cart.some((item) => item.id === id);

  if (!exists) {
    console.log("Item is not in the cart.");
    return;
  }

  cart = updateQuantity(cart, id, quantity);
  console.log(quantity === 0 ? "Item removed." : "Quantity updated.");
}

async function removeItemPrompt(): Promise<void> {
  showCart();

  if (cart.length === 0) return;

  const id = Number(await rl.question("\nEnter food item ID to remove: "));

  if (!cart.some((item) => item.id === id)) {
    console.log("Item is not in the cart.");
    return;
  }

  cart = removeFromCart(cart, id);
  console.log("Item removed from cart.");
}

function calculateCheckoutTotal(): {
  subtotal: number;
  totalDiscount: number;
  tax: number;
  finalAmount: number;
} | undefined {
  if (!customer || cart.length === 0) {
    return undefined;
  }

  const subtotal = calculateSubtotal(cart);
  const discounts = calculateDiscount(subtotal, customer);
  const amountAfterDiscount = subtotal - discounts.totalDiscount;
  const tax = calculateTax(amountAfterDiscount);

  return {
    subtotal,
    totalDiscount: discounts.totalDiscount,
    tax,
    finalAmount: amountAfterDiscount + tax
  };
}

async function checkoutPrompt(): Promise<void> {
  if (!customer) {
    console.log("Please create a customer first.");
    return;
  }

  if (cart.length === 0) {
    console.log("Cart is empty.");
    return;
  }

  const totals = calculateCheckoutTotal();

  if (!totals) {
    console.log("Unable to calculate checkout.");
    return;
  }

  printHeader("CHECKOUT");

  console.log(`Customer: ${customer.name}`);
  console.log(`Type: ${getCustomerTypeLabel(customer)}`);
  console.log(`Subtotal: ₹${totals.subtotal.toFixed(2)}`);
  console.log(`Discount: ₹${totals.totalDiscount.toFixed(2)}`);
  console.log(`GST (5%): ₹${totals.tax.toFixed(2)}`);
  console.log(`Final Amount: ₹${totals.finalAmount.toFixed(2)}`);

  const method = (
    await rl.question("\nPayment method (cash/card/upi): ")
  ).trim().toLowerCase();

  let payment: Payment | undefined;

  switch (method) {
    case "cash": {
      const receivedAmount = Number(
        await rl.question("Cash received: ₹")
      );

      if (!Number.isFinite(receivedAmount)) {
        console.log("Invalid amount.");
        return;
      }

      payment = { method: "cash", receivedAmount };
      break;
    }

    case "card": {
      const last4Digits = (
        await rl.question("Last 4 card digits: ")
      ).trim();

      payment = { method: "card", last4Digits };
      break;
    }

    case "upi": {
      const transactionId = (
        await rl.question("UPI transaction ID: ")
      ).trim();

      payment = { method: "upi", transactionId };
      break;
    }

    default:
      console.log("Invalid payment method.");
      return;
  }

  const paymentResult = processPayment(payment, totals.finalAmount);

  if (!paymentResult.success) {
    console.log(`Payment failed: ${paymentResult.message}`);
    return;
  }

  console.log(paymentResult.message);

  const orderId = `ORD-${orderCounter++}`;

  const result = generateBill(
    orderId,
    customer,
    cart,
    payment,
    "confirmed"
  );

  if (result.status === "success") {
    orderStatus = result.bill.orderStatus;
    printBill(result.bill);
  } else {
    console.log(`Billing error: ${result.message}`);
  }
}

function printBill(bill: Bill): void {
  printHeader("ORDER SUMMARY");

  console.log(`Order ID: ${bill.orderId}`);
  console.log(`Customer: ${bill.customer.name}`);
  console.log(`Membership: ${getCustomerTypeLabel(bill.customer)}`);

  console.log("\nItems:");
  console.log("----------------------------------------------");

  bill.cartItems.forEach((item) => {
    console.log(
      `${item.name.padEnd(24)} x${item.quantity
        .toString()
        .padStart(2)}  ₹${calculateItemTotal(item).toFixed(2)}`
    );
  });

  console.log("----------------------------------------------");
  console.log(`Subtotal:              ₹${bill.subtotal.toFixed(2)}`);
  console.log(
    `Membership Discount:   ₹${bill.membershipDiscount.toFixed(2)}`
  );
  console.log(
    `Additional Discount:   ₹${bill.additionalDiscount.toFixed(2)}`
  );
  console.log(`Total Discount:        ₹${bill.totalDiscount.toFixed(2)}`);
  console.log(`After Discount:        ₹${bill.amountAfterDiscount.toFixed(2)}`);
  console.log(`GST (5%):              ₹${bill.tax.toFixed(2)}`);
  console.log("----------------------------------------------");
  console.log(`Final Amount:          ₹${bill.finalAmount.toFixed(2)}`);

  displayPayment(bill.payment);

  console.log(`Order Status: ${bill.orderStatus.toUpperCase()}`);
  console.log("==============================================");
  console.log("          Thank you for ordering! ");
  console.log("==============================================");
}

function displayPayment(payment: Payment): void {
  console.log(`Payment Method: ${payment.method.toUpperCase()}`);

  switch (payment.method) {
    case "cash":
      console.log(`Received Amount: ₹${payment.receivedAmount.toFixed(2)}`);
      break;

    case "card":
      console.log(`Card Last 4 Digits: ${payment.last4Digits}`);
      break;

    case "upi":
      console.log(`Transaction ID: ${payment.transactionId}`);
      break;

    default:
      assertNever(payment);
  }
}

function displayOrderStatus(): void {
  printHeader("ORDER STATUS");
  console.log(`Current status: ${orderStatus}`);
}

async function changeOrderStatusPrompt(): Promise<void> {
  displayOrderStatus();

  const nextStatus = (
    await rl.question(
      "New status (pending/confirmed/preparing/delivered/cancelled): "
    )
  ).trim().toLowerCase();

  if (
    nextStatus !== "pending" &&
    nextStatus !== "confirmed" &&
    nextStatus !== "preparing" &&
    nextStatus !== "delivered" &&
    nextStatus !== "cancelled"
  ) {
    console.log("Invalid order status.");
    return;
  }

  orderStatus = updateOrderStatus(orderStatus, nextStatus);
  console.log(`Order status changed to: ${orderStatus}`);
}

function assertNever(value: never): never {
  throw new Error(`Unhandled value: ${value}`);
}

function showCustomer(): void {
  printHeader("CUSTOMER");

  if (!customer) {
    console.log("No customer created.");
    return;
  }

  console.log(`Name: ${customer.name}`);
  console.log(`Type: ${getCustomerTypeLabel(customer)}`);
  console.log(`Phone: ${customer.phone ?? "Not provided"}`);
  console.log(
    `Address: ${customer.address.street}, ${customer.address.city} - ${customer.address.pincode}`
  );

  if (customer.customerType === "member") {
    console.log(`Membership ID: ${customer.membershipId}`);
    console.log(`Discount: ${customer.discountPercentage}%`);
  }
}

function showMenu(): void {
  console.log(`
══════════════════════════════════════════════
          FOOD ORDERING SYSTEM              
══════════════════════════════════════════════
  1. View Food Menu
  2. Create Customer
  3. View Customer
  4. Add Item to Cart
  5. View Cart
  6. Update Quantity
  7. Remove Item
  8. Checkout
  9. Change Order Status
  10. View Order Status
  0. Exit
`);
}

async function main(): Promise<void> {
  let running = true;

  while (running) {
    showMenu();

    const choice = (await rl.question("Select an option: ")).trim();

    switch (choice) {
      case "1":
        showFoodMenu();
        break;
      case "2":
        await createCustomerPrompt();
        break;
      case "3":
        showCustomer();
        break;
      case "4":
        await addItemPrompt();
        break;
      case "5":
        showCart();
        break;
      case "6":
        await updateQuantityPrompt();
        break;
      case "7":
        await removeItemPrompt();
        break;
      case "8":
        await checkoutPrompt();
        break;
      case "9":
        await changeOrderStatusPrompt();
        break;
      case "10":
        displayOrderStatus();
        break;
      case "0":
        running = false;
        console.log("\nThank you! Goodbye 👋");
        break;
      default:
        console.log("Invalid option. Please try again.");
    }
  }

  rl.close();
}

main().catch((error: unknown) => {
  console.error("Application error:", error);
  rl.close();
});
