# Northstar Studio — flat GitHub upload

**Every file in this ZIP is in one folder. No subfolders.** Extract, select all files, and upload them into the **root** of your `digital-product-store` GitHub repository. Replace existing matching files, then commit.

This edition has 12 website pages, 18 browser tools and 18 downloads. `index.html` now uses the same multi-page app as the other pages; all pages load root-level `pages.js`, `style.css` and `pages.css`. Download resources also live at the root, and the Vite config includes them in the deployment.

The existing `.github/workflows/static.yml` in your repository remains in place. **Do not delete the existing `.github` directory**. Uploading these flat files does not remove old files; the old `src/` and `public/` folders may remain, but this build does not use them.

After committing, verify GitHub Actions succeeded, then visit https://marksheininwork-netizen.github.io/digital-product-store/

No real payments, cloud accounts or server-side messaging are implemented. Favorites and notes save locally in the browser. QR images use an external QR API.
