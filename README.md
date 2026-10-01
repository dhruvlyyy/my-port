# Dhruv Mehta — Care & Intelligence

An ivory and burgundy portfolio with a locally bundled Three.js scene. The stethoscope and robotic hand are custom Blender-authored GLB assets with curved tubing, a turned steel chestpiece, ceramic finger armour, bearing assemblies, tendons, palm plates, and wrist hardware. The former browser-generated primitives are replaced by consolidated meshes.

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
- Model loading, studio lighting and rendering: `scene.js`.
- Camera framing and chapter transitions: `camera-path.js`.
- Sculpture viewport and mobile layout: `experience.css`.
- Blender-exported geometry: `assets/models/`.
- Three.js r170 is bundled in `vendor/` under its MIT license, so the 3D journey does not rely on an external CDN.

The project panels are custom visual representations of the apps, not embedded live app screens. Their links point to the apps from the original portfolio.

## Before publishing

Review the three existing articles, two existing apps, medicine/student description, Medium, Instagram, GitHub, and email in the follow-up content pass. No new professional credentials or project achievements have been added.

Native scrolling, keyboard navigation, selectable app tabs, chapter shortcuts, and `prefers-reduced-motion` are supported. The Motion control disables camera interpolation. The camera travels between product views with reading pauses; it no longer dives into the tubing. A rendered preview of the actual model and all semantic content remain available while models load or when WebGL is unsupported. The mobile app section gives the hand its own space alongside the heading.

The GLB assets were parsed with the production loader and their projected bounds checked against desktop and mobile camera views. Blender renders were inspected. Browser execution remains blocked by the execution sandbox's local socket restriction, so the complete browser interaction check has not been run.
