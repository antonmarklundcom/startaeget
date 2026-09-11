import { extractToc } from "./mdx/headings";

/** In-page navigation for long guides. Short pages do not get one. */
export function Toc({ body, minHeadings = 4 }: { body: string; minHeadings?: number }) {
  const entries = extractToc(body);
  if (entries.length < minHeadings) return null;

  return (
    <nav className="aside-card toc no-print" aria-labelledby="toc-heading">
      <h2 id="toc-heading">På sidan</h2>
      <ol>
        {entries.map((entry) => (
          <li key={entry.id}>
            <a href={`#${entry.id}`}>{entry.text}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
