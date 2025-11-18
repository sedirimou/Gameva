import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head>
        {/* Suppress HMR overlay in development */}
        {process.env.NODE_ENV === 'development' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.__NEXT_HMR_OVERLAY_DISABLED = true;
                if (typeof window !== 'undefined') {
                  const originalConsoleWarn = console.warn;
                  console.warn = function(...args) {
                    const message = args[0];
                    if (typeof message === 'string' && (
                      message.includes('Invalid message') ||
                      message.includes('isrManifest') ||
                      message.includes('handleStaticIndicator') ||
                      message.includes('Cannot read properties of undefined')
                    )) {
                      return;
                    }
                    originalConsoleWarn.apply(console, args);
                  };
                }
              `
            }}
          />
        )}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}