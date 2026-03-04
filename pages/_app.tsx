import '../globals.css';
import { LanguageProvider } from '../lib/LanguageContext';
import { ErrorBoundary } from '../components/ErrorBoundary';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <Component {...pageProps} />
      </LanguageProvider>
    </ErrorBoundary>
  );
}
