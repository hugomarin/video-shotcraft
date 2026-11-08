# A shared language for editable product films

The canonical artifact is Shotcraft `ProjectData` JSON, with `productFilm: {version: 1, projection: "css-parallel", coordinateSpace: "composition-pixels"}`. Proposals, editor changes and exports consume this same project and the same native card implementations. Do not recreate the visual intent in a second TSX implementation.

V1 adds three native cards and reuses `audio-clip`:

| Card | Meaning | Editable controls |
| --- | --- | --- |
| `product-film-plane-v1` | Cropped image/video with parallel projection | Pitch, yaw, roll, anchor, source center, initial/final scale, vertical travel, edge softness, fade |
| `product-film-caption-v1` | Horizontal editorial text | Text, position, typography, entry/exit frames |
| `product-film-fade-v1` | Continuous reading gradient | Color, stop positions, opacity |
| `audio-clip` | Existing native audio | Source path, trim, speed, volume |

Tracks use Shotcraft's existing order: first track is visually uppermost. Keep captions above gradient above shots. Audio occupies its own track. Native history, persistence, timeline and export remain in use.

## Exact semantics

- Clip `start`, `duration`, `inOffset` are project frames; `speed` is the source-time multiplier. These cards use realtime media timing. The media source begins at `inOffset`, and camera/text use `inOffset + localFrame * speed` without Freeze.
- Plane angles are degrees. The transform is, in this order, `translateY(travelY*smooth) rotateX(pitch) rotateY(yaw) rotateZ(roll) scale(scaleStart + smooth*(scaleEnd-scaleStart))`.
- `smooth = p*p*(3-2*p)`; `p` is clamped source frame divided by source duration minus one. Native clip duration/trim/speed determine source duration. Resizing a clip deliberately retimes its movement/fade, as in other duration-aware Shotcraft cards.
- Anchor is in composition pixels. Crop and source center are in source pixels **after** scaling the source to `sourceWidth`. The original image aspect ratio is preserved. Crop origin minus source center positions the crop relative to the anchor. Source display position inside the crop is minus crop origin.
- Plane fade starts at frame 0 and ends at source duration minus one. Caption exit margins use source duration. These different formulas preserve the approved prototype exactly.
- The gradient is independent of plane opacity. Background and gradient color are independent.
- V1 parallel projection does not translate into the optical Three.js card's camera units. No camera-distance conversion is performed. Optional neutral-default finishes and synthetic planar depth-of-field are available directly on the native plane card. Pitch/yaw/roll are constant per shot; scale and vertical travel animate. This does not add the optical card's “Fijar inicio/final” workflow to this renderer.
- V1 is not a general converter from arbitrary Remotion code, HTML or video. Unsupported contract versions/properties fail validation instead of being guessed. A new visual primitive needs an explicit supported card or a declared migration and visual comparison.

## Workflow for people and agents

1. Produce or edit native JSON. Obtain supported fields/defaults with `node workbench/scripts/product-film.mjs catalog`.
2. Validate: `node workbench/scripts/product-film.mjs validate INPUT.json`.
3. Freeze all defaults into the document: `node workbench/scripts/product-film.mjs snapshot INPUT.json OUTPUT.json`. The source is unchanged; existing outputs are not overwritten.
4. Import the JSON using Shotcraft's Import button. Select a shot to change inclination/scale; select the caption or music clip to edit it. Export JSON returns the same editable representation.
5. Bundle media: `node workbench/scripts/product-film.mjs pack INPUT.json OUTPUT_DIR`. It copies relative media from workbench/public, adds the native project and asset SHA-256 manifest. V1 pack accepts only these three cards plus audio-clip; it rejects other cards rather than silently omitting dependencies.
6. In a compatible clone, copy the bundle's public contents into workbench/public and import project.json. Render with the usual Main composition; `renderExact: true` excludes the editor's one-second preview tail.

The portable synthetic fixture is `workbench/examples/product-film.json`. From workbench:

```sh
npm run build
npm run test:platform
npm run test:product
npx remotion render src/remotion/index.ts Main exports/product-film.mp4 --props=examples/product-film.json --codec=h264
```

## Private 32-second transfer validation

The real footage and music remain in ignored local exports/imports. The approved composition was transcribed once into native parameters. An untouched reference source was preserved for comparison. All 15 sampled PNG frames (0, 15, 160, 305, 320, 321, 336, 523, 710, 725, 726, 741, 843, 944, 959) matched pixel-for-pixel. This is sampled parity, not proof of every frame.

The full native MP4 was rendered and decoded; decoded audio SHA-256 matched the original MP4. In the editor, pitch was changed from 12 to 12.5, undone to 12, redone to 12.5 and restored to 12; reload retained the project and restored pitch. The local Remotion preview now reads the same native JSON and MainComposition. Shared authoring no longer requires maintaining two render implementations.

Validation also passed the production build, five platform tests and 23 product tests (including five new film-contract/package tests). Six-second synthetic light and dark MP4s were rendered and frames 0, 30, 90, 150 and 179 inspected. The build retains the existing bundle-size warning. No new preset implementation is introduced in this change.


## Planar focus and appearance

The plane card now exposes focus/appearance without converting or replacing existing geometry. `aperture` is an artistic blur strength in source-display pixels, not an f-stop. `focusU`/`focusV` locate the sharp point within the crop (0–1); `focusWidth` defines the sharp band. The depth direction comes from the Z row of the exact CSS Rx/Ry/Rz rotation. A masked backdrop blur blends away from that band; its strength depends on tilt and vanishes on a front-facing plane. This is a synthetic depth-of-field approximation on a single flat plane, not a physical lens, recovered semantic layers or the optical shader's sampling algorithm. It uses one synchronized media element and leaves editorial text untouched.

Appearance: exposure, shadow, reflection, deterministic grain and corner radius. Background: independent color plus light amount/position. Finish: independent fade color, bottom fade and vignette. The separate editorial reading-gradient track remains independently editable; it may cover the background at the bottom of the composition. `effectsEnabled` bypasses focus and finishes while retaining the chosen background color. Defaults are neutral, so existing projects and user camera edits need no migration or reimport.

Verification: build, 25 product tests, five platform tests; all 15 sampled legacy frames remain pixel-identical with neutral defaults. A real-video seek segment (frames 480–539) renders 60 video frames with audio. Light and dark synthetic six-second MP4s were inspected at start, middle and end. In an isolated editor session, blur changed 0→16.5, undo restored 0, redo and reload retained 16.5. No user project was replaced during this verification.

With nonzero effects bypassed, frame 523 also matches the original exactly under the same CLI render configuration. Comparisons across different renderer configurations are not used as parity evidence.

Máscaras recuperadas: `maskMode` admite `"0"` (ninguna, predeterminado), `"1"` (elíptica) y `"2"` (vertical). `maskSize` y `maskSoft` son porcentajes 0–100, con defaults 65 y 35. Actúan sobre el recorte y sus acabados, sin enmascarar el texto editorial de otra pista. `effectsEnabled:false` las desactiva. Son alpha CSS, no equivalencia del shader óptico. “Igualar al fondo” copia `backgroundColor` a `fadeColor` una vez; después ambos siguen independientes. El degradado de lectura permanece en su pista y se edita por separado.

`cameraModel`: `legacy` (default, original CSS Rx Ry Rz) or `prototype` (CSS Ry(yaw) Rx(-pitch) Rz(roll)). The latter matches the prototype's Y-up Ry Rx orientation after converting to CSS Y-down coordinates. Focus depth uses the same orientation. This changes rotation behavior, not projection: the film remains parallel, without adopting the original Three.js perspective lens or its exposure/blur units. Existing JSON without the field remains unchanged.
