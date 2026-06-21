import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-sm text-muted-foreground">
        <p>
          Made with 💖 by {" "}
          <a
            href="https://jshmslf.is-a.dev"
            target="_blank"
            rel="noreferrer"
            className="text-foreground hover:underline"
          >
            jshmslf
          </a>{" "}
        </p>
        <Link href="/terms" className="hover:text-foreground hover:underline">
          Terms and Conditions
        </Link>
      </div>
    </footer>
  );
}
