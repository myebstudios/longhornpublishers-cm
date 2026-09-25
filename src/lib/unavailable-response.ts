/** A self-contained error page; rendering it must never call the CMS. */
export function unavailableResponse(): Response {
  return new Response(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Temporarily unavailable — Service temporairement indisponible</title>
  <style>
    body{margin:0;min-height:100vh;display:grid;place-items:center;background:#faf7f3;color:#241b1c;font:1rem/1.6 system-ui,sans-serif}
    main{width:min(100% - 2rem,42rem);padding:2rem 0}
    section+section{border-top:1px solid #cbbfc0;margin-top:2rem;padding-top:1.5rem}
    h1,h2{color:#5c1a2b;font-size:clamp(1.5rem,4vw,2rem);line-height:1.25}
  </style>
</head>
<body><main>
  <section lang="en"><h1>Temporarily unavailable</h1><p>Please try again shortly.</p></section>
  <section lang="fr"><h2>Service temporairement indisponible</h2><p>Veuillez réessayer dans quelques instants.</p></section>
</main></body>
</html>`, {
    status: 503,
    statusText: 'Service Unavailable',
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
