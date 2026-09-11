/**
 * The component vocabulary an MDX author may use (plan §5.2). Anything not
 * registered in src/components/Mdx.tsx is a build error, on purpose: a lane 2
 * phase that needs a new block asks for it instead of inventing markup.
 */

export function Callout({
  title,
  variant = "info",
  children,
}: {
  title?: string;
  variant?: "info" | "warning";
  children: React.ReactNode;
}) {
  return (
    <aside className={variant === "warning" ? "callout callout--warning" : "callout"}>
      {title ? <p className="callout__title">{title}</p> : null}
      {children}
    </aside>
  );
}

export function Checklist({ items }: { items: readonly string[] }) {
  return (
    <ul className="checklist">
      {items.map((item) => (
        <li key={item}>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export type StatItem = { value: string; label: string; note?: string };

export function StatRow({ items }: { items: readonly StatItem[] }) {
  return (
    <div className="stat-row">
      {items.map((item) => (
        <div className="stat" key={item.label}>
          <p className="stat__value">{item.value}</p>
          <p className="stat__label">{item.label}</p>
          {item.note ? <p className="stat__note">{item.note}</p> : null}
        </div>
      ))}
    </div>
  );
}

/**
 * Anti-fabrication marker (plan §4.16). A number we could not check against the
 * authority or the vendor's own page ships wearing this, and the phase logs it —
 * we never quietly guess.
 */
export function Verifiera({ children }: { children?: React.ReactNode }) {
  return (
    <span className="verifiera" title="Siffran är inte kontrollerad mot källan än">
      {children ?? "verifiera"}
    </span>
  );
}
