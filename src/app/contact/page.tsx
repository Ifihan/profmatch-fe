import { Metadata } from "next";
import { PageLayout, Container } from "@/components/layout";

export const metadata: Metadata = {
  title: "Contact - ProfMatch",
  description: "Get in touch with the ProfMatch team.",
};

export default function ContactPage() {
  return (
    <PageLayout>
      <Container className="py-12 md:py-20">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-6 text-3xl font-semibold text-text-primary md:text-4xl">
            Contact Us
          </h1>

          <div className="space-y-6 text-text-secondary">
            <p className="text-lg">
              Have questions, feedback, or running into an issue? We&apos;d like
              to hear from you.
            </p>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-text-primary">
                Email
              </h2>
              <p>
                Reach us at{" "}
                <a
                  href="mailto:victoriaolusheye@gmail.com"
                  className="text-primary underline hover:text-accent"
                >
                  victoriaolusheye@gmail.com
                </a>
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-text-primary">
                GitHub
              </h2>
              <p>
                ProfMatch is open source. Report bugs or request features on our{" "}
                <a
                  href="https://github.com/Ifihan/profmatch-fe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline hover:text-accent"
                >
                  GitHub repository
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-text-primary">
                Response Time
              </h2>
              <p>
                We aim to respond to all inquiries within 48 hours. For bug
                reports, opening a GitHub issue is the fastest way to get a
                resolution.
              </p>
            </section>
          </div>
        </div>
      </Container>
    </PageLayout>
  );
}
