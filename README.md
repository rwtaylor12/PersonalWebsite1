# Personal Website

A simple, framework-free personal site with four pages:

| Page | File | What it's for |
| --- | --- | --- |
| About | `index.html` | Intro, personality, quick facts |
| Projects | `projects.html` | Featured 5×5 tracker demo plus project cards with tag filters |
| 5×5 Tracker | `projects/5x5-tracker.html` | Workout tracker app, pre-loaded with sample data (`sampleEntries()`) |
| Resume | `resume.html` | Resume with one-click PDF view and download |
| Say hello | `contact.html` | Contact form that emails Ryan |
| AI Lab | `ai.html` | Prompt anatomy demo, prompt library, build log |

## Making it yours

1. **Name, email & social links:** edit the `SITE` block at the top of `js/main.js`. The header and footer on every page are built from it.
2. **Page content:** open each `.html` file and replace the placeholder text. Comments in the files show where and how.
3. **Banner photos:** put images in `assets/banner/` and edit the `<img>` lines at the top of `index.html` (add or remove as many as you like). Photos show semi-transparent over the navy banner (adjust `--banner-photo-opacity` in `css/style.css`). Strip location data and resize to ~1920px before adding new ones.
   - **"I'm Ryan" rolodex:** one fact per `<li>` just below the photos in `index.html`.
   - **Timing:** `BANNER_SECONDS` and `ROLODEX_SECONDS` in `js/main.js`.
4. **Resume PDF:** replace `assets/Ryan-Taylor-Resume.pdf` with your new file (keep the same name).
5. **Contact form:** messages go through [FormSubmit](https://formsubmit.co) to the address in `contact.html` (`data-endpoint`). The first message ever sent triggers an activation email; click **Activate** once.
6. **Owen & Reid (easter egg):** two cartoon dinosaurs that sometimes pop up offering a quote, riddle, song or photo. Edit what they offer in `js/dino-content.js`; tune how often they appear at the top of `js/dinos.js`. Type **rawr** on any page (or add `?dinos` to the URL) to summon them.
7. **Colours:** change `--accent` (and friends) at the top of `css/style.css`.

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
