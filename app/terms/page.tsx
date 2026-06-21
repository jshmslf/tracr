import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions | Tracr",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-semibold">Terms and Conditions</h1>
      <p className="mt-1 text-sm text-muted-foreground">Last updated June 2026.</p>

      <div className="mt-8 flex flex-col gap-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="mb-2 text-base font-medium text-foreground">1. Acceptance of terms</h2>
          <p>
            By creating an account or using Tracr, you agree to these terms. If you do not
            agree, do not use the service.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-medium text-foreground">2. The service</h2>
          <p>
            Tracr is a personal tool for tracking job applications: titles, companies,
            statuses, salaries, and notes. It includes an auto-fill feature that fetches publicly
            available data from a job posting URL you supply, to save you from typing it in by
            hand.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-medium text-foreground">3. Accounts</h2>
          <p>
            You are responsible for keeping your account credentials secure and for the accuracy
            of the information you provide. Each account is for one person.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-medium text-foreground">4. Your content</h2>
          <p>
            You own the application data you enter. It is not sold or shared with third parties.
            Deleting your account removes your stored data.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-medium text-foreground">
            5. Scraped and third-party content
          </h2>
          <p>
            The auto-fill feature reads data from third-party pages at the URLs you provide. Job
            Tracker is not affiliated with those sites and does not guarantee the accuracy,
            availability, or completeness of any scraped data. You are responsible for the links
            you submit and for complying with the terms of the sites you link to.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-medium text-foreground">6. Acceptable use</h2>
          <p>
            Do not use Tracr to abuse the service, attempt to disrupt it, or use the
            auto-fill feature to scrape pages at scale or for purposes unrelated to your own
            personal job tracking.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-medium text-foreground">7. Termination</h2>
          <p>
            You may delete your account at any time. Accounts used for abuse or in violation of
            these terms may be suspended or terminated.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-medium text-foreground">
            8. Disclaimer and limitation of liability
          </h2>
          <p>
            Tracr is provided as is, without warranty of any kind. It is not responsible for
            job application outcomes, decisions made using the tracked data, or loss of data. Use
            it at your own discretion.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-medium text-foreground">9. Changes to these terms</h2>
          <p>
            These terms may be updated from time to time. Continued use of Tracr after a
            change means you accept the updated terms.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-medium text-foreground">10. Contact</h2>
          <p>
            Questions about these terms can be sent through the contact details on{" "}
            <a
              href="https://jshmslf.is-a.dev"
              target="_blank"
              rel="noreferrer"
              className="text-foreground hover:underline"
            >
              jshmslf.is-a.dev
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
