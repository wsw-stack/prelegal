# prelegal frontend

Prototype Mutual NDA creator (Jira PL-3). Fill in the cover page details in a form, watch the agreement update as you type, and download it as a PDF.

## Running

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # unit and component tests (Vitest + Testing Library)
npm run build   # production build
```

The legal text is bundled at build time from `../templates/mutual-nda.md`, the shared template dataset (see `templates/README.md`). For that, `next.config.ts` sets the Turbopack root to the repo root and adds a rule that imports `*.md?raw` files as strings.

## How it fits together

- `app/page.tsx` passes the parsed Standard Terms (`lib/nda/template.ts`) to the client. The page is fully static.
- `components/NdaBuilder.tsx` holds the form state and renders `NdaForm` beside `NdaPreview`.
- `lib/nda/coverPage.ts` turns the form data into cover page content. Blank fields become highlighted `[placeholders]`.
- `components/NdaPdf.tsx` renders the same content with `@react-pdf/renderer`. It loads only when you click **Download PDF**.

The templates come from [Common Paper](https://commonpaper.com/standards/mutual-nda/1.0) and are used under CC BY 4.0. Every generated document includes the required attribution.
