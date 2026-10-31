# NOCTIS — The Only Light in the World

A premium, minimal, single-page scrollytelling website for **NOCTIS**, a fictional electric hypercar and grand tourer brand.

> *Mood: A city in total blackout at night where the car's light is the only light in the world. Quiet, expensive, precise: huge empty space, few words, perfect motion.*

---

## Architecture & Technology

- **Pure Vanilla Web Stack**: Built with standard HTML5, CSS3, and modern vanilla JavaScript (`index.html`, `styles.css`, `main.js`, `config.js`). Zero frameworks, zero external libraries, zero build steps.
- **Dual `<canvas>` Scroll Scrubbing**:
  - **Hero Sequence (596 frames)**: Continuous multi-clip camera track through a blackout metropolis with synchronized HUD telemetry.
  - **Dismantle Sequence (198 frames)**: 3D exploded technical view revealing the structural solid-state energy pack and dual axial flux motors.
- **Responsive Frame Delivery**:
  - Desktop: 1600 &times; 900 WebP (Quality 78)
  - Mobile: 960 &times; 540 WebP (Quality 72)
- **Photorealistic Studio Lineup**: 5 bespoke vehicle profiles (**GT-E**, **S**, **X**, **R**, **ONE**) with 72% height axle datum alignment.
- **Native Web Audio API Synth**: Procedural electric motor sub-bass drone and atmospheric texture generated entirely in code without external audio files.

---

## Local Development

Run the site using any static local web server:

```bash
# Python 3
python -m http.server 8000

# or Node.js serve / npx
npx serve .
```

Open [http://localhost:8000](http://localhost:8000) in your browser.
