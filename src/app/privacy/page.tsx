import { Metadata } from "next";
import { PageLayout, Container } from "@/components/layout";

export const metadata: Metadata = {
  title: "Privacy Policy - ProfMatch",
  description: "How ProfMatch handles and protects your data.",
};

export default function PrivacyPage() {
  return (
    <PageLayout>
      <Container className="py-12 md:py-20">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-6 text-3xl font-semibold text-text-primary md:text-4xl">
            Privacy Policy
          </h1>

          <div className="space-y-6 text-text-secondary">
            <p className="text-lg">
              Your privacy matters to us. This policy explains what data
              ProfMatch collects, how we use it, and how we protect it.
            </p>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-text-primary">
                Data We Collect
              </h2>
              <p>
                When you use ProfMatch, we process the following information
                during your session:
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>University name or URL you provide</li>
                <li>Research interests you describe</li>
                <li>CV or resume you upload</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-text-primary">
                How We Use Your Data
              </h2>
              <p>
                Your data is used solely to generate professor recommendations
                tailored to your research interests and academic background. We
                do not use your data for advertising, marketing, or any purpose
                unrelated to the matching service.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-text-primary">
                Data Retention
              </h2>
              <p>
                We do not store your uploaded documents or personal information
                beyond your active session. All session data, including uploaded
                CVs and generated results, is automatically purged within 24
                hours.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-text-primary">
                Third-Party Services
              </h2>
              <p>
                ProfMatch aggregates publicly available professor data from
                sources such as Google Scholar and university websites. We do not
                share your personal data with any third parties.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-text-primary">
                Security
              </h2>
              <p>
                Your data is transmitted over encrypted connections (HTTPS) and
                processed on secure cloud infrastructure. We follow industry
                best practices to protect your information during processing.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-text-primary">
                Contact
              </h2>
              <p>
                If you have questions about this privacy policy, please reach
                out through our{" "}
                <a
                  href="/contact"
                  className="text-primary underline hover:text-accent"
                >
                  contact page
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </Container>
    </PageLayout>
  );
}
