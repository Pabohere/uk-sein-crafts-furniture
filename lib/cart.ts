import type { CatalogProduct } from "@/lib/catalog";

export type CartLine = Pick<CatalogProduct, "id" | "name" | "price" | "image"> & { quantity: number };
export type CustomerDetails = { customer: string; phone: string; address: string };
export type StoreOrder = CustomerDetails & { id: string; item: string; image: string; total: string; status: string };

const cartKey = "uksein_cart";
const orderKey = "uksein_orders";
const priceValue = (value: string) => Number(value.replace(/[^0-9]/g, "")) || 0;
const totalFor = (cart: CartLine[]) => cart.reduce((total, item) => total + priceValue(item.price) * item.quantity, 0);
const formatMMK = (amount: number) => `${new Intl.NumberFormat("en-US").format(amount)} MMK`;

export const readCart = (): CartLine[] => { try { return JSON.parse(localStorage.getItem(cartKey) || "[]") as CartLine[]; } catch { return []; } };
const saveCart = (cart: CartLine[]) => { localStorage.setItem(cartKey, JSON.stringify(cart)); window.dispatchEvent(new Event("cart-updated")); };
export const clearCart = () => saveCart([]);
export const addToCart = (product: CatalogProduct) => {
  const cart = readCart(); const existing = cart.find((item) => item.id === product.id);
  saveCart(existing ? cart.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...cart, { id: product.id, name: product.name, price: product.price, image: product.image, quantity: 1 }]);
  window.dispatchEvent(new Event("cart-open"));
};
export const changeCartQuantity = (id: string, quantity: number) => saveCart(readCart().flatMap((item) => item.id === id ? quantity > 0 ? [{ ...item, quantity }] : [] : [item]));

export const submitOrder = async (customer: CustomerDetails): Promise<StoreOrder> => {
  const cart = readCart(); if (!cart.length) throw new Error("Your cart is empty.");
  const order: StoreOrder = { id: `US-${String(Date.now()).slice(-6)}`, ...customer, item: cart.map((line) => `${line.name} × ${line.quantity}`).join(", "), image: cart[0].image, total: formatMMK(totalFor(cart)), status: "Pending payment" };
  if (import.meta.env.DEV) {
    const orders = JSON.parse(localStorage.getItem(orderKey) || "[]") as StoreOrder[];
    localStorage.setItem(orderKey, JSON.stringify([order, ...orders]));
  } else {
    const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(order) });
    if (!response.ok) throw new Error("Unable to place your order. Please try again.");
  }
  saveCart([]); window.dispatchEvent(new Event("storage"));
  return order;
};
