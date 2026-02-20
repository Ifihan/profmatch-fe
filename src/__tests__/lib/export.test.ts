// Mock jsPDF and autoTable to avoid jsdom TextEncoder issues
jest.mock("jspdf", () => {
  return jest.fn().mockImplementation(() => ({
    setFontSize: jest.fn(),
    setTextColor: jest.fn(),
    setFont: jest.fn(),
    setDrawColor: jest.fn(),
    text: jest.fn(),
    line: jest.fn(),
    splitTextToSize: jest.fn().mockReturnValue(["line"]),
    addPage: jest.fn(),
    save: jest.fn(),
    lastAutoTable: { finalY: 100 },
  }));
});
jest.mock("jspdf-autotable", () => jest.fn());

import { exportToMarkdown, exportToLatex } from "@/lib/export";
import type { MatchResult } from "@/types";

const mockMatches: MatchResult[] = [
  {
    professor: {
      id: "1",
      name: "Dr. Jane Smith",
      title: "Associate Professor",
      department: "Computer Science",
      university: "https://www.mit.edu",
      email: "jsmith@mit.edu",
      research_areas: ["Machine Learning", "AI"],
      publications: [],
      citation_metrics: {
        h_index: 25,
        total_citations: 3000,
      },
      last_updated: "2024-01-01",
    },
    match_score: 92,
    alignment_reasons: ["Strong ML background", "Published in top venues"],
    relevant_publications: [
      {
        title: "Deep Learning for NLP",
        authors: ["J. Smith", "A. Jones"],
        year: 2023,
        venue: "NeurIPS",
        citation_count: 150,
        url: "https://example.com/paper1",
      },
    ],
    shared_keywords: ["machine learning", "deep learning"],
    recommendation_text: "Great match for ML research.",
  },
];

describe("exportToMarkdown", () => {
  it("generates valid Markdown with title and metadata", () => {
    const md = exportToMarkdown(mockMatches);
    expect(md).toContain("# ProfMatch Results");
    expect(md).toContain("**Total Matches:** 1");
  });

  it("includes professor details in a table", () => {
    const md = exportToMarkdown(mockMatches);
    expect(md).toContain("| **Title** | Associate Professor |");
    expect(md).toContain("| **University** | https://www.mit.edu |");
  });

  it("includes shared keywords, alignment reasons, and recommendation", () => {
    const md = exportToMarkdown(mockMatches);
    expect(md).toContain("`machine learning`");
    expect(md).toContain("- Strong ML background");
    expect(md).toContain("> Great match for ML research.");
  });

  it("includes relevant publications", () => {
    const md = exportToMarkdown(mockMatches);
    expect(md).toContain("Deep Learning for NLP");
    expect(md).toContain("NeurIPS");
    expect(md).toContain("[Link](https://example.com/paper1)");
  });

  it("handles missing optional fields gracefully", () => {
    const noOptionals: MatchResult[] = [
      {
        ...mockMatches[0],
        professor: {
          ...mockMatches[0].professor,
          email: undefined,
          citation_metrics: undefined,
        },
      },
    ];
    const md = exportToMarkdown(noOptionals);
    expect(md).not.toContain("**Email**");
    expect(md).not.toContain("**h-index**");
  });
});

describe("exportToLatex", () => {
  it("generates a complete LaTeX document", () => {
    const tex = exportToLatex(mockMatches);
    expect(tex).toContain("\\documentclass");
    expect(tex).toContain("\\begin{document}");
    expect(tex).toContain("\\end{document}");
  });

  it("includes professor sections with match score", () => {
    const tex = exportToLatex(mockMatches);
    expect(tex).toContain("\\section{1. Dr. Jane Smith}");
    expect(tex).toContain("92\\%");
  });

  it("escapes LaTeX special characters", () => {
    const specialChars: MatchResult[] = [
      {
        ...mockMatches[0],
        professor: {
          ...mockMatches[0].professor,
          name: "Dr. O'Brien & Sons",
        },
      },
    ];
    const tex = exportToLatex(specialChars);
    expect(tex).toContain("\\&");
  });

  it("includes publications in enumerated list", () => {
    const tex = exportToLatex(mockMatches);
    expect(tex).toContain("\\begin{enumerate}");
    expect(tex).toContain("Deep Learning for NLP");
  });

  it("uses correct color for high match scores", () => {
    const tex = exportToLatex(mockMatches);
    expect(tex).toContain("\\textcolor{matchhigh}");
  });
});
