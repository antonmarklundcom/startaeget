import Link from "next/link";
import { hubs } from "@/lib/content/site";

export default function NotFound() {
  return (
    <div className="container notfound">
      <h1>Sidan finns inte</h1>
      <p>
        Länken kan vara gammal eller felstavad. Prova något av avsnitten nedan,
        eller gå till <Link href="/">startsidan</Link>.
      </p>
      <ul>
        {hubs.map((hub) => (
          <li key={hub.id}>
            <Link href={hub.path}>{hub.h1}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
