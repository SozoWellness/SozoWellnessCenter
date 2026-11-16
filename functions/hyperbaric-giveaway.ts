export function onRequest({ request }: { request: Request }) {
  const url = new URL(request.url);
  url.pathname = '/enter-to-win';
  return new Response(null, { status: 301, headers: { Location: url.toString(), 'Cache-Control': 'no-cache' } });
}
