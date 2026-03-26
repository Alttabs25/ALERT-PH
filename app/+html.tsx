import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

/**
 * This file is web-only and used to configure the root HTML for every
 * web page during static rendering.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* This link injects the Ionicons CSS directly from a CDN.
          It solves the "missing icon" bug on Firebase Hosting by 
          ensuring the browser can always find the font files. 
        */}

        {/* Disable body scrolling on web to make it feel more like a native app.
          This is optional but recommended for mobile-first web apps.
        */}
        <ScrollViewStyleReset />

        <style dangerouslySetInnerHTML={{ __html: ionicStyles }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const ionicStyles = `
body {
  background-color: #000;
}
`;