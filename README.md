# Personal Website

A simple, framework-free personal site with four pages:

| Page | File | What it's for |
| --- | --- | --- |
| About | `index.html` | Intro, personality, quick facts |
| Projects | `projects.html` | Project cards with tag filters |
| Resume | `resume.html` | CV with a print / save-as-PDF button |
| AI Lab | `ai.html` | Prompt anatomy demo, prompt library, build log |

## Making it yours

1. **Name, email & social links:** edit the `SITE` block at the top of `js/main.js`. The header and footer on every page are built from it.
2. **Page content:** open each `.html` file and replace the placeholder text. Comments in the files show where and how.
3. **Photo:** add `assets/me.jpg` and follow the comment above the avatar in `index.html`.
4. **Resume PDF:** drop your file at `assets/resume.pdf`, or use the page's "Print / Save as PDF" button.
5. **Colours:** change `--accent` (and friends) at the top of `css/style.css`.

Search for `Your Name` and `you@example.com` to catch every placeholder.

## Previewing locally

Open `index.html` in a browser, or run a tiny server:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Publishing free with GitHub Pages

1. Merge this into your default branch (`main`).
2. On GitHub, go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, then select `main` and `/ (root)`.
4. After a minute, your site is live at `https://<your-username>.github.io/<repo-name>/`.
