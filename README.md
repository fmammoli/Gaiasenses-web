This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Installing

Install dependencies:

```bash
npm install
# or
pnpm install
```

Then, create the enviornmental variables for OpenWeather API and MapBox API.
On your root folder, create the file `.env.local`:

```
OPEN_WEATHER_API_KEY= open weather API key
NEXT_PUBLIC_MAPBOX_API_ACCESS_TOKEN= MapBox API public access token
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## To add a p patch using pd4web

First compile the patch using pd4web pyhton cli
Then put the files on a subfolder inside /public
Change the following line in the pd4web.js:

```js
67 var PACKAGE_NAME = Module["packageName"];
81 REMOTE_PACKAGE_NAME = Module["packageName"];

626 var f = "/pd4web/pd4web.wasm";
627 // if (!isDataURI(f)) {
628 //   return locateFile(f);
629 // }

3655 .addModule("/pd4web/pd4web.aw.js")
```

I will try to automate this changes later.
