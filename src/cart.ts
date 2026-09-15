import { CartItem, FoodItem } from "./types";

export function addToCart(
  cart: CartItem[],
  foodItem: FoodItem,
  quantity: number,
  specialInstruction?: string
): CartItem[] {
  if (!foodItem.isAvailable || quantity <= 0) {
    return cart;
  }

  const existingIndex = cart.findIndex((item) => item.id === foodItem.id);

  if (existingIndex !== -1) {
    return cart.map((item, index) =>
      index === existingIndex
        ? {
            ...item,
            quantity: item.quantity + quantity,
            specialInstruction: specialInstruction ?? item.specialInstruction
          }
        : item
    );
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

export function removeFromCart(cart: CartItem[], foodId: number): CartItem[] {
  return cart.filter((item) => item.id !== foodId);
}

export function updateQuantity(
  cart: CartItem[],
  foodId: number,
  quantity: number
): CartItem[] {
  if (quantity <= 0) {
    return removeFromCart(cart, foodId);
  }

  return cart.map((item) =>
    item.id === foodId ? { ...item, quantity } : item
  );
}

export function calculateItemTotal(item: CartItem): number {
  return item.price * item.quantity;
}

export function calculateSubtotal(cart: CartItem[]): number {
  return cart.reduce((total, item) => total + calculateItemTotal(item), 0);
}
