# Personal Life OS — Design System

A guide to how the interface is built, why each decision was made, and how to change it safely. Read it top to bottom once; afterwards use the tables as a reference.

---

## 1. Principles

1. **Structure first, color second.** Every screen has the same anatomy (breadcrumb → title row → stats → filters → table). Users learn one page and know them all.
2. **One source of truth for color.** Colors live only in `frontend/src/index.css`. Components use Tailwind classes such as `bg-surface` or `text-title`, never hex codes. That is why one change (dark mode, a brand palette, Ramadan) recolors the whole app.
3. **Clear borders.** Every container (card, table, input, dialog) has a visible 1px outline. Sections are separated by borders and light gray bands, not by guesswork.
4. **Color means something.** Screens stay in the brand blue and neutral grays; red is reserved for things that need attention (overdue, negative balance, errors).
5. **Calm interaction.** Hover and focus only change color, over 0.15s. Nothing jumps or resizes.
6. **Bilingual by default.** Every layout works left-to-right (English) and right-to-left (Arabic). Use logical utilities (`ms-`, `pe-`, `start-`, `border-s`) instead of `ml-`/`right-`.

---

## 2. Design tokens

Tokens are CSS variables (`--c-*`) exposed to Tailwind as colors in the `@theme inline` block. Light values are on `:root`, dark values on `.dark`.

### Surfaces and lines

| Tailwind class | Light | Use |
|---|---|---|
| `bg-page` | `#ffffff` | Page background |
| `bg-surface` | `#fefefe` | Cards, inputs, dialogs |
| `bg-band` | `#f8f8f8` | Card header bands, breadcrumb strip, zebra rows |
| `bg-table-head` | `#f2faff` | Table header row |
| `bg-hover` | `#e9f4fb` | Row hover, menu hover, active sidebar item |
| `border-line` | `#e5e5e6` | Outline of every card, table and panel |
| `border-line-soft` | `#f2f2f2` | Column dividers inside tables |
| `border-input-line` | `#165783` | Outline of inputs, selects and outlined buttons |

### Text

| Class | Light | Use |
|---|---|---|
| `text-title` | `#165783` | Page titles, labels, table text, links |
| `text-heading` | `#051520` | Strong text that isn't a title |
| `text-body` | `#0a0a0a` | Paragraphs |
| `text-muted` | `#656567` | Hints, secondary info, placeholders |
| `text-accent` | `#fd7a41` | Card/section titles |

### Brand and status

| Class | Light | Use |
|---|---|---|
| `bg-primary` | `#1d75af` | Primary buttons |
| `bg-primary-dark` | `#165783` | Active segment, current page, stat icons |
| `bg-primary-soft` | `#e9f4fb` | Selected/soft backgrounds |
| `success` / `-soft` / `-line` | `#3f8d6b` | Paid, completed, income |
| `warning` / `-soft` / `-line` | `#f5682b` | Pending, medium priority |
| `danger` / `-soft` / `-line` | `#ba1212` | Overdue, delete, expenses |
| `info` / `-soft` / `-line` | brand blue | Neutral information |

> **Rule:** if you catch yourself typing `#` inside a `.tsx` file, add a token instead. (The only exceptions are chart attributes in Recharts, which use `var(--c-*)`, and the brand swatch previews.)

---

## 3. Typography, sizes and shapes

Sizes match the reference enterprise UI (measured on it).

| Item | Value | Where it's defined |
|---|---|---|
| Font | **Cairo** (Latin + Arabic), body 16px | `index.html` (Google Fonts) and `--font-sans` |
| Top bar / breadcrumb strip | 64px / 40px (13px text) | `MainLayout`, `PageHeader` |
| Page title | 18px medium, `text-title` | `PageHeader` |
| Card / section / dialog title | 16px bold, `text-accent` | `Card`, `FormSection`, `Modal` |
| Sidebar | 278px (80px collapsed); items 51px, 18px medium, 20px icon | `MainLayout` |
| Buttons | 52px tall (`md`), 40px (`sm`); 16px; 24px icon; 12px corners | `Button` |
| Row details icons | "i" 20px then eye 24px (Material-style outlines), under a "Details" header | `PreviewTip`, `IconButton tone="strong"` |
| Table | 52px rows; 14px text (header bold, cells semibold); 8px side padding | `DataTable` |
| Status badge | 26px tall, 14px semibold, 4px corners, colored dot | `Badge` |
| Form label | 14px semibold, `text-title` | base styles |
| Inputs / selects | 52px tall, 13px semibold text, 8px corners | base styles, `AppSelect` |
| Filter panel | 352px wide, 384px field area | `FilterPanel` |
| Scrollbars | 3px hairline everywhere; in the filter panel, dropdown lists, sidebar and dialogs they use the brand colors (`.brand-scroll`: pale-blue track, dark-blue thumb) | `index.css` |
| Pagination | 32px buttons, 13px semibold | `Pagination` |
| Motion | colors 0.15s; filter tab grows on load 0.7s; filter slide 1.2s `ease-slide`; page blocks fade up 0.6s staggered (title row excluded) | components, `index.css` |

---

## 4. Page anatomy

```
┌ Sidebar ─────┬ Top bar: menu · language · theme · user ───────────────┐
│ Logo         ├ Breadcrumb strip (bg-band, full width) ────────────────┤
│ Main menu    │ Title (text-title)                  [Primary action]  │
│  • Dashboard │ Stat boxes (StatBox ×3–4)                              │
│  • Tasks     │ ┌ Filters card ─────────────────────────────────────┐ │
│  • …         │ │ Search · Segmented filters · Date range           │ │
│              │ └───────────────────────────────────────────────────┘ │
│              │ ┌ Table (rounded, bordered) ─────────────────────────┐ │
│              │ │ pale-blue header · zebra rows · hover · actions   │ │
│              │ │                Pagination (centered)              │ │
│              │ └───────────────────────────────────────────────────┘ │
│              ├ Footer: copyright | Designed & built by … ─────────────┤
└──────────────┴────────────────────────────────────────────────────────┘
```

To build a new list page, copy `BillsPage.tsx` and change the data — the structure is already right.

### New and details pages

Adding or opening a record goes to its own page, never a popup (only the receipt delete confirmation is a dialog):

```
Breadcrumb:  [icon] Bills  »  [edit] Bill details      (parent is a link)
Title row:   (‹) Bill details                          (round back button, line underneath)
Status:      [ Pending  ⌄ ]  Created on …              (details only; menu: "Mark as paid → • Paid")
┌ Bill information (gray band, orange title) ────────────────┐
│ Name                       Amount                          │
└────────────────────────────────────────────────────────────┘
┌ Due date & reminder ───────────────────────────────────────┐
│ Due date                   Reminder                        │
└────────────────────────────────────────────────────────────┘
                          [🗑 Delete] [⊗ Cancel] [✓ Save changes]
```

- Routes: `/bills/new` creates, `/bills/:id` shows the record, editable. Saving, cancelling or deleting returns to the list.
- The status button is filled with the status color (green done/paid, orange pending, red overdue) and opens a menu of the allowed changes (`StatusMenu`).
- Delete lives only on the details page, beside Cancel/Save (red outline). Tasks, bills, transactions and journal entries delete with **Undo** (`useUndoableDelete`): the row disappears at once and a neutral toast names it with Undo for 6s; the API delete is sent only when that toast closes, and a failure brings the row back with a red toast. Receipts confirm first (pass `confirmDelete`), because their image file is removed for good.
- List rows have two clear 22px outline icons: **eye** (open details) and **i** (hover preview of key fields).
- To build one, copy `BillFormPage.tsx`: `PageHeader` with `parent`, then `DetailBar` + `StatusMenu`, one `FormSection` per group of fields, and `FormPageActions` (pass `onDelete` on details pages) from `components/ui/FormPage.tsx`. A wrong id shows `RecordNotFound`.

---

## 5. Components (`frontend/src/components/ui`)

| Component | Use it for | Notes |
|---|---|---|
| `PageHeader` | Top of every page | Breadcrumb strip + title + actions; pass an `icon`, and `parent` on sub-pages for "Parent » Title" and the back button |
| `Card` | Any panel | `title` gives the gray band with orange title; `padded={false}` for tables |
| `StatBox` | Key numbers (dashboard only) | Neutral card: label, large value, small brand-tinted icon; pass `alert` to turn it red when the value needs attention |
| `DataTable`, `Th`, `Tr`, `Td` | Lists | Hover, zebra and dividers are built in |
| `Button` | Actions | `primary`, `secondary`, `soft`, `white`, `danger`, `dangerOutline`, `success`; `icon`, `loading` |
| `IconButton` | Row actions | Plain icon, or `tone="strong"` (22px clear outline) for the row eye; always give a `label` (tooltip + screen reader) |
| `Badge` | Status | `success`, `warning`, `danger`, `info`, `neutral`; dot included |
| `SegmentedControl` | Mutually exclusive filters | Active option filled with `primary-dark` |
| `SearchInput`, `DateRangeFilter` | Filter bars | |
| `FormField` | Every form field | Links the label to the control; shows the error state |
| `FormSection`, `FormPageActions`, `DetailBar`, `StatusMenu`, `RecordNotFound` | New/details pages | See "New and details pages" above |
| `PreviewTip` | Row "i" icon | Hover/focus card with key fields; rendered in `<body>` so tables never clip it |
| `ConfirmDialog` (on `Modal`) | Delete confirmation | Escape closes, focus is trapped and restored |
| `AppSelect`, `AppDatePicker` | Pickers | Pop-ups render in `<body>` so cards/dialogs never clip them |
| `Alert` | Inline messages | Form errors: tinted banner, solid bar on the leading edge, icon |
| `ToastProvider` / `useToast` | Action results | Wide banner just under the top bar and breadcrumb (104px), aligned with the content edge, three-quarters of its width; message centred with its icon; slides down 140ms, stays 3.5s (paused on hover), leaves at once; click to dismiss. `neutral` tone + `action` for Undo; errors stay until × |
| `EmptyState` | No data / no results | Icon + title + hint + optional action |
| `Icon` | Every icon | Add new SVG paths to the map instead of inlining SVG |
| `Logo`, `BrandPicker` | Identity | See section 7 |

---

## 6. Interaction states

| Element | Rest | Hover | Focus / active |
|---|---|---|---|
| Primary button | `bg-primary` | 90% opacity | 2px outline in primary |
| Secondary button | white, dark-blue outline | `bg-hover` | outline |
| Sidebar item | text in brand color | `bg-hover` + soft shadow | active = `bg-hover` |
| Table row | white / zebra | `bg-hover` | — |
| Input | dark-blue outline | darker outline | primary outline + soft ring |
| Row action icon | plain | `bg-hover` (delete: red tint) | outline |

Disabled controls use 60% opacity and the "not-allowed" cursor (set globally).

---

## 7. Personal identity

These elements make the app *yours* rather than a generic template:

- **Logo** (`Logo.tsx`, `public/favicon.svg`): a classic seal — flat square, double frame, serif "PL" monogram with an orange rule; the name is set in uppercase serif. The tile follows the active brand color.
- **Brand palettes** (Profile → Appearance): *Ocean Blue* (default), *Navy*, *Teal*, *Graphite*, *Burgundy* — classic corporate hues. Each palette only swaps the brand hue; layout and status colors stay the same, so the app always looks consistent. The choice is saved per browser (`brand-v2` in localStorage).
- **Personal dashboard**: *Today's focus* lists overdue and due-today tasks plus the next bill.
- **Credit**: "Designed & built by …" in the footer and on the sign-in page. Change the name in `frontend/src/config/site.ts`.

### Adding a new brand palette

1. In `index.css`, add a `[data-brand="sunset"]` block and a `.dark[data-brand="sunset"]` block next to the existing ones (copy *teal* and change the hues).
2. Add `'sunset'` to `BRANDS` in `stores/brandStore.ts` and a swatch class in `BrandPicker.tsx`.
3. Add `profile.brands.sunset` to `en.json` and `ar.json`.

Tip for choosing hues: pick a primary that keeps white text readable (contrast ≥ 4.5:1), a darker shade for titles and table headers, and a very light tint for hover.

---

## 8. Behaviors worth knowing

### Sidebar collapse
- A 36px round toggle sits on the logo area's bottom border, straddling the sidebar edge.
- It is **hidden** (opacity 0, 95% scale) until the pointer is anywhere over the sidebar, then fades/scales in over 0.4s.
- Collapsed, the sidebar is 80px wide (icons only), the toggle stays visible, and hovering an icon shows a tooltip with its label.

### Filters
- Each list page has a **Filter tab** at the end of the toolbar, attached flush to the content edge. On page load it **slides open** (1.2s ease-out), gently pushing the action buttons aside.
- The tab shows how many filters are applied — "Filter (2)" turns blue when any are active.
- Clicking it opens a **side panel** beside the table (the table narrows instead of being covered). Fields edit a *draft*; **Search** applies it, **Clear filter** resets everything. Logic lives in `hooks/useFilters.ts`; UI in `components/ui/FilterPanel.tsx`.

### Validation
- Forms use `noValidate` and show errors inline instead of browser bubbles.
- An invalid field gets: a red "!" badge before the label, the label and message in `text-danger-text` (`#8b0e0e`), a red outline and red placeholder. Messages appear under the field ("Required", "Must be greater than 0", …).
- Errors appear after the first save attempt and update live as the user fixes them. Validators live in `utils/validation.ts`; pass `error` to `FormField` / `AuthField`.

## 9. Dark mode and RTL

- Dark mode swaps the same variables under `.dark` — never write `dark:` overrides for colors in components.
- Arabic switches `<html dir="rtl">`. Because components use logical properties (`ms-`, `pe-`, `start-`, `border-s`, `rounded-e-`) they mirror automatically. Directional icons (chevrons) use `rtl:rotate-180`.

Before shipping UI changes, check four views: light, dark, English, Arabic.

---

## 10. Checklist for new UI

- [ ] Built from the components above, no new one-off markup
- [ ] Only Tailwind token classes, no hex colors or inline `style`
- [ ] Every text through `t()` with keys in both `en.json` and `ar.json`
- [ ] Hover/focus states visible; icon buttons have a `label`
- [ ] Looks right in light, dark, English and Arabic
- [ ] `npm run lint` and `npm run build` pass
