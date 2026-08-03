# Stage 06 — Keyboard Accessibility

**Git tag:** `stage-06`
**Status:** Complete, verified with real key presses

## What this stage established

The interaction no longer requires a mouse or a touchscreen. Tab to a cloud,
move it with the arrow keys, and both metrics update exactly as they do while
dragging.

## What was implemented

**Focusable clouds**
- `tabindex="0"` on every `.latent-cloud`, so Tab reaches all four in order.
- `role="button"` paired with `aria-roledescription="draggable latent cloud"`.
  ARIA has no role for a freely repositionable two-dimensional object, so the
  roledescription replaces the announced word "button" with something that
  describes what the thing actually is.
- `aria-label` naming the fish and its current position, refreshed whenever the
  cloud moves by either keyboard or pointer, so refocusing announces where it
  now sits.
- `aria-describedby` pointing at a visually hidden paragraph explaining the
  controls.
- The fish `<img>` inside each cloud had its `alt` emptied. The cloud already
  carries the accessible name, so a populated alt would only repeat it.

**Movement**
- Arrow keys move the focused cloud by `CONFIG.keyboard.step` (0.5% of world
  width). Holding Shift uses `largeStep` (2.5%), five times further.
- `preventDefault()` on handled keys, so the page does not scroll underneath.
- Keys that are not arrows are ignored entirely and left to the browser.
- Clamped to the world exactly as dragging is, so the whole circle stays inside
  the artwork.
- `moveCloudBy()` is shared logic, so keyboard and pointer movement cannot drift
  apart in behaviour.

**Vertical step scaling.** A percentage of height covers fewer pixels than the
same percentage of width on a 16:9 world, so the vertical step is multiplied by
the aspect ratio. Without it, Up and Down would move noticeably less far than
Left and Right. Measured: 7.198 px horizontally against 7.208 px vertically.

**Visible focus.** A white ring with a dark halo, drawn on the circular region
rather than the square parent so it follows the circle. The halo keeps it
readable against both the pale reef and the mid-blue ocean. Uses
`:focus-visible`, so it appears for keyboard users without ringing every mouse
click.

**Interface**
- A visible hint in the status panel: "Drag a cloud, or press Tab to select one
  and move it with the arrow keys." Sighted keyboard users benefit from this as
  much as screen reader users.
- The overlap readout no longer repeats instructions, since the hint line now
  carries them; it reports state only.

## Verified, not assumed

**Real key presses through the browser:**

| Check | Result |
|---|---|
| Tab reaches all four clouds, then wraps | orange, teal, blue, eel, orange |
| Four ArrowRight presses | 42% to 44%, exactly 4 x 0.5 |
| Vertical position unaffected by horizontal keys | y unchanged at 58% |
| `aria-label` updated after movement | "Position 44 percent across…" |
| Page did not scroll | scrollX and scrollY both 0 |
| Focus ring present | `:focus-visible` matched |

**Step arithmetic:**

| Check | Expected | Got |
|---|---|---|
| Plain horizontal step | 0.5 | 0.5 |
| Shift horizontal step | 2.5 | 2.5 |
| Shift-to-plain ratio | 5x | exactly 5x |
| Plain vertical step (scaled) | 0.8889 | 0.8889 |
| Shift vertical step (scaled) | -4.4444 | -4.4444 |
| Unhandled keys (Enter, "a") | ignored | ignored |

**Clamping.** Driving a cloud hard into each corner pinned its edge to the world
boundary at 0.00 px on all four sides.

**Metrics.** Reef Overlap changed under keyboard movement alone, confirming the
same update path as dragging.

**Snapshot** loads standalone with both HUD panels, all images, focusable clouds,
and working keyboard movement. No console errors.

## Two test-harness quirks, not code faults

Both cost real debugging time and are recorded so they are not re-investigated.

**Arrow keys appeared to do nothing.** The automation tool's `Right` produced a
keydown whose `key` property was an empty string. Instrumenting the handler
showed four trusted keydown events arriving with no key name at all. Using
`ArrowRight` worked immediately. The code was correct throughout.

**Shift appeared to be ignored.** The harness's modifier parameter did not reach
the key event; the log showed `shiftKey: false` on arrival. The large-step branch
was then verified by dispatching events with `shiftKey: true` explicitly, giving
exactly 2.5 against 0.5. So the Shift branch is proven by synthetic events rather
than by a real Shift press — worth confirming by hand.

An earlier apparent failure, where a cloud moved diagonally instead of right, was
the same stray real mouse input diagnosed in Stage 02, confirmed by a pointer
event counter reading zero once isolated.

## Known open items carried forward

- **Please try Shift plus an arrow key yourself.** It is the one behaviour the
  harness could not exercise directly.
- Stage 07 adds the fish float animation and reduced-motion support. The
  animation must move only the fish image, never the cloud or its region, or it
  would shift the measured centre and make both metrics jitter.
- Pressing D still toggles the reef debug outline. Harmless, but it is a global
  key and a visitor could hit it by accident.
- `assets/Background-Latent-Ocean.png` remains a duplicate, pending a decision.
- Phone portrait remains cramped; the rotate hint is still deliberately absent.

## How to view this stage

Open `index.html` in this folder, press Tab, then use the arrow keys. Hold Shift
to move further. Or run `git checkout stage-06` from the project root.
