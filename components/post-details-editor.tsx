"use client";
import { useEffect, useRef, useState, type ClipboardEvent } from "react";
import type { EventPost } from "@/lib/store-content";
import { detailsText, type PostDetail } from "@/lib/post-details";

const imageTypes = ["image/png", "image/jpeg", "image/webp", "image/gif"];
async function clipboardImage(file: File): Promise<string> {
  if (!imageTypes.includes(file.type)) throw new Error("Paste a PNG, JPEG, WebP or GIF image.");
  if (file.size > 20_000_000) throw new Error("Choose an image under 20 MB.");
  const src = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error("Unable to read the image.")); reader.readAsDataURL(file);
  });
  if (file.size <= 450000) return src;
  const image = new Image(); image.src = src; await image.decode();
  const canvas = document.createElement("canvas");
  const scale = Math.min(1, 1400 / Math.max(image.width, image.height));
  canvas.width = Math.max(1, Math.round(image.width * scale)); canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext("2d"); if (!context) throw new Error("Unable to resize the image.");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  for (const quality of [0.85, 0.7, 0.5, 0.3]) {
    const result = canvas.toDataURL("image/webp", quality);
    if (result.length <= 600000) return result;
  }
  throw new Error("The image is too large. Paste a smaller image or its HTTPS URL.");
}

type Props = { value: EventPost; setValue: (post: EventPost) => void; label: string; onBusy: (busy: boolean) => void };
export function PostDetailsEditor({ value, setValue, label, onBusy }: Props) {
  const [error, setError] = useState("");
  const [pasting, setPasting] = useState(false);
  const pending = useRef(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const details: PostDetail[] = value.details?.length ? value.details : [{ type: "text", text: value.content || "" }];
  const update = (next: PostDetail[]) => setValue({ ...value, details: next, content: detailsText(next) });
  const paste = async (event: ClipboardEvent<HTMLTextAreaElement>, index: number) => {
    const files = Array.from(event.clipboardData.items).filter(item => item.kind === "file" && item.type.startsWith("image/")).map(item => item.getAsFile()).filter((file): file is File => file !== null);
    // Copy Image from a webpage may supply HTML rather than an image file.
    const html = event.clipboardData.getData("text/html");
    const urls = files.length ? [] : Array.from(new DOMParser().parseFromString(html, "text/html").querySelectorAll("img")).map(image => image.getAttribute("src") || "").filter(src => /^https:\/\//.test(src));
    const plain = event.clipboardData.getData("text/plain").trim();
    if (!files.length && !urls.length && /^https:\/\/\S+\.(?:png|jpe?g|webp|gif)(?:[?#]\S*)?$/i.test(plain)) urls.push(plain);
    if (!files.length && !urls.length) return;
    event.preventDefault();
    if (pending.current) return;
    if (details.filter(item => item.type === "image").length + files.length + urls.length > 6) { setError("Use up to 6 images inside the details."); return; }
    const field = event.currentTarget;
    const start = field.selectionStart; const end = field.selectionEnd;
    const item = details[index]; if (item.type !== "text") return;
    pending.current = true; setPasting(true); onBusy(true); setError("");
    try {
      const sources = files.length ? await Promise.all(files.map(clipboardImage)) : urls;
      const inserted: PostDetail[] = [{ type: "text", text: item.text.slice(0, start) }, ...sources.map(src => ({ type: "image" as const, src, alt: "" })), { type: "text", text: item.text.slice(end) }];
      if (!mounted.current) return;
      update([...details.slice(0, index), ...inserted, ...details.slice(index + 1)]);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to paste the image."); }
    finally { pending.current = false; setPasting(false); onBusy(false); }
  };
  return <div className="post-details-editor"><p id="details-paste-help">Copy an image, then paste (⌘V / Ctrl+V) where you want it in the details. You can also paste an HTTPS image URL.</p>
    {details.map((item, index) => item.type === "text" ? <label key={index}>{index === 0 ? label : `${label} — text ${index + 1}`}<textarea rows={index === 0 ? 8 : 4} aria-describedby="details-paste-help" value={item.text} disabled={pasting} onPaste={event => void paste(event, index)} onChange={event => {
      const next = details.map((part, i) => i === index ? { type: "text" as const, text: event.target.value } : part);
      if (detailsText(next).length <= 10000) update(next);
      else setError("Details can contain up to 10,000 characters.");
    }} placeholder="Write your story, or paste an image here." /></label> : <figure key={index}>
      <img src={item.src} alt={item.alt || "Pasted image"} />
      <label>Image description<input value={item.alt} maxLength={300} onChange={event => update(details.map((part, i) => i === index ? { ...item, alt: event.target.value } : part))} /></label>
      <button type="button" disabled={pasting} onClick={() => {
        const next = details.filter((_, i) => i !== index);
        // Merge adjacent text after removing an image.
        const merged: PostDetail[] = [];
        for (const part of next) { const previous = merged[merged.length - 1]; if (part.type === "text" && previous?.type === "text") previous.text += "\n\n" + part.text; else merged.push({ ...part }); }
        update(merged);
      }}>Remove details image</button>
    </figure>)}
    {pasting && <p role="status">Pasting image…</p>}{error && <p role="alert">{error}</p>}
  </div>;
}
