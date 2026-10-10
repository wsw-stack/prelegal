# Legal document templates

The base agreements prelegal starts from when it drafts a document for a user.

## Contents

- `*.md`: the agreement text, in Markdown, unchanged from the source.
- `catalog.json`: one entry per agreement, with an `id`, `name`, `description`, `version`, the Markdown `files` that make it up, and links to the published standard and source repo.

| Template | Version |
| --- | --- |
| Mutual Non-Disclosure Agreement (cover page + standard terms) | 1.0 |
| Cloud Service Agreement | 3.0 |
| Service Level Agreement | 2.0 |
| Data Processing Agreement | 1.0 |
| Design Partner Agreement | 1.0 |
| Professional Services Agreement | 1.0 |
| Partnership Agreement | 1.0 |
| Business Associate Agreement | 1.0 |
| Software License Agreement | 1.1 |
| Pilot Agreement | 1.1 |
| AI Addendum | 1.0 |

## How the templates are customized

Each agreement is a set of standard terms that point to **variables**: terms the parties agree on, such as `Governing Law`, `Effective Date` or `General Cap Amount`. A variable appears in the text as a span:

```html
<span class="coverpage_link">Governing Law</span>
```

The class tells you where the value is set (`coverpage_link`, `keyterms_link`, `orderform_link` or `businessterms_link`). For each template, `catalog.json` lists its variables in `variables`, with possessives and plurals folded into one name (`Customer's` is listed as `Customer`). Bracketed text in the Mutual NDA cover page, such as `[Fill in state]`, marks a value the user should fill in.

## Source and license

All templates come from [Common Paper](https://commonpaper.com/standards/) ([GitHub](https://github.com/CommonPaper)) and are used under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Documents generated from them must keep the Common Paper attribution and note any changes.
