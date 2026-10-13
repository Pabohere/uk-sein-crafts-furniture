import assert from 'node:assert/strict';
import { build } from 'esbuild';
const result = await build({
  stdin: { contents: `
    export { SiteTheme } from './components/storefront-theme-context';
    import { StorefrontThemeProvider, StorefrontThemeToggle } from './components/storefront-theme';
    import { LanguageProvider } from './components/language-provider';
    import { createElement } from 'react';
    import { renderToStaticMarkup } from 'react-dom/server';
    export function renderTheme(withProvider) {
      const button = createElement(StorefrontThemeToggle);
      return renderToStaticMarkup(createElement(LanguageProvider, null,
        withProvider ? createElement(StorefrontThemeProvider, null, button) : button));
    }
  `, resolveDir: process.cwd() },
  bundle: true, platform: 'node', format: 'esm', write: false,
  banner: {js: "import { createRequire } from 'node:module'; const require = createRequire(process.cwd() + '/tests/theme-hydration.mjs');"},
  define: { 'import.meta.hot': 'globalThis.__ukseinThemeHotTest', 'import.meta.env.DEV': 'true', 'process.env.NODE_ENV': '"production"' },
  plugins: [{ name:'navigation-test', setup(build) {
    build.onResolve({filter:/^next\/navigation$/},()=>({path:'navigation',namespace:'test'}));
    build.onLoad({filter:/.*/,namespace:'test'},()=>({contents:`export const usePathname = () => '/collection';`}));
  }}],
});
const source=result.outputFiles[0].text;
globalThis.__ukseinThemeHotTest={data:{}};
const load = async tag => import(`data:text/javascript;base64,${Buffer.from(source+'\n// '+tag).toString('base64')}`);
try {
  const first=await load('first evaluation');
  const refreshed=await load('hot reevaluation');
  assert.equal(first.SiteTheme,refreshed.SiteTheme,'hot reload must preserve provider/consumer context identity');
  const button=html=>html.match(/<button\b[^>]*>[\s\S]*?<\/button>/)?.[0];
  assert.equal(button(first.renderTheme(true)),button(refreshed.renderTheme(false)),'provider and temporary fallback have identical initial button HTML');
  assert.ok(button(first.renderTheme(true)).includes('disabled=""'));
  assert.ok(button(first.renderTheme(true)).includes('aria-label="Switch to dark mode"'));
  globalThis.__ukseinThemeHotTest={data:{}};
  const independent=await load('new environment');
  assert.notEqual(first.SiteTheme,independent.SiteTheme,'independent runtimes must not share context or theme state');
  console.log('Theme HMR context identity and server/fallback markup checks passed.');
} catch (error) { console.error(error.message); process.exitCode = 1; } finally { delete globalThis.__ukseinThemeHotTest; }
