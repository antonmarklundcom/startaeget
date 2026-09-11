import { nav } from "@/lib/content/site";
import { JsonLd } from "@/components/JsonLd";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { organizationJsonLd, websiteJsonLd } from "@/lib/jsonld";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={websiteJsonLd()} />
      <a href="#main" className="skip-link">
        Hoppa till innehållet
      </a>
      <SiteHeader nav={nav} />
      <main id="main">{children}</main>
      <SiteFooter nav={nav} />
    </>
  );
}
