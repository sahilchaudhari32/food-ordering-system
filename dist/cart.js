"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addToCart = addToCart;
exports.removeFromCart = removeFromCart;
exports.updateQuantity = updateQuantity;
exports.calculateItemTotal = calculateItemTotal;
exports.calculateSubtotal = calculateSubtotal;
function addToCart(cart, foodItem, quantity, specialInstruction) {
    if (!foodItem.isAvailable || quantity <= 0) {
        return cart;
    }
    const existingIndex = cart.findIndex((item) => item.id === foodItem.id);
    if (existingIndex !== -1) {
        return cart.map((item, index) => index === existingIndex
            ? {
                ...item,
                quantity: item.quantity + quantity,
                specialInstruction: specialInstruction ?? item.specialInstruction
            }
            : item);
    }
    return [
        ...cart,
        {
            ...foodItem,
            quantity,
            ...(specialInstruction ? { specialInstruction } : {})
        }
    ];
}
function removeFromCart(cart, foodId) {
    return cart.filter((item) => item.id !== foodId);
}
function updateQuantity(cart, foodId, quantity) {
    if (quantity <= 0) {
        return removeFromCart(cart, foodId);
    }
    return cart.map((item) => item.id === foodId ? { ...item, quantity } : item);
}
function calculateItemTotal(item) {
    return item.price * item.quantity;
}
function calculateSubtotal(cart) {
    return cart.reduce((total, item) => total + calculateItemTotal(item), 0);
}
