import { readLocalOrders } from "@/lib/demo-orders";
import { readCatalog, type CatalogProduct } from "@/lib/catalog";

export type CartLine = Pick<CatalogProduct, "id" | "name" | "price" | "image"> & { quantity: number; productId?: string; size?: string };
export type CustomerDetails = { customer: string; phone: string; address: string };
export type OrderItem = { productId: string; name: string; size: string; quantity: number; image: string; price: string };
export type StoreOrder = CustomerDetails & { id: string; item: string; image: string; total: string; status: string; items?: OrderItem[] };

const cartKey = "uksein_cart";
const orderKey = "uksein_orders";
const priceValue = (value: string) => Number(value.replace(/[^0-9]/g, "")) || 0;
const totalFor = (cart: CartLine[]) => cart.reduce((total, item) => total + priceValue(item.price) * item.quantity, 0);
const formatMMK = (amount: number) => `${new Intl.NumberFormat("en-US").format(amount)} MMK`;

export const readCart = (): CartLine[] => { try { return JSON.parse(localStorage.getItem(cartKey) || "[]") as CartLine[]; } catch { return []; } };
const saveCart = (cart: CartLine[]) => { localStorage.setItem(cartKey, JSON.stringify(cart)); window.dispatchEvent(new Event("cart-updated")); };
export const clearCart = () => saveCart([]);
export const cartProductId = (line: CartLine) => line.productId || line.id;
const lineId = (productId: string, size?: string) => JSON.stringify([productId, size || ""]);
const checkSize = (product: CatalogProduct, size?: string) => {
  if (product.sizes.length && (!size || !product.sizes.includes(size))) throw new Error(`Please choose an available size for ${product.name}.`);
  if (!product.sizes.length && size) throw new Error(`${product.name} no longer has this size. Please remove it and add it again.`);
};
export const addToCart = (product: CatalogProduct, size?: string) => {
  const current = readCatalog().find(item => item.id === product.id) || product;
  if (current.stockStatus === "out_of_stock") return;
  checkSize(current, size);
  const cart = readCart();
  const existing = cart.find(item => cartProductId(item) === current.id && item.size === size);
  saveCart(existing ? cart.map(item => item.id === existing.id ? { ...item, quantity: item.quantity + 1 } : item) : [...cart, { id: lineId(current.id, size), productId: current.id, size, name: current.name, price: current.price, image: current.image, quantity: 1 }]);
  window.dispatchEvent(new Event("cart-open"));
};
export const changeCartSize = (id: string, size: string) => {
  const cart = readCart(); const line = cart.find(item => item.id === id); if (!line) return;
  const product = readCatalog().find(item => item.id === cartProductId(line)); if (!product) throw new Error("This product is no longer available.");
  checkSize(product, size || undefined);
  const existing = cart.find(item => item.id !== id && cartProductId(item) === product.id && item.size === size);
  saveCart(existing ? cart.filter(item => item.id !== id).map(item => item.id === existing.id ? { ...item, quantity: item.quantity + line.quantity } : item) : cart.map(item => item.id === id ? { ...item, id: lineId(product.id, size), productId: product.id, size: size || undefined } : item));
};
export const changeCartQuantity = (id: string, quantity: number) => saveCart(readCart().flatMap((item) => item.id === id ? quantity > 0 ? [{ ...item, quantity }] : [] : [item]));

export const submitOrder = async (customer: CustomerDetails): Promise<StoreOrder> => {
  const cart = readCart(); if (!cart.length) throw new Error("Your cart is empty.");
  const catalog = readCatalog();
  const unavailable = cart.find(line => catalog.find(product => product.id === cartProductId(line))?.stockStatus === "out_of_stock");
  if (unavailable) throw new Error(`${unavailable.name} is out of stock. Please remove it from your cart before ordering.`);
  for (const line of cart) {
    const product = catalog.find(item => item.id === cartProductId(line));
    if (!product) throw new Error(`${line.name} is no longer available. Please remove it from your cart.`);
    checkSize(product, line.size);
  }
  const order: StoreOrder = { id: `US-${String(Date.now()).slice(-6)}`, ...customer, item: cart.map((line) => `${line.name}${line.size ? ` · ${line.size}` : ""} × ${line.quantity}`).join(", "), image: cart[0].image, items: cart.map(line => ({ productId: cartProductId(line), name: line.name, size: line.size || "", quantity: line.quantity, image: line.image, price: line.price })), total: formatMMK(totalFor(cart)), status: "Pending payment" };
  if (import.meta.env.DEV) {
    const orders = readLocalOrders();
    localStorage.setItem(orderKey, JSON.stringify([order, ...orders]));
  } else {
    const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(order) });
    if (!response.ok) throw new Error("Unable to place your order. Please try again.");
  }
  saveCart([]); window.dispatchEvent(new Event("storage"));
  return order;
};
