# Dhruv Mehta — Care & Intelligence

An ivory and burgundy portfolio with a locally bundled Three.js scene. All model parts are procedural 3D geometry: connected stethoscope tubing, metal binaural arms, a turned chestpiece, and a robotic hand with articulated fingers, joints, wrist, and armour.

## Preview

Serve this directory over HTTP, for example:

```sh
python3 -m http.server 4173
```

Open http://localhost:4173. ES modules need an HTTP server; opening index.html directly is insufficient.

## Hosting

This is a static site with no package installation, build command, API key, or runtime service. `netlify.toml` sets the publish directory to the repository root (`.`). The owner authorized immediate publication through the existing GitHub-to-Netlify connection, with content and visual corrections to follow.

## Editing

- Article URLs, app URLs, descriptions, and contact links: `index.html`.
- Palette, typography, layout, mobile styling: `style.css`.
- App tabs, chapter progress, reduced motion: `script.js`.
- Models, lighting, scroll camera, tube travel: `scene.js`.
- Three.js r170 is bundled in `vendor/` under its MIT license, so the 3D journey does not rely on an external CDN.

The project panels are custom visual representations of the apps, not embedded live app screens. Their links point to the apps from the original portfolio.

## Before publishing

Review the three existing articles, two existing apps, medicine/student description, Medium, Instagram, GitHub, and email in the follow-up content pass. No new professional credentials or project achievements have been added.

Native scrolling, keyboard navigation, selectable app tabs, chapter shortcuts, and `prefers-reduced-motion` are supported. The Motion control disables the animated camera path. A local SVG sculpture and all semantic content remain available when WebGL is unsupported.
