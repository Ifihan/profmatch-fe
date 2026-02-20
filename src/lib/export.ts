import type { MatchResult } from "@/types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ── Markdown Export ──────────────────────────────────────────────

export function exportToMarkdown(matches: MatchResult[]): string {
  const timestamp = new Date().toISOString().split("T")[0];
  const lines: string[] = [];

  lines.push(`# ProfMatch Results`);
  lines.push(`**Generated:** ${timestamp}  `);
  lines.push(`**Total Matches:** ${matches.length}\n`);
  lines.push(`---\n`);

  matches.forEach((match, index) => {
    const prof = match.professor;
    const rank = index + 1;

    lines.push(`## ${rank}. ${prof.name}`);
    lines.push(`**Match Score:** ${match.match_score}%\n`);

    lines.push(`| Field | Details |`);
    lines.push(`|-------|---------|`);
    lines.push(`| **Title** | ${prof.title} |`);
    lines.push(`| **Department** | ${prof.department} |`);
    lines.push(`| **University** | ${prof.university} |`);
    if (prof.email) {
      lines.push(`| **Email** | ${prof.email} |`);
    }
    if (prof.citation_metrics) {
      lines.push(`| **h-index** | ${prof.citation_metrics.h_index} |`);
      lines.push(
        `| **Total Citations** | ${prof.citation_metrics.total_citations.toLocaleString()} |`
      );
    }
    lines.push(
      `| **Research Areas** | ${prof.research_areas.join(", ")} |`
    );
    lines.push(``);

    if (match.shared_keywords.length > 0) {
      lines.push(`### Shared Keywords`);
      lines.push(match.shared_keywords.map((k) => `\`${k}\``).join(" "));
      lines.push(``);
    }

    if (match.alignment_reasons.length > 0) {
      lines.push(`### Why This Is a Good Match`);
      match.alignment_reasons.forEach((reason) => {
        lines.push(`- ${reason}`);
      });
      lines.push(``);
    }

    lines.push(`### Recommendation`);
    lines.push(`> ${match.recommendation_text}`);
    lines.push(``);

    if (match.relevant_publications.length > 0) {
      lines.push(`### Relevant Publications`);
      match.relevant_publications.forEach((pub, i) => {
        const authors = pub.authors.join(", ");
        const citation = `${authors}. "${pub.title}." *${pub.venue}*, ${pub.year}. (${pub.citation_count} citations)`;
        const line = pub.url
          ? `${i + 1}. ${citation} [Link](${pub.url})`
          : `${i + 1}. ${citation}`;
        lines.push(line);
      });
      lines.push(``);
    }

    lines.push(`---\n`);
  });

  return lines.join("\n");
}

// ── LaTeX Export ─────────────────────────────────────────────────

const LATEX_ESCAPE_MAP: Record<string, string> = {
  "\\": "\\textbackslash{}",
  "&": "\\&",
  "%": "\\%",
  $: "\\$",
  "#": "\\#",
  _: "\\_",
  "{": "\\{",
  "}": "\\}",
  "~": "\\textasciitilde{}",
  "^": "\\textasciicircum{}",
};

const LATEX_SPECIAL_CHARS = /[\\&%$#_{}\~\^]/g;

function escapeLatex(text: string): string {
  // Single-pass replacement using a character map to avoid
  // chained .replace() calls that can miss or double-escape characters
  return text.replace(LATEX_SPECIAL_CHARS, (char) => LATEX_ESCAPE_MAP[char]);
}

export function exportToLatex(matches: MatchResult[]): string {
  const timestamp = new Date().toISOString().split("T")[0];
  const lines: string[] = [];

  lines.push(`\\documentclass[11pt,a4paper]{article}`);
  lines.push(`\\usepackage[utf8]{inputenc}`);
  lines.push(`\\usepackage[T1]{fontenc}`);
  lines.push(`\\usepackage{lmodern}`);
  lines.push(`\\usepackage[margin=1in]{geometry}`);
  lines.push(`\\usepackage{booktabs}`);
  lines.push(`\\usepackage{hyperref}`);
  lines.push(`\\usepackage{xcolor}`);
  lines.push(`\\usepackage{enumitem}`);
  lines.push(`\\usepackage{tabularx}`);
  lines.push(``);
  lines.push(`\\definecolor{matchhigh}{RGB}{22,163,74}`);
  lines.push(`\\definecolor{matchmid}{RGB}{202,138,4}`);
  lines.push(`\\definecolor{matchlow}{RGB}{220,38,38}`);
  lines.push(``);
  lines.push(`\\title{ProfMatch Results}`);
  lines.push(`\\date{${escapeLatex(timestamp)}}`);
  lines.push(`\\author{}`);
  lines.push(``);
  lines.push(`\\begin{document}`);
  lines.push(`\\maketitle`);
  lines.push(``);
  lines.push(`\\noindent Total matches: ${matches.length}\n`);

  matches.forEach((match, index) => {
    const prof = match.professor;
    const rank = index + 1;

    const colorCmd =
      match.match_score >= 80
        ? "matchhigh"
        : match.match_score >= 60
          ? "matchmid"
          : "matchlow";

    lines.push(`\\section{${rank}. ${escapeLatex(prof.name)}}`);
    lines.push(
      `{\\large\\textbf{Match Score:} \\textcolor{${colorCmd}}{${match.match_score}\\%}}\n`
    );

    lines.push(`\\begin{tabularx}{\\textwidth}{lX}`);
    lines.push(`\\toprule`);
    lines.push(`\\textbf{Title} & ${escapeLatex(prof.title)} \\\\`);
    lines.push(
      `\\textbf{Department} & ${escapeLatex(prof.department)} \\\\`
    );
    lines.push(
      `\\textbf{University} & ${escapeLatex(prof.university)} \\\\`
    );
    if (prof.email) {
      lines.push(
        `\\textbf{Email} & \\href{mailto:${prof.email}}{${escapeLatex(prof.email)}} \\\\`
      );
    }
    if (prof.citation_metrics) {
      lines.push(
        `\\textbf{h-index} & ${prof.citation_metrics.h_index} \\\\`
      );
      lines.push(
        `\\textbf{Total Citations} & ${prof.citation_metrics.total_citations.toLocaleString()} \\\\`
      );
    }
    lines.push(
      `\\textbf{Research Areas} & ${escapeLatex(prof.research_areas.join(", "))} \\\\`
    );
    lines.push(`\\bottomrule`);
    lines.push(`\\end{tabularx}\n`);

    if (match.shared_keywords.length > 0) {
      lines.push(`\\subsection*{Shared Keywords}`);
      lines.push(
        match.shared_keywords
          .map((k) => `\\texttt{${escapeLatex(k)}}`)
          .join(", ")
      );
      lines.push(``);
    }

    if (match.alignment_reasons.length > 0) {
      lines.push(`\\subsection*{Why This Is a Good Match}`);
      lines.push(`\\begin{itemize}[nosep]`);
      match.alignment_reasons.forEach((reason) => {
        lines.push(`  \\item ${escapeLatex(reason)}`);
      });
      lines.push(`\\end{itemize}\n`);
    }

    lines.push(`\\subsection*{Recommendation}`);
    lines.push(`\\begin{quote}`);
    lines.push(escapeLatex(match.recommendation_text));
    lines.push(`\\end{quote}\n`);

    if (match.relevant_publications.length > 0) {
      lines.push(`\\subsection*{Relevant Publications}`);
      lines.push(`\\begin{enumerate}[nosep]`);
      match.relevant_publications.forEach((pub) => {
        const authors = escapeLatex(pub.authors.join(", "));
        const title = escapeLatex(pub.title);
        const venue = escapeLatex(pub.venue);
        let entry = `  \\item ${authors}. \\emph{${title}.} \\textit{${venue}}, ${pub.year}. (${pub.citation_count} citations)`;
        if (pub.url) {
          entry += ` \\href{${pub.url}}{[Link]}`;
        }
        lines.push(entry);
      });
      lines.push(`\\end{enumerate}\n`);
    }

    if (index < matches.length - 1) {
      lines.push(`\\newpage`);
    }
  });

  lines.push(`\\end{document}`);
  return lines.join("\n");
}

// ── PDF Export ────────────────────────────────────────────────────

export function exportToPDF(matches: MatchResult[]): void {
  const timestamp = new Date().toISOString().split("T")[0];
  const doc = new jsPDF();

  // Title
  doc.setFontSize(20);
  doc.text("ProfMatch Results", 14, 20);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(
    `Generated: ${timestamp} | Total Matches: ${matches.length}`,
    14,
    28
  );
  doc.setTextColor(0);

  let yPos = 38;

  matches.forEach((match, index) => {
    const prof = match.professor;
    const rank = index + 1;

    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    // Professor name and score
    doc.setFontSize(14);
    doc.text(`${rank}. ${prof.name}`, 14, yPos);
    yPos += 7;

    const [r, g, b] =
      match.match_score >= 80
        ? [22, 163, 74]
        : match.match_score >= 60
          ? [202, 138, 4]
          : [220, 38, 38];
    doc.setFontSize(11);
    doc.setTextColor(r, g, b);
    doc.text(`Match Score: ${match.match_score}%`, 14, yPos);
    doc.setTextColor(0);
    yPos += 8;

    // Details table
    autoTable(doc, {
      startY: yPos,
      head: [],
      body: [
        ["Title", prof.title],
        ["Department", prof.department],
        ["University", prof.university],
        ...(prof.email ? [["Email", prof.email]] : []),
        ...(prof.citation_metrics
          ? [
              ["h-index", String(prof.citation_metrics.h_index)],
              [
                "Total Citations",
                String(prof.citation_metrics.total_citations),
              ],
            ]
          : []),
        ["Research Areas", prof.research_areas.join(", ")],
      ],
      theme: "grid",
      styles: { fontSize: 9 },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 40 } },
      margin: { left: 14 },
    });

    yPos =
      (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
        .finalY + 6;

    // Shared keywords
    if (match.shared_keywords.length > 0) {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Shared Keywords:", 14, yPos);
      doc.setFont("helvetica", "normal");
      yPos += 5;
      doc.setFontSize(9);
      const keywordLines = doc.splitTextToSize(
        match.shared_keywords.join(", "),
        180
      );
      doc.text(keywordLines, 14, yPos);
      yPos += keywordLines.length * 4.5 + 3;
    }

    // Alignment reasons
    if (match.alignment_reasons.length > 0) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Why This Is a Good Match:", 14, yPos);
      doc.setFont("helvetica", "normal");
      yPos += 5;
      doc.setFontSize(9);
      match.alignment_reasons.forEach((reason) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        const reasonLines = doc.splitTextToSize(`• ${reason}`, 180);
        doc.text(reasonLines, 14, yPos);
        yPos += reasonLines.length * 4.5 + 1;
      });
      yPos += 2;
    }

    // Recommendation
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Recommendation:", 14, yPos);
    doc.setFont("helvetica", "normal");
    yPos += 5;
    doc.setFontSize(9);
    const recLines = doc.splitTextToSize(match.recommendation_text, 180);
    doc.text(recLines, 14, yPos);
    yPos += recLines.length * 4.5 + 4;

    // Publications table
    if (match.relevant_publications.length > 0) {
      if (yPos > 230) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Relevant Publications:", 14, yPos);
      doc.setFont("helvetica", "normal");
      yPos += 4;

      autoTable(doc, {
        startY: yPos,
        head: [["#", "Title", "Authors", "Venue", "Year", "Citations", "Link"]],
        body: match.relevant_publications.map((pub, i) => [
          String(i + 1),
          pub.title,
          pub.authors.join(", "),
          pub.venue,
          String(pub.year),
          String(pub.citation_count),
          "", // Empty cell - we'll draw the link in didDrawCell
        ]),
        theme: "striped",
        styles: { fontSize: 7, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 8 },
          1: { cellWidth: 50 },
          2: { cellWidth: 40 },
          3: { cellWidth: 30 },
          4: { cellWidth: 12 },
          5: { cellWidth: 16 },
          6: { cellWidth: 14, halign: "center" },
        },
        margin: { left: 14 },
        didDrawCell: (data) => {
          // Add clickable link in the Link column
          if (data.column.index === 6 && data.cell.section === "body") {
            const pub = match.relevant_publications[data.row.index];
            if (pub.url) {
              doc.setFontSize(7);
              const textWidth = doc.getTextWidth("View");
              const textX = data.cell.x + (data.cell.width - textWidth) / 2;
              const textY = data.cell.y + data.cell.height / 2 + 2.5;

              doc.setTextColor(0, 0, 255);
              doc.textWithLink("View", textX, textY, { url: pub.url });
              doc.setTextColor(0, 0, 0);
            }
          }
        },
      });

      yPos =
        (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
          .finalY + 10;
    }

    // Separator
    if (index < matches.length - 1) {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }
      doc.setDrawColor(200);
      doc.line(14, yPos, 196, yPos);
      yPos += 10;
    }
  });

  doc.save(`profmatch-results-${timestamp}.pdf`);
}

// ── Download helper (for text-based formats) ─────────────────────

export function downloadFile(
  content: string,
  filename: string,
  type: string
) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ── Orchestrator ─────────────────────────────────────────────────

export function exportResults(
  matches: MatchResult[],
  format: "latex" | "markdown" | "pdf"
) {
  const timestamp = new Date().toISOString().split("T")[0];

  switch (format) {
    case "markdown": {
      const content = exportToMarkdown(matches);
      downloadFile(
        content,
        `profmatch-results-${timestamp}.md`,
        "text/markdown"
      );
      break;
    }
    case "latex": {
      const content = exportToLatex(matches);
      downloadFile(
        content,
        `profmatch-results-${timestamp}.tex`,
        "application/x-tex"
      );
      break;
    }
    case "pdf": {
      exportToPDF(matches);
      break;
    }
  }
}
