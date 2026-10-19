# Study Resource Platform client

The client is a React single-page app built with Vite and styled with Tailwind
CSS.

## Getting started

From this folder, install dependencies and start the development server:

```sh
npm install
npm run dev
```

Vite prints the local URL in the terminal and refreshes the page as you edit
files.

## Styling

Tailwind CSS is integrated through `@tailwindcss/vite` in `vite.config.js`.
`src/index.css` imports Tailwind, and components use utility classes in their
`className` attributes. For example, change the padding or background on the
main element in `src/App.jsx` with classes such as `p-8` or `bg-slate-100`.

## Other commands

- `npm run build` creates the production build in `dist/`.
- `npm run preview` serves the production build locally.
- `npm run lint` runs Oxlint.
