"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = updateOrderStatus;
function updateOrderStatus(currentStatus, newStatus) {
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
function assertNever(value) {
    throw new Error(`Unhandled order status: ${value}`);
}
