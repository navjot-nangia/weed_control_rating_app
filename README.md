# PlotCover — weed control rating PWA

Phone-first, no-login, on-device RGB photo analysis for weed plots. Capture or upload photos, select a rectangular region, exclude rectangular crop areas, review a normalized ExG mask, save measurements in IndexedDB, and export CSV. Separate trials, fixed thresholds within trials, multiple reference photos, replicate metadata, and per-plot means are supported. No photo uploads or external services.

## Run and deploy

Node.js 22+: `npm start` (port 3000 or Railway's PORT). No runtime dependencies or build step. Connect this repository to Railway and use `npm start`; railway.json includes a health check. Deployment must use HTTPS for PWA installation and offline support. `npm run build` copies the static app to dist for an optional static host. `npm test` verifies analysis and HTTP serving.

On iPhone, open the HTTPS URL in Safari → Share → Add to Home Screen. On Android, use Install app. After the first online load and service-worker installation, the shell and local photo processing work offline. Browser storage is device-specific and may be evicted; clearing it removes records. CSV does not include photos. Originals are not retained: saved JPEGs have a maximum edge of 1200 pixels.

## Measurement protocol

Photograph comparable ground areas, top down, at consistent height, orientation, lighting, crop stage, and date. Choose a fixed threshold after checking representative masks. The initial 0.10 threshold is exploratory and requires field validation. Exclude crop plants on **every** photo, including references, or select an inter-row area. Confirm that the measured region is weed-only before saving. Excluded pixels are removed from the denominator. Inter-row cover is not whole-plot cover and ignores weeds hidden by cotton. Brown or yellow weeds and shadows can bias estimates. ExG does not identify weed species, distinguish cotton from weeds, or measure herbicide injury.

Normalized ExG = (2G − R − B)/(R + G + B); black pixels receive zero. Green cover is the fraction of included pixels with ExG strictly above the trial threshold. Reference cover is the arithmetic mean of reference-photo cover percentages. Repeated treatment photos are averaged by plot ID, treatment, and replicate. Settings are fixed per trial; create another trial for a different threshold.

* Untreated reference only: 100 × (1 − treatment cover / untreated cover).
* Untreated and weed-free references: 100 × (untreated cover − treatment cover)/(untreated cover − weed-free cover).
* Weed-free reference only: cover and excess cover in percentage points; control is unavailable.

A reference span ≤0.1 percentage point is rejected. UI ratings are clamped to 0–100%; CSV also retains the unclamped result. References added or deleted update ratings, while stored cover measurements remain unchanged. These are experimental **visible green-cover reduction estimates**, not validated visual weed-control or herbicide-efficacy ratings. Validate against manual weed masks and field ratings before research use.

References: Woebbecke et al. (1995), Color indices for weed identification under various soil, residue, and lighting conditions, https://doi.org/10.13031/2013.27838. PWA documentation: https://web.dev/learn/pwa/.
