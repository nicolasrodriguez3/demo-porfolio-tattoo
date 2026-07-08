import type { APIRoute } from 'astro';

const site = 'https://carmin-tattoo.vercel.app';

export const GET: APIRoute = () => {
  const robotsTxt = [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${site}/sitemap.xml`,
  ].join('\n');

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
