## AllyFix Source Mapping Setup

This guide shows how to emit `data-source-path` (and optional `data-source-line`) so AllyFix can map DOM → source files. The scanner already reads these attributes and will name patch files accordingly.

### Option A — React (Recommended)

Use the lightweight `SourceMarker` component included in this repo.

Import and wrap elements you want AllyFix to map:

```tsx
import { SourceMarker } from '@/sdk/source-mapper';

export function Hero() {
  return (
    <SourceMarker as="img" sourcePath="src/components/Hero.tsx" sourceLine={42} alt="Decorative" />
  );
}
```

You can wrap any tag using `as` and pass through normal props/children:

```tsx
<SourceMarker as="button" sourcePath="src/components/CTA.tsx" sourceLine={17} className="btn">
  Sign up
</SourceMarker>
```

### Option B — Manual attributes (any framework)

If you can’t or don’t want to use React, add attributes yourself:

```html
<img data-source-path="src/pages/index.html" data-source-line="88" alt="Product" />
```

### FAQ

- What path should I use?
  - Prefer repository-relative paths (e.g., `src/components/...`). These will become patch filenames.

- Do I have to include `data-source-line`?
  - Optional. It is stored and may be used by future previews, but patching relies mostly on path and context.

- Will this break anything in production?
  - No. These are inert data attributes. You can gate them behind `process.env.NODE_ENV !== 'production'` if desired.

### Next steps

After you add markers, run a scan again. The Apply Locally archive will include patch files under paths derived from `data-source-path`.


