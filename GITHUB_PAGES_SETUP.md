# GitHub Pages — one-time activation

1. Open this repository on GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Open the **Actions** tab, find **Deploy Debate Roulette to GitHub Pages**. If needed, select **Run workflow**.
5. After the workflow completes successfully, open **https://benseryan.github.io/Debateroulette/**.

Every push to `main` thereafter rebuilds and deploys automatically.

If you encounter a 404, verify the Pages source is GitHub Actions and that the deployment job succeeded. The app is static Vite and uses relative asset paths to support the repository URL.

The Lovable-connected source repository is kept separate; manually port selected UI changes into this project if desired.
