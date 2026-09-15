"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processPayment = processPayment;
function processPayment(payment, amount) {
    switch (payment.method) {
        case "cash":
            if (payment.receivedAmount < amount) {
                return {
                    success: false,
                    message: `Insufficient cash. Required ₹${amount.toFixed(2)}.`
                };
            }
            return {
                success: true,
                message: `Cash accepted. Change: ₹${(payment.receivedAmount - amount).toFixed(2)}`
            };
        case "card":
            if (!/^\d{4}$/.test(payment.last4Digits)) {
                return {
                    success: false,
                    message: "Card last 4 digits must contain exactly 4 digits."
                };
            }
            return {
                success: true,
                message: `Card ending in ${payment.last4Digits} charged ₹${amount.toFixed(2)}.`
            };
        case "upi":
            if (payment.transactionId.trim().length < 5) {
                return {
                    success: false,
                    message: "Invalid UPI transaction ID."
                };
            }
            return {
                success: true,
                message: `UPI transaction ${payment.transactionId} verified for ₹${amount.toFixed(2)}.`
            };
        default:
            return assertNever(payment);
    }
}
function assertNever(value) {
    throw new Error(`Unhandled payment method: ${value}`);
}
