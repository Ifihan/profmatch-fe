"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageLayout, Container } from "@/components/layout";
import { Input, TextArea, Button, FileUpload } from "@/components/ui";
import type { UploadedFile } from "@/components/ui";

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [university, setUniversity] = useState("");
  const [researchInterests, setResearchInterests] = useState("");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [errors, setErrors] = useState<{
    university?: string;
    researchInterests?: string;
    files?: string;
    submit?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!university.trim()) {
      newErrors.university = "Please enter a university URL";
    } else {
      try {
        const url = new URL(university);
        if (!url.protocol.startsWith("http")) {
          newErrors.university = "Please enter a valid URL (e.g., https://www.mit.edu)";
        }
      } catch {
        newErrors.university = "Please enter a valid URL (e.g., https://www.mit.edu)";
      }
    }

    if (!researchInterests.trim()) {
      newErrors.researchInterests = "Please describe your research interests";
    }

    if (files.length === 0) {
      newErrors.files = "Please upload your resume";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFilesChange = (newFiles: UploadedFile[]) => {
    setFiles(newFiles);
    // Clear file error when user uploads a file
    if (newFiles.length > 0 && errors.files) {
      setErrors((prev) => ({ ...prev, files: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const interests = researchInterests
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const resumeFileName = files[0]?.file.name || "resume.pdf";

      if (USE_MOCK_DATA) {
        // Demo mode: skip API calls, store form data and navigate
        sessionStorage.setItem(
          "matchData",
          JSON.stringify({
            sessionId: "mock-session",
            matchId: "mock-match",
            university,
            researchInterests: interests,
            resumeFileName,
          })
        );

        router.push("/processing");
      } else {
        // Real mode: make API calls
        const { createSession, uploadFile, startMatch } = await import("@/lib/api");

        const session = await createSession();

        const fileIds: string[] = [];
        for (const { file } of files) {
          const response = await uploadFile(session.session_id, file);
          fileIds.push(response.file_id);
        }

        const { match_id: matchId } = await startMatch(
          session.session_id,
          university,
          interests,
          fileIds
        );

        sessionStorage.setItem(
          "matchData",
          JSON.stringify({
            sessionId: session.session_id,
            matchId,
            university,
            researchInterests: interests,
            resumeFileName,
          })
        );

        router.push("/processing");
      }
    } catch (err) {
      setErrors({
        submit:
          err instanceof Error ? err.message : "Something went wrong. Please try again.",
      });
      setIsLoading(false);
    }
  };

  return (
    <PageLayout>
      <Container className="py-12 md:py-20">
        <div className="mx-auto max-w-xl">
          <div className="mb-10 text-center">
            <h1 className="mb-3 text-3xl font-semibold text-text-primary md:text-4xl">
              Find Your Research Supervisor
            </h1>
            <p className="text-lg text-text-secondary">
              Match with professors whose research aligns with your academic
              goals
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.submit && (
              <div className="rounded-md bg-error/10 p-4 text-sm text-error">
                {errors.submit}
              </div>
            )}

            <Input
              label="University URL"
              placeholder="e.g., https://www.mit.edu"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              error={errors.university}
              disabled={isLoading}
            />

            <TextArea
              label="Research Interests"
              placeholder="e.g., machine learning, computer vision, natural language processing"
              value={researchInterests}
              onChange={(e) => setResearchInterests(e.target.value)}
              error={errors.researchInterests}
              disabled={isLoading}
            />

            <FileUpload
              label="Your Resume"
              value={files}
              onChange={handleFilesChange}
              error={errors.files}
              disabled={isLoading}
              multiple={false}
            />

            <Button
              type="submit"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              Find Matches
            </Button>
          </form>
        </div>
      </Container>
    </PageLayout>
  );
}
