import { Metadata } from "next";
import { PageLayout, Container } from "@/components/layout";

export const metadata: Metadata = {
  title: "Terms of Service - ProfMatch",
  description: "Terms and conditions for using ProfMatch.",
};

export default function TermsPage() {
  return (
    <PageLayout>
      <Container className="py-12 md:py-20">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-6 text-3xl font-semibold text-text-primary md:text-4xl">
            Terms of Service
          </h1>

          <div className="space-y-6 text-text-secondary">
            <p className="text-lg">
              By using ProfMatch, you agree to the following terms and
              conditions.
            </p>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-text-primary">
                Service Description
              </h2>
              <p>
                ProfMatch is a research supervisor matching tool that helps
                prospective postgraduate students discover professors whose
                research interests align with their academic background. The
                service analyzes publicly available faculty data and
                user-provided information to generate ranked recommendations.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-text-primary">
                Use of the Service
              </h2>
              <p>You agree to:</p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>Provide accurate information about your academic background</li>
                <li>Use the service for legitimate academic purposes only</li>
                <li>Not attempt to scrape, reverse-engineer, or misuse the platform</li>
                <li>Not submit content that is fraudulent or misleading</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-text-primary">
                Recommendations
              </h2>
              <p>
                ProfMatch provides recommendations as a starting point for your
                research. Results are generated algorithmically and should not be
                treated as guaranteed outcomes. We do not guarantee admission,
                supervision availability, or any specific response from
                recommended professors.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-text-primary">
                Intellectual Property
              </h2>
              <p>
                You retain ownership of all content you upload, including your CV
                and research descriptions. ProfMatch does not claim any rights
                over your submitted materials.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-text-primary">
                Limitation of Liability
              </h2>
              <p>
                ProfMatch is provided &ldquo;as is&rdquo; without warranties of
                any kind. We are not liable for decisions made based on the
                recommendations provided, nor for the accuracy of publicly
                sourced professor data.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-text-primary">
                Changes to Terms
              </h2>
              <p>
                We may update these terms from time to time. Continued use of
                the service after changes constitutes acceptance of the updated
                terms.
              </p>
            </section>
          </div>
        </div>
      </Container>
    </PageLayout>
  );
}
