export function BrandLogo({ footer = false }: { footer?: boolean }) {
  return <span className={`brand-logo${footer ? " footer-logo" : ""}`}><img src="/uk-sein-logo-transparent.png" alt="Uk Sein Crafts & Furniture" /></span>;
}
