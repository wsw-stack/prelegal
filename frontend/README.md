# prelegal frontend

Prototype Mutual NDA creator (Jira PL-3). Fill in the cover page details in a form, watch the agreement update as you type, and download it as a PDF.

## Running

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # unit tests (Vitest)
npm run build   # production build
```

Run these commands from this `frontend/` directory. The legal text is read at build time from `../templates/mutual-nda.md`, the shared template dataset (see `templates/README.md`).

## How it fits together

- `app/page.tsx` loads and parses the Standard Terms on the server (`lib/nda/loadStandardTerms.ts`) and passes them to the client.
- `components/NdaBuilder.tsx` holds the form state and renders `NdaForm` beside `NdaPreview`.
- `lib/nda/coverPage.ts` turns the form data into cover page content. Blank fields become highlighted `[placeholders]`.
- `components/NdaPdf.tsx` renders the same content with `@react-pdf/renderer`. It loads only when you click **Download PDF**.

The templates come from [Common Paper](https://commonpaper.com/standards/mutual-nda/1.0) and are used under CC BY 4.0. Every generated document includes the required attribution.
