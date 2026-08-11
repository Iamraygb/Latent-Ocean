# Stage 10E — Reveal Mode, Step 5: Two Training Pressures

**Git tag:** `stage-10e`
**Status:** Complete. All 40 automated acceptance checks pass. Genuine-input
checks are listed separately and are **not** claimed as passing.

Only the two-pressure structure. No reconstruction calculation, no sampling, no
decoder, no total training cost, no Step 6.

## The conceptual objective shown

```
RECONSTRUCTION COST  +  beta x PRIOR MISMATCH
```

and, in the collapsed disclosure:

```
J_beta(x) = -E_q_phi(z|x)[ln p_theta(x|z)] + beta D_KL( q_phi(z|x) || p(z) )
```

Loss-minimization convention: the minus sign sits inside the reconstruction term
as a negative log-likelihood, and the KL term is added. Verified in the rendered
text.

## Reconstruction cost is NOT calculated

**No decoder, likelihood, sampling, reconstructed image or reconstruction-cost
state exists anywhere in this project.** The only matches for those words are
code comments stating they are absent. The fish are static PNGs rendered as
`<img>`; nothing encodes or decodes them, so `-E[ln p_theta(x|z)]` is not
derivable from anything present.

The reconstruction card therefore shows the words **"Not calculated yet"** in a
dashed outline, never a number, never `0`, never `N/A`, never a percentage. It
is styled deliberately unlike the live value opposite it so it cannot be
mistaken for a result.

**No numerical total training cost is displayed anywhere.**

Nothing was substituted for reconstruction cost — not Configuration Score, not
Neighbour Compatibility, not Reef Overlap, not pixel comparison, not an invented
accuracy.

## Canonical sources

| Value | Source |
|---|---|
| Beta | `getReefPenaltyBeta()` reading the one `input[type="range"]` |
| Raw KL | `calculateKLComponents(mu, sigma).total` |
| Weighted prior mismatch | `calculateWeightedPriorMismatch(beta, kl.total)` |

Step 5 writes its value from **the same result object Step 4 uses**, inside one
`updateExplainer()` pass — the two cannot diverge. Verified: Step 4 read `0.272`
and Step 5 read `0.272` for the same state, and the displayed `1.957` matched the
full-precision `1.9565014402`.

**Configuration Score is not used in the objective**, and remains functional and
separate: it moved 70% to 44% under a Beta change while the weighted term
responded independently.

## The nats explanation

One `<details id="nat-disclosure">` in the panel's **shared area**, below the
step bodies and above the live region, revealed from Step 3 onward via
`body.reveal-shows-nats`. One element, one id, one disclosure state, available in
Steps 3, 4 and 5 with no duplication.

**Independence** is structural: it is a different element from
`#kl-equation-disclosure` and `#objective-disclosure`, and no `name` attribute is
used, so `<details>` elements share no state.

`aria-expanded` is mirrored onto its `<summary>` through one `toggle` listener,
because native `<details>` does not expose that attribute. Verified cycling
`false` to `true` to `false`.

**The three older disclosures were deliberately left on native semantics** rather
than retrofitted, to avoid touching completed baselines. Say the word if you want
them unified.

## Files changed

`index.html`, `style.css`, `app.js`.

## Reused unchanged

`getReefPenaltyBeta()`, the slider's single `input` listener,
`calculateWeightedPriorMismatch()`, `calculateKLComponents()`,
`calculatePosteriorParameters()`, `updateDistanceLine()`, `selectCloud()`, the
drag threshold, all four metrics. `updateExplainer()`, `goToStep()` and
`announcePosterior()` were extended.

## Added

`STEP_LABELS[5]`, `STEP_HEADINGS[5]`, `body.reveal-step-5`,
`body.reveal-shows-nats`, the Step 5 panel, the two pressure cards, the objective
structure block, `#step-5-weighted`, the nats disclosure, and two nav controls.

## Acceptance checks — all 40 automated and passing

Selected evidence:

| # | Result |
|---|---|
| 1-7 | Opens at Step 1; teal fish and Beta 0.73 both held across every step; focus lands on each step's own heading |
| 8-11 | Two distinct pressure cards; both descriptions present; objective shown as reconstruction cost plus Beta times prior mismatch |
| 12-13 | "The terms do not need to become equal" present; no scale, seesaw or equal-height bars used |
| 14-16 | "Not calculated yet" present; no fake value; no numeric total |
| 17-18 | Step 5 value identical to Step 4's; matches full precision, not Configuration Score |
| 19-22 | Beta changed the weighted term while mu, sigma, d, both components, raw KL, cloud box and reef geometry all held |
| 23-24 | Cloud move changed raw and weighted together; reconstruction status untouched |
| 25-26 | At Beta 0, weighted 0.000 with raw 1.96; at Beta 1, weighted 1.957 against raw 1.96 |
| 27 | Configuration Score 70% to 44%, functional and separate |
| 28-31 | Nat defined as a logarithmic-information unit tied to ln; explicitly not a percentage, probability or latent distance; Beta stated dimensionless; disclosure independent |
| 32-33 | Objective disclosure collapsed initially; sign convention correct |
| 34 | "It is not retraining an encoder or decoder" present |
| 35 | Twelve navigations then one `updateMetrics()` produced exactly one update; one live region; one range input |
| 36 | Every value identical across a 1440 to 1024 resize |
| 37-38 | Escape, focus return, keyboard movement, metrics, animation, D safeguard all intact |
| 39 | Panel height identical at 239px in Steps 4 and 5; Step 5 adds scroll length 716 to 876, not height; cloud coverage unchanged |
| 40 | Step 5 contains exactly one button, "Back: Beta Weight"; no Step 6 control exists |

## Genuine-input checks — NOT automated, NOT claimed

1. Real Beta-slider pointer input, including that the announcement fires once
   after settling rather than per event.
2. Real cloud click-versus-drag selection.
3. Touch interaction.
4. Keyboard-only navigation end to end.
5. Focus-indicator inspection on the two new controls.
6. Reduced-motion inspection.
7. Screen-reader reading of the objective and announcement cadence.

**Visual inspection was possible this time**, unlike Stage 10D: desktop at
1440x900 and narrow at 390x664 were both captured and reviewed. That is
screenshot review, not interaction testing.

## Deviation from my stated plan, recorded

I said I would apply Step 4's narrow-screen prose-hiding to Step 5. **I did not.**
Measurement showed it was unnecessary — panel height is unchanged, cloud
obstruction is unchanged, and navigation stays reachable by scrolling, which the
brief permits. Hiding the introduction would have cost comprehension for no
measured benefit.

## Known limitations

- **The deferred narrow-screen overlap remains**, unchanged and unresolved by
  design. The panel can cover part of a selected cloud depending on where it
  sits, and being interactive it blocks dragging there. Step 5 does not make this
  worse: panel height is identical to Step 4's.
- **All four clouds still share sigma 0.66**, so the spread component is constant.
- The word "balances" in the required heading sits alongside the requirement not
  to imply equality. The supplied clarifier is present and no equalising visual is
  used, but the tension originates in the copy.
- Internal identifiers remain `reef-penalty*` while the visible label is
  **Beta Weight beta**.

## How to view this stage

Open `index.html`, press **Reveal the Model**, and walk forward to **Next: Two
Pressures**. Move the Beta control and watch the prior term change while the
reconstruction card stays "Not calculated yet". Or run `git checkout stage-10e`.
