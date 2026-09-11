import { UNVERIFIED_EXPLANATION, sourcesFor, type TaxConstant } from "@/lib/tax/constants";

/**
 * The "varifrån siffrorna kommer" box every result panel ends with (plan §1.1:
 * linking the authority is the trust signal). A constant that nobody has
 * checked against its own source says so, in the open, next to the number.
 */
export function ToolSources({
  keys,
  heading = "Siffrorna och var de kommer från",
}: {
  keys: readonly string[];
  heading?: string;
}) {
  const items: TaxConstant[] = sourcesFor(keys);
  if (!items.length) return null;
  const unverified = items.filter((item) => !item.verified).length;

  return (
    <div className="sources-box">
      <h2>{heading}</h2>
      <p className="sources-box__lede">
        {items.length} värden, var och ett med sin källa
        {unverified > 0 ? ` — ${unverified} av dem återstår att kontrollera mot myndigheten` : ""}.
      </p>
      <ul>
        {items.map((item) => (
          <li key={item.key}>
            <a href={item.source} rel="noopener nofollow" target="_blank">
              {item.label}
            </a>
            {": "}
            <strong>{formatConstant(item)}</strong>
            {item.verified ? null : <span className="sources-box__flag">verifiera</span>}
            {item.note ? <span className="sources-box__note">{item.note}</span> : null}
            {item.verified && item.verifiedOn ? (
              <span className="sources-box__note">
                Kontrollerad {item.verifiedOn} mot källan ovan.
              </span>
            ) : null}
          </li>
        ))}
      </ul>
      {unverified > 0 ? <p className="sources-box__why">{UNVERIFIED_EXPLANATION}</p> : null}
    </div>
  );
}

export function formatConstant(item: TaxConstant): string {
  if (item.unit === "percent") {
    return `${item.value.toLocaleString("sv-SE", { maximumFractionDigits: 2 })} %`;
  }
  if (item.unit === "sek-per-month") return `${formatSek(item.value)}/mån`;
  if (item.unit === "count") return item.value.toLocaleString("sv-SE");
  return formatSek(item.value);
}

export function formatSek(amount: number): string {
  return `${Math.round(amount).toLocaleString("sv-SE")} kr`;
}
