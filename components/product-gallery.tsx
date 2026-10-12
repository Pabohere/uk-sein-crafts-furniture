"use client";
import { useState } from "react";
export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [selected, setSelected] = useState(0); const sources = images.filter(Boolean).slice(0, 5);
  return <div className="product-gallery"><img className="product-gallery-main" src={sources[selected] || sources[0]} alt={name} />{sources.length > 1 && <div className="product-gallery-thumbnails">{sources.map((image, index) => <button key={index} type="button" aria-label={`View product image ${index + 1}`} aria-pressed={selected === index} onClick={() => setSelected(index)}><img src={image} alt={`${name} — ${index + 1}`} /></button>)}</div>}</div>;
}
