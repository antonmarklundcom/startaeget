import { sourcesFor, type TaxConstant } from "@/lib/tax/constants";

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

  return (
    <div className="sources-box">
      <h2>{heading}</h2>
      <ul>
        {items.map((item) => (
          <li key={item.key}>
            <a href={item.source} rel="noopener nofollow" target="_blank">
              {item.label}
            </a>
            {": "}
            <strong>{formatConstant(item)}</strong>
            {item.verified ? (
              <span className="sources-box__note">
                Kontrollerad {item.verifiedOn} mot källan ovan.
              </span>
            ) : (
              <>
                <span className="sources-box__flag">verifiera</span>
                <span className="sources-box__note">{item.note}</span>
              </>
            )}
          </li>
        ))}
      </ul>
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
