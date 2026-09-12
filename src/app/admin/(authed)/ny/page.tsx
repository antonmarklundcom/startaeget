import Link from "next/link";
import { editorOptions } from "@/lib/admin/options";
import { ArticleEditor } from "@/app/admin/_components/ArticleEditor";

/** "Ny bloggpost": the same editor, pre-set to the blog and to `type: post`. */

export const dynamic = "force-dynamic";

const TEMPLATE = `Skriv inledningen här — vad läsaren får ut av posten, i två–tre meningar.

## Första rubriken

Text. Länka med knappen "Infoga länk" så att adressen garanterat finns.

## Andra rubriken

Text.
`;

export default function NewPostPage() {
  return (
    <>
      <div className="adm-head">
        <h1>Ny bloggpost</h1>
        <Link className="adm-btn adm-btn--quiet" href="/admin/">
          Tillbaka
        </Link>
      </div>

      <ArticleEditor
        mode="create"
        options={editorOptions()}
        article={{
          hub: "blogg",
          slug: "",
          title: "",
          type: "post",
          description: "",
          intent: "",
          updated: new Date().toISOString().slice(0, 10),
          sources: [],
          partners: [],
          related: [],
          faq: [],
          legacy: false,
          draft: false,
          body: TEMPLATE,
        }}
      />
    </>
  );
}
