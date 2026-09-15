"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDiscount = calculateDiscount;
exports.calculateTax = calculateTax;
exports.calculateFinalAmount = calculateFinalAmount;
exports.generateBill = generateBill;
const cart_1 = require("./cart");
const customer_1 = require("./customer");
const GST_RATE = 0.05;
function calculateDiscount(subtotal, customer) {
    const membershipDiscount = subtotal * ((0, customer_1.getCustomerDiscount)(customer) / 100);
    const amountAfterMembership = subtotal - membershipDiscount;
    const additionalDiscount = subtotal > 2000 ? amountAfterMembership * 0.05 : 0;
    return {
        membershipDiscount,
        additionalDiscount,
        totalDiscount: membershipDiscount + additionalDiscount
    };
}
function calculateTax(amountAfterDiscount) {
    return amountAfterDiscount * GST_RATE;
}
function calculateFinalAmount(subtotal, totalDiscount, tax) {
    return subtotal - totalDiscount + tax;
}
function generateBill(orderId, customer, cart, payment, orderStatus) {
    if (!customer) {
        return { status: "error", message: "Customer has not been created." };
    }
    if (cart.length === 0) {
        return { status: "error", message: "Cart is empty." };
    }
    if (!payment) {
        return { status: "error", message: "Payment has not been processed." };
    }
    const subtotal = (0, cart_1.calculateSubtotal)(cart);
    const discounts = calculateDiscount(subtotal, customer);
    const amountAfterDiscount = subtotal - discounts.totalDiscount;
    const tax = calculateTax(amountAfterDiscount);
    const finalAmount = calculateFinalAmount(subtotal, discounts.totalDiscount, tax);
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
