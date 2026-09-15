import { OrderStatus } from "./types";

export function updateOrderStatus(
  currentStatus: OrderStatus,
  newStatus: OrderStatus
): OrderStatus {
  switch (newStatus) {
    case "pending":
      return "pending";
    case "confirmed":
      return "confirmed";
    case "preparing":
      return "preparing";
    case "delivered":
      return "delivered";
    case "cancelled":
      return "cancelled";
    default:
      return assertNever(newStatus);
  }
}

function assertNever(value: never): never {
  throw new Error(`Unhandled order status: ${value}`);
}
