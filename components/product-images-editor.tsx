"use client";
import { useEffect, useRef, useState } from "react";
import type { CatalogProduct } from "@/lib/catalog";
export async function readProductImage(file: File) {
  if (!["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.type) || file.size > 20_000_000) throw new Error("Choose PNG/JPEG/WebP/GIF images under 20 MB.");
  const source = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error("Unable to read image.")); reader.readAsDataURL(file); });
  if (file.size <= 120000) return source;
  const image = new Image(); image.src = source; await image.decode();
  const canvas = document.createElement("canvas");
  for (const width of [1400, 1000, 700]) {
    const ratio = Math.min(1, width / Math.max(image.width, image.height)); canvas.width = Math.max(1, Math.round(image.width * ratio)); canvas.height = Math.max(1, Math.round(image.height * ratio));
    const context = canvas.getContext("2d"); if (!context) throw new Error("Unable to resize image."); context.drawImage(image, 0, 0, canvas.width, canvas.height);
    for (const quality of [.85, .65, .45]) { const result = canvas.toDataURL("image/webp", quality); if (result.length <= 160000) return result; }
  }
  throw new Error("Image is too large. Choose a smaller image.");
}
export function ProductImagesEditor({ value, setValue, onBusy }: { value: CatalogProduct; setValue: (product: CatalogProduct) => void; onBusy: (busy: boolean) => void }) {
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false); const pending = useRef(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const images = [value.image, ...(value.images || [])];
  const change = (next: string[]) => setValue({ ...value, image: next[0] || "", images: next.slice(1) });
  return <div className="product-image-editor"><h3>Product images · {images.filter(Boolean).length} / 5</h3><p>The first image is the cover. Add up to 5 images in total.</p><fieldset disabled={busy} style={{border:0,padding:0}}>
    {images.map((image, index) => <div className="product-image-slot" key={index}><label>{index === 0 ? "Image URL" : `Image ${index + 1} URL`}<input type="url" pattern="https://.*" placeholder="https://…" required={!image} value={image.startsWith("data:") ? "" : image} onChange={event => change(images.map((item, i) => i === index ? event.target.value : item))} /></label>{image && <img src={image} alt={`Product image ${index + 1}`} />}{images.length > 1 && <button type="button" onClick={() => change(images.filter((_, i) => i !== index))}>Remove image {index + 1}</button>}</div>)}
    {images.length < 5 && <button type="button" onClick={() => change([...images, ""])}>Add image URL</button>}
    <label>Upload product images<input type="file" multiple accept="image/png,image/jpeg,image/webp,image/gif" onChange={async event => {
      const files = Array.from(event.target.files || []); event.target.value = ""; if (!files.length || pending.current) return;
      const existing = images.filter(Boolean); if (existing.length + files.length > 5) { setError("A product can have a maximum of 5 images."); return; }
      pending.current = true; setBusy(true); onBusy(true); setError("");
      try { const sources = await Promise.all(files.map(readProductImage)); if (mounted.current) change([...existing, ...sources]); } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to upload images."); }
      finally { pending.current = false; setBusy(false); onBusy(false); }
    }} /></label></fieldset>{busy && <p role="status">Preparing images…</p>}{error && <p role="alert">{error}</p>}
  </div>;
}
