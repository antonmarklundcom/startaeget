import { getPartner, isAffiliate, goHref } from "@/lib/affiliates";

/**
 * An inline link to a partner. Always routes through /go/<id> so the click is
 * logged, and always carries its disclosure in plain sight (plan §1.2 — marking
 * is required by Swedish marketing law and it is also the cheapest trust
 * signal we have). The marking is unconditional: it does not wait for the
 * affiliate programme to be enrolled, so nothing silently changes character on
 * the day an `affiliateUrl` is filled in.
 */
export function Annonslank({
  partner,
  children,
}: {
  partner: string;
  children?: React.ReactNode;
}) {
  const entry = getPartner(partner);
  if (!entry) {
    throw new Error(`<Annonslank partner="${partner}"> — unknown partner id`);
  }

  return (
    <>
      <a
        href={goHref(entry.id)}
        rel={isAffiliate(entry) ? "sponsored nofollow noopener" : "nofollow noopener"}
        target="_blank"
      >
        {children ?? entry.name}
      </a>{" "}
      <span className="annonslank-mark">{entry.disclosure}</span>
    </>
  );
}
