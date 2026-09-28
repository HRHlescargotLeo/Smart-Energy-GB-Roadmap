# Smart Energy GB — website improvement prototypes (V2)

Five clickable prototypes for improvements to smartenergygb.org, prepared by ClerksWell following the
phase 1 review (28 September 2026). The Smart Energy GB design layer (colours, Hind type, buttons, panels,
imagery treatment) lives entirely in `src/css/theme.css`; remove that file to get the greyscale prototypes back.

Photography is Smart Energy GB's own, loaded directly from smartenergygb.org by `src/js/photos.js` (the
mapping of images to placeholders lives there). Where the images can't load, illustrated placeholders in the
brand green show instead. Photography © Smart Energy GB; the repository and site are public, so treat them
accordingly. Photos beside named owners' quotes are deliberately left as placeholders.

## View
Live: https://hrhlescargotleo.github.io/Smart-Energy-GB-Roadmap/

Or open `docs/index.html` in a browser. No server or install needed.

GitHub Pages publishes from the `docs/` folder on `main`
(Settings → Pages → Deploy from a branch → `main` / `/docs`).

## Prototypes
1. Get a smart meter — `pages/get-a-smart-meter.html`, plus `pages/which-meter.html`
2. Is my smart meter working? — `pages/is-my-meter-working.html` (`?start=rts` or `?start=switchup` opens a route)
3. Energy prices — `pages/energy-prices.html`
4. Homepage — `pages/home.html`, plus the campaign template `pages/switch-up.html`
5. Find an answer — `pages/answers.html` (`?q=` runs a search)

Module library: `modules/library.html`. Requirements: `requirements/requirements.md`.

## Build
```
node build-includes.js && node validate.js
```
Edit files in `src/`; `docs/` is generated (commit it, as GitHub Pages serves it). The prototype
navigator (top bar with the Notes switch) and the previous/next footer live in `src/includes/`.

Shared data lives in `src/js/data.js`: suppliers, the price cap record (Ofgem, July to December 2026),
DESNZ smart meter figures (end June 2026) and 29 sample answers drafted from the live FAQs.
Generic behaviour is in `src/js/wireframe.js`; prototype behaviour in `src/js/prototypes.js`.

## Status
V2, designed prototypes for internal review. Smart Energy GB's own header and footer are replaced by a prototype navigator. Notes are off by default; switch "Notes on" in the top bar
to show what each prototype proposes and why, plus in-page annotations.
