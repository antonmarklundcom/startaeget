import { getPartner, isAffiliate, goHref } from "@/lib/affiliates";

/**
 * An inline link to a partner. Always routes through /go/<id> so the click is
 * logged, and always carries the "Annonslänk" marking when the link earns money
 * (plan §1.2 — required by Swedish marketing law).
 *
 * O1 ships the behaviour; O2 owns how it looks.
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
  const paid = isAffiliate(entry);

  return (
    <>
      <a
        href={goHref(entry.id)}
        rel={paid ? "sponsored nofollow noopener" : "nofollow noopener"}
        target="_blank"
      >
        {children ?? entry.name}
      </a>
      {paid ? (
        <span className="annonslank-mark" title={entry.disclosure}>
          {" "}
          ({entry.disclosure})
        </span>
      ) : null}
    </>
  );
}
