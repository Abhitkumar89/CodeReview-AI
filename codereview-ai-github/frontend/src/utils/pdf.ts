import { jsPDF } from 'jspdf';
import type { Review } from '@/types';

/** Generates and downloads a formatted PDF of a review. */
export function downloadReviewPdf(review: Review) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 48;
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const writeLines = (text: string, fontSize: number, fontStyle = 'normal', color = '#1e293b') => {
    if (!text) return;
    doc.setFont('helvetica', fontStyle);
    doc.setFontSize(fontSize);
    doc.setTextColor(color);
    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach((line: string) => {
      ensureSpace(fontSize + 6);
      doc.text(line, margin, y);
      y += fontSize + 6;
    });
  };

  const section = (title: string, items: string[]) => {
    if (!items.length) return;
    y += 8;
    writeLines(title, 13, 'bold', '#4f46e5');
    items.forEach((item) => writeLines(`- ${item}`, 10.5));
  };

  const ai = review.aiResponse;

  // Header
  writeLines('AI Code Review Report', 20, 'bold', '#0f172a');
  writeLines(review.title, 12, 'normal', '#475569');
  writeLines(
    `Language: ${review.language}   |   Score: ${ai.qualityScore}/10   |   ${new Date(
      review.createdAt,
    ).toLocaleString()}`,
    10,
    'normal',
    '#64748b',
  );
  y += 6;

  writeLines('Summary', 13, 'bold', '#4f46e5');
  writeLines(ai.summary, 10.5);

  writeLines(`Time complexity: ${ai.timeComplexity}`, 10.5, 'normal', '#334155');
  writeLines(`Space complexity: ${ai.spaceComplexity}`, 10.5, 'normal', '#334155');

  section('Bugs', ai.bugs);
  section('Security Issues', ai.securityIssues);
  section('Performance Improvements', ai.performanceImprovements);
  section('Readability Suggestions', ai.readabilitySuggestions);
  section('Best Practices', ai.bestPractices);

  if (ai.cleanedCode) {
    y += 8;
    writeLines('Cleaned-up Code', 13, 'bold', '#4f46e5');
    doc.setFont('courier', 'normal');
    doc.setFontSize(9);
    doc.setTextColor('#0f172a');
    doc.splitTextToSize(ai.cleanedCode, maxWidth).forEach((line: string) => {
      ensureSpace(13);
      doc.text(line, margin, y);
      y += 13;
    });
  }

  const safeTitle = review.title.replace(/[^a-z0-9]+/gi, '-').slice(0, 40) || 'review';
  doc.save(`code-review-${safeTitle}.pdf`);
}
