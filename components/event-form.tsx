"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ImagePlus } from "lucide-react";
import { PostDetailsEditor } from "@/components/post-details-editor";
import type { EventPost } from "@/lib/store-content";

type Props = { value: EventPost; setValue: (value: EventPost) => void; submit: (event: FormEvent) => void; editing: boolean; cancel: () => void };
export function EventForm({ value, setValue, submit, editing, cancel }: Props) {
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const draft = useRef(value);
  useEffect(() => { draft.current = value; }, [value]);
  const blog = value.kind === "blog";
  const images = value.images || [];
  const upload = async (file: File | undefined, index?: number) => {
    if (!file) return;
    if (file.size > 450000 || !["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.type)) {
      setError("Choose PNG/JPEG/WebP/GIF under 450 KB, or use an HTTPS image URL."); return;
    }
    setError(""); setUploading(true);
    const currentId = value.id;
    try {
      const image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Unable to read the image."));
        reader.readAsDataURL(file);
      });
      if (draft.current.id !== currentId) return;
      if (index === undefined) setValue({ ...draft.current, image });
      else setValue({ ...draft.current, images: (draft.current.images || []).map((item, i) => i === index ? image : item) });
    } catch { setError("Unable to read the image. Please try again."); }
    finally { setUploading(false); }
  };
  const imageInput = (image: string, change: (image: string) => void, index?: number) => <>
    <label>{index === undefined ? "Cover image URL" : `Image ${index + 1} URL`}<input type="url" placeholder="https://…" required={!image} value={image.startsWith("data:") ? "" : image} onChange={e => change(e.target.value)} /></label>
    <label>Or upload image<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={e => void upload(e.target.files?.[0], index)} /></label>
    {image && <img className="event-preview" src={image} alt={index === undefined ? "Cover preview" : `Blog image ${index + 1} preview`} />}
  </>;
  return <form className="product-form event-form blog-form" onSubmit={e => {
    e.preventDefault(); setError("");
    const urls = [value.image, ...images, ...(value.details || []).filter(item => item.type === "image").map(item => item.src)];
    if (urls.some(image => !image || (!image.startsWith("data:image/") && !image.startsWith("https://")))) { setError("Use HTTPS image URLs or upload an image for every image slot."); return; }
    if (!value.title.trim() || (blog && !value.content?.trim())) { setError("Enter a title and blog content."); return; }
    submit(e);
  }}>
    <fieldset disabled={uploading} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
      <label>Post type<select value={value.kind || "event"} onChange={e => setValue({ ...value, kind: e.target.value as "event" | "blog", button: "Read more" })}><option value="event">Event</option><option value="blog">Blog</option></select></label>
      <label>Title<input maxLength={10000} value={value.title} onChange={e => setValue({ ...value, title: e.target.value })} required /></label>
      <label>{blog ? "Publish date" : "Date / location"}<input value={value.date} onChange={e => setValue({ ...value, date: e.target.value })} required /></label>
      <label>Button label<input value={value.button} onChange={e => setValue({ ...value, button: e.target.value })} /></label>
      {imageInput(value.image, image => setValue({ ...value, image }))}
      <PostDetailsEditor key={value.id} value={value} setValue={setValue} label={blog ? "Blog content" : "Event details"} onBusy={setUploading} />
      <h3>Additional images</h3><p>Add up to 6 images to display below the content.</p>
      {images.map((image, index) => <div className="blog-image-slot" key={index}>
        {imageInput(image, next => setValue({ ...value, images: images.map((item, i) => i === index ? next : item) }), index)}
        <button type="button" onClick={() => setValue({ ...value, images: images.filter((_, i) => i !== index) })}>Remove image {index + 1}</button>
      </div>)}
      {images.length < 6 && <button className="blog-add-image" type="button" onClick={() => setValue({ ...value, images: [...images, ""] })}><ImagePlus size={17} /> Add image</button>}
      {error && <p role="alert">{error}</p>}
      <button className="gold-button">{uploading ? "Reading image…" : editing ? "Save post" : blog ? "Publish blog" : "Publish event"}</button>
      {editing && <button type="button" onClick={cancel}>Cancel</button>}
    </fieldset>
  </form>;
}
