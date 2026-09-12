import { constant } from "@/lib/tax/constants";
import { formatConstant } from "@/components/tools/ToolSources";

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
          {item.note ? <p className="chip chip--source stat__note">{item.note}</p> : null}
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

/**
 * One figure from `src/lib/tax/constants.ts`, with its source and its
 * verification state (plan §5.5, §4.16). `<Stat k="bolagsskatt" />` is how an
 * article cites a rate without copying the number into its own prose, so a
 * corrected constant corrects every page that shows it.
 *
 * An unknown key throws at build time — the same failure mode as a bad
 * frontmatter field, and for the same reason.
 */
export function Stat({ k, label }: { k: string; label?: string }) {
  const item = constant(k);
  return (
    <div className="stat-row">
      <div className="stat">
        <p className="stat__value">{formatConstant(item)}</p>
        <p className="stat__label">{label ?? item.label}</p>
        <p className="chip chip--source stat__note">
          <a href={item.source} rel="noopener nofollow" target="_blank">
            Källa
          </a>
          {item.verified ? null : <> · <Verifiera /></>}
        </p>
      </div>
    </div>
  );
}
