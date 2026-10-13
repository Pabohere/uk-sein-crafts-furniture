"use client";
import { defaultContact, type ContactContent } from "@/lib/store-content";
const contactFields: { key: keyof ContactContent; label: string; type?: string; multiline?: boolean }[] = [
  { key: "eyebrow", label: "Contact header tagline" },
  { key: "title", label: "Contact page title" },
  { key: "intro", label: "Contact introduction", multiline: true },
  { key: "showroomName", label: "Showroom name" },
  { key: "address", label: "Showroom address", multiline: true },
  { key: "phone", label: "Primary phone", type: "tel" },
  { key: "secondaryPhone", label: "Second phone (optional)", type: "tel" },
  { key: "email", label: "Contact email", type: "email" },
  { key: "openingHours", label: "Opening hours (optional)" },
  { key: "mapQuery", label: "Google Maps location (address or coordinates)" },
];
export function ContactSettingsEditor({ value, update }: { value?: ContactContent; update: (contact: ContactContent) => void }) {
  const contact = { ...defaultContact, ...value };
  return <section className="contact-settings-editor" id="contact-settings"><h3>Contact & showroom</h3>
    <p>These details appear on Contact Us. The address and phone numbers also update the footer. Enter a precise address or latitude,longitude for the showroom map; leave the map location empty to use the address.</p>
    {contactFields.map(field => <label key={field.key}>{field.label}{field.multiline ? <textarea value={contact[field.key]} onChange={event => update({ ...contact, [field.key]: event.target.value })} /> : <input type={field.type || "text"} value={contact[field.key]} onChange={event => update({ ...contact, [field.key]: event.target.value })} />}</label>)}
  </section>;
}
