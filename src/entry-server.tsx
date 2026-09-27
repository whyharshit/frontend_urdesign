import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { App } from './app/App';
import { getPageMetadata } from './app/metadata';

const escape = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!,
  );

export function render(url: string) {
  const metadata = getPageMetadata(url);
  return {
    html: renderToString(
      <StaticRouter location={url}>
        <App />
      </StaticRouter>,
    ),
    head: `<title>${escape(metadata.title)}</title><meta name="description" content="${escape(metadata.description)}" />${metadata.private ? '<meta name="robots" content="noindex,nofollow" />' : ''}`,
    status: metadata.status,
  };
}
