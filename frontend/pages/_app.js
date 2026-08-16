import "../styles/globals.css";
import Layout from "../components/layout";
import { ToastProvider } from "../components/ui/toast";
import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>RouteRAG — AI-Powered Business Intelligence</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <ToastProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ToastProvider>
    </>
  );
}