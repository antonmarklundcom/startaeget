import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

/** Open Graph image. `?title=` comes from buildMetadata; no title = the brand card. */

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get("title") ?? SITE_NAME).slice(0, 90);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          padding: "64px",
          borderTop: "16px solid #0c6b4f",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, color: "#0c6b4f", letterSpacing: 1 }}>
          {SITE_NAME.toUpperCase()}
        </div>
        <div style={{ display: "flex", fontSize: 64, lineHeight: 1.15, color: "#14181d" }}>
          {title}
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#6b7480" }}>{SITE_TAGLINE}</div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
