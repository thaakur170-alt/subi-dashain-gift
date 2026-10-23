# Subi's Dashain Surprise ❤️ — GitHub Pages version

This project is configured to build and publish automatically on GitHub Pages. You do not need to run npm on your Windows computer.

## Publish it
1. Sign in to https://github.com/ (create a free account if needed).
2. Create a **new public repository** named `subi-dashain-gift`.
3. Extract this ZIP on your computer.
4. In the new repository, choose **Add file → Upload files**.
5. Upload the *contents* of the extracted folder (including `package.json`, `index.html`, `src`, `vite.config.js`, and the `.github/workflows/deploy.yml` workflow). Do not upload only the ZIP file.
6. Commit the upload to the `main` branch.
7. Open the repository's **Settings → Pages**. Under **Build and deployment**, set **Source** to **GitHub Actions**.
8. Open the **Actions** tab and wait for “Deploy Subi Dashain Gift Website to GitHub Pages” to finish with a green check.
9. The public link will be `https://YOUR-GITHUB-USERNAME.github.io/subi-dashain-gift/`.

If the workflow fails, open Actions, click the failed run, and share the error text. Do not share passwords or access tokens.

Note: this is a static client-side gift website. Voucher/QR details are a playful gift reference, not a real payment or redeemable financial transaction. Browser local storage is local to each visitor's browser.
