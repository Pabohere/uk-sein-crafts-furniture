/** Myanmar needs taller line boxes and its own font shaping. */
export function textLanguage(...text: string[]): "my" | undefined {
  return /[\u1000-\u109F\uA9E0-\uA9FF\uAA60-\uAA7F]/u.test(text.join(" "))
    ? "my"
    : undefined;
}
