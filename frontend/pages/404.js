import ErrorPage from '../components/error-page';

export default function Custom404() {
  return <ErrorPage code={404} message="Page not found" />;
}