# Northstar Studio — GitHub Pages ready

This is a complete replacement for the repository source, not an incremental patch. Upload the contents of this folder to the **root** of `marksheininwork-netizen/digital-product-store`, preserving directories. Replace existing files when GitHub prompts. Existing unrelated repository files can remain.

## Included
- Searchable, filterable storefront with 10 genuinely downloadable starter resources
- 10 interactive browser tools: invoice preview/print, timer, budget, word counter, password generator, QR generator, profit margin, text case, palette, and priority matrix
- Toolkit recommendations, favorites stored in this browser, dark-mode toggle, responsive layout
- GitHub Pages workflow that builds Vite and deploys `dist`

## Deployment
1. Upload `index.html`, `package.json`, `vite.config.js`, `src/`, `public/`, and `.github/` into repository root.
2. In Settings → Pages select **GitHub Actions**.
3. Wait for the Actions deployment and open https://marksheininwork-netizen.github.io/digital-product-store/

## Local development
`npm install` then `npm run dev`. `npm run build` builds production files.

## Honest limitations
No checkout, subscriptions, authentication, secure cloud storage, or customer billing are implemented. Downloads are free. Favorites and theme are stored in localStorage on one browser. The QR code generator sends its entered text to a third-party image API, so do not enter private information. Printed invoice previews are not persisted. This is a static GitHub Pages app.
