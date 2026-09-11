# Decisions needed

Build sessions append questions here (plan §4.4), commit, push, and end. Anton answers inline and the next run of the phase picks it up.

- **S4 (cross-cutting, not blocking):** `content/articles/starta-foretag/starta-aktiebolag.mdx` (O2's, outside S4's Owns block) still says "räkna med ungefär 2 400 kr" for the electronic aktiebolag registration fee. O3's `src/lib/tax/constants.ts` (`bolagsverket-ab-nyregistrering`) corrected this to 2 200 kr after O2 shipped. Every S4 article that cites this fee (`starta-eget-foretag`, `enskild-firma-eller-aktiebolag`, `registrera-foretag-bolagsverket`, `lagerbolag-eller-nyregistrering`) uses the corrected 2 200 kr figure. S9's link pass (or a human edit) should update the one stale number in `starta-aktiebolag.mdx` to match.
