# PlotCover

An offline-capable PWA for setting up agricultural studies and rating visible weed cover from RGB photos. No login, photo uploads, or cloud account required. Data stays in IndexedDB on the current device; this is not yet a shared multi-user platform.

## Study workflow

1. Study name, objective, crop rows or fallow, and baseline availability (weedy, weed-free or both).
2. Treatment codes, names, reference types, herbicide, actual rate and selectable units. Presets include fluid oz/US gal, mL/L, area-based rates and percent concentrations; Other accepts custom units. Older label-rate metadata is retained but the setup field has been removed.
3. Spray applications and dates.
4. Blocks/replicates, generated plot numbers, manual treatment assignments and randomization notes.
5. Rating timings linked to an application and day offset.
6. Review and save.

Plot generation creates one plot per treatment per block in treatment order. It does **not** randomize treatments. For 10 treatments, a first plot of 101 and block spacing of 100 generate 101–110, 201–210, etc. Users can change assignments, edit numbers, add plots or remove plots. Spray applications are separate from blocks.

Open a study, select a rating timing, and select a plot. Take photo opens an in-app rear-camera preview with one dotted vertical center line for both crop rows and fallow. For row crops, frame the middle two rows; for all plots, avoid the first/last 2 ft and plot sides. The guide is visual: it does not measure physical distances, detect rows, or automatically crop boundaries. Maintain comparable oblique camera angle, distance and ground area. Camera guide pixels are never included in the saved image or analysis. Camera tracks stop when leaving the preview or hiding the app. A native Phone camera fallback and Upload remain available; the native camera cannot show the in-app overlay. Capture/upload a photo, adjust the per-photo ExG threshold while inspecting a white/black binary mask, switching to a translucent red overlay on the original photo or the photo alone, then tapping Block crop to enable rectangle and brush exclusions, move/resize boxes using Edit box, zoom from 100–400%, pan with Move view, or paint additional exclusions with Brush (Erase brush removes only brush marks), optionally enter a manual visual control rating and notes, then save and continue to the next unrated plot. Multiple photos per plot and timing are supported. Saved photos can be viewed or deleted from that plot's history.

Study setup can be edited. Once ratings exist, their plot assignments, blocks, timing application/offsets, reference types and default analysis threshold cannot be changed. The photo review slider can override that default per photo; each selected threshold is saved with its rating. Add new plots/timings for new events. Labels and missing application dates can be corrected.

## Measurement

Normalized ExG = (2G − R − B)/(R + G + B). Black pixels receive zero. Pixels strictly above each photo's selected threshold are counted as green. Study threshold 0.10 is the default for new photos; the review slider is 0–0.60 in 0.01 increments. The binary mask shows counted green pixels in white and all other pixels in black. Overlay highlights counted pixels over the photo, leaving the background visible; Photo shows the original. Changing the display never changes the count. Crop drawing stays disabled until Block crop is selected. ExG is a color index, not a calibrated probability. Keep the same threshold across reference and treatment photos for comparable cover estimates; the default is exploratory and requires checking representative masks. Images are resized to a maximum edge of 1200 pixels. Excluded areas are removed from the denominator. Rectangle and brush overlaps are counted once. Brush masks are saved as lossless run-length pairs in brushRuns, included in JSON backups and CSV. Up to 25 editor operations can be undone.

Only the selected baseline types are used; older studies default to both. Reference comparisons are isolated by **study, rating timing and block**. Multiple photos are averaged per reference plot, then reference plots are weighted equally.

- Untreated only: control = 100 × (1 − treatment cover / untreated cover).
- Both references: control = 100 × (untreated cover − treatment cover)/(untreated cover − weed-free cover).
- Weed-free only: cover difference in percentage points is reported; percentage control requires an untreated reference.

Reference span ≤0.1 percentage point is rejected. Displayed control is clamped to 0–100%; CSV also includes unclamped per-photo control, plot mean cover/control, manual ratings, references, plot assignment, application/timing metadata, exclusions and randomization notes. Treatment ratings update when reference measurements are added/deleted.

ExG also detects green crops. Exclude crop plants in every photo. Use comparable ground area, height, lighting, crop stage and date. Occluded, yellow or dead weeds and shadows can bias estimates. These are experimental **visible green-cover reduction estimates**, not validated visual weed-control or herbicide-injury ratings. Validate against manual masks and field ratings before research use.

## Storage and compatibility

The existing `plotcover-v1` IndexedDB is upgraded to version 2, retaining the original `trials` and `photos` stores. New studies and ratings use separate stores. Earlier measurements can be exported from the home page's Data section; they are not automatically assigned to a study or rating timing.

Download backup exports studies, ratings, photos and earlier records as JSON. Restore merges this backup into local storage; matching IDs are replaced after confirmation. CSV exports omit photo bytes. Clearing browser data removes local records; browsers may evict storage. No automatic sync between people/devices is implemented.

The application shell and local analysis work offline after a successful online load. All assets use relative URLs for GitHub Pages subpaths. Page entry transitions slide from right to left over 0.8 seconds; reduced-motion preferences disable animation.

## Run and deploy

Node.js 22+: `npm start` (port 3000 or PORT). No dependencies or installation step required. `npm test` checks analysis, reference isolation, plot generation, dates, validation and the HTTP server. `npm run build` copies the static app into dist.

GitHub Pages: the workflow tests/builds/deploys dist on pushes to main. Repository Settings → Pages → Source must be GitHub Actions. Railway: connect this repository; `railway.json` starts `npm start` with a health check.

PWA installation requires HTTPS. On iPhone: Safari → Share → Add to Home Screen. On Android: browser → Install app.

Reference: Woebbecke et al. (1995), Color indices for weed identification under various soil, residue, and lighting conditions, https://doi.org/10.13031/2013.27838.
