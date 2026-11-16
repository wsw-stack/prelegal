# prelegal frontend

Mutual NDA creator (Jira PL-3, PL-5). Chat with an AI assistant to fill in the cover page details, watch the agreement update as you go, and download it as a PDF.

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
- `components/NdaBuilder.tsx` holds the document state and renders `ChatPanel` beside `NdaPreview`.
- `components/ChatPanel.tsx` is the chat. Each message goes through `lib/chat/api.ts` to the backend's `POST /api/chat`, which replies with the assistant's answer and the full updated fields. The chat needs the FastAPI backend on the same origin, so run the app with the Docker start scripts (`npm run dev` alone has no `/api`).
- `lib/nda/coverPage.ts` turns the document data into cover page content. Blank fields become highlighted `[placeholders]`.
- `components/NdaPdf.tsx` renders the same content with `@react-pdf/renderer`. It loads only when you click **Download PDF**.

The templates come from [Common Paper](https://commonpaper.com/standards/mutual-nda/1.0) and are used under CC BY 4.0. Every generated document includes the required attribution.
