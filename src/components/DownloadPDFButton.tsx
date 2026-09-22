// src/components/DownloadPDFButton.tsx

import { useState } from "react";
import { Download, Loader2, FileCheck } from "lucide-react";
import { Button } from "./ui/button";
import { jsPDF } from "jspdf";
import { toast } from "sonner";

export interface RoadmapResource {
  type: string;
  title: string;
  provider: string;
  url: string;
}

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  status: string;
  resources?: RoadmapResource[];
  mentorTip?: string;
}

interface DownloadPDFButtonProps {
  roadmapTitle?: string;
  careerGoal?: string;
  steps?: RoadmapStep[];
  className?: string;
}

export function DownloadPDFButton({
  roadmapTitle = "Career Roadmap",
  careerGoal,
  steps = [],
  className = "",
}: DownloadPDFButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const generatePDF = async () => {
    if (!steps || steps.length === 0) {
      toast.error("No roadmap steps to export yet. Generate or load a roadmap first.");
      return;
    }

    try {
      setIsExporting(true);

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 16;
      const contentWidth = pageWidth - margin * 2; // 178mm
      const bottomLimit = pageHeight - 20;

      let y = margin;

      const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > bottomLimit) {
          doc.addPage();
          y = margin + 5;
        }
      };

      // --- HEADER SECTION ---
      // Brand Bar
      doc.setFillColor(15, 17, 23);
      doc.rect(margin, y, contentWidth, 24, "F");

      // Brand Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text("NAVIXO", margin + 6, y + 10);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(190, 170, 255);
      doc.text("CAREER ROADMAP & EXECUTION PLAN", margin + 6, y + 17);

      // Date badge on the right
      doc.setFontSize(8);
      doc.setTextColor(180, 190, 210);
      const dateText = new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      doc.text(`Generated: ${dateText}`, pageWidth - margin - 6, y + 10, {
        align: "right",
      });

      y += 32;

      // --- ROADMAP TITLE & SUMMARY ---
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(20, 25, 40);
      const titleLines = doc.splitTextToSize(roadmapTitle, contentWidth);
      doc.text(titleLines, margin, y);
      y += titleLines.length * 8 + 2;

      if (careerGoal && careerGoal !== roadmapTitle) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        const goalLines = doc.splitTextToSize(`Target Career Goal: ${careerGoal}`, contentWidth);
        doc.text(goalLines, margin, y);
        y += goalLines.length * 5 + 4;
      }

      // Summary Stats Pills
      const completedSteps = steps.filter((s) => s.status === "done").length;
      doc.setFillColor(243, 244, 246);
      doc.roundedRect(margin, y, contentWidth, 12, 2, 2, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(75, 85, 99);
      doc.text(
        `TOTAL PHASES: ${steps.length}   |   COMPLETED: ${completedSteps}/${steps.length}   |   PROGRESS: ${Math.round((completedSteps / (steps.length || 1)) * 100)}%`,
        margin + 4,
        y + 8,
      );

      y += 18;

      // Divider line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;

      // --- STEPS LIST ---
      steps.forEach((step, idx) => {
        const stepNum = String(idx + 1).padStart(2, "0");
        const levelText = (step.level || "BEGINNER").toUpperCase();
        const durationText = (step.duration || "Self-Paced").toUpperCase();

        // Calculate needed height for this step card
        const titleText = `${stepNum}. ${step.title}`;
        const descLines = doc.splitTextToSize(step.description || "", contentWidth - 8);
        const tipLines = step.mentorTip
          ? doc.splitTextToSize(`Mentor Tip: ${step.mentorTip}`, contentWidth - 12)
          : [];
        const resources = step.resources ?? [];

        const estimatedStepHeight =
          12 +
          descLines.length * 4.5 +
          (tipLines.length ? tipLines.length * 4 + 8 : 0) +
          (resources.length ? resources.length * 8 + 6 : 0) +
          10;

        checkPageBreak(Math.min(estimatedStepHeight, 60));

        // Step container top separator
        doc.setFillColor(249, 250, 251);
        doc.roundedRect(margin, y, contentWidth, 8, 1.5, 1.5, "F");

        // Step Title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(30, 41, 59);
        doc.text(titleText, margin + 3, y + 5.5);

        // Level and duration badge
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(124, 58, 237); // Purple
        doc.text(
          `[${levelText}] · ${durationText}`,
          pageWidth - margin - 3,
          y + 5.5,
          { align: "right" },
        );

        y += 12;

        // Step Description
        if (descLines.length > 0) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(51, 65, 85);
          doc.text(descLines, margin + 4, y);
          y += descLines.length * 4.2 + 3;
        }

        // Mentor Tip Box
        if (tipLines.length > 0) {
          checkPageBreak(tipLines.length * 4 + 8);
          const boxHeight = tipLines.length * 4 + 4;
          doc.setFillColor(245, 243, 255); // Very light violet
          doc.setDrawColor(221, 214, 254);
          doc.roundedRect(margin + 2, y, contentWidth - 4, boxHeight, 1.5, 1.5, "FD");

          doc.setFont("helvetica", "italic");
          doc.setFontSize(8);
          doc.setTextColor(109, 40, 217);
          doc.text(tipLines, margin + 6, y + 4.5);
          y += boxHeight + 4;
        }

        // Resources Section
        if (resources.length > 0) {
          checkPageBreak(resources.length * 7 + 6);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.setTextColor(100, 116, 139);
          doc.text("CURATED RESOURCES:", margin + 4, y);
          y += 4;

          resources.forEach((res) => {
            checkPageBreak(7);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(59, 130, 246); // Blue link color
            const resText = `• [${res.type?.toUpperCase() || "RESOURCE"}] ${res.title} (${res.provider || "Web"})`;
            const shortText = doc.splitTextToSize(resText, contentWidth - 8)[0];
            doc.text(shortText, margin + 6, y);

            if (res.url) {
              // Add clickable hyperlink annotation
              doc.link(margin + 6, y - 3, contentWidth - 12, 4, {
                url: res.url,
              });
            }
            y += 4.5;
          });
          y += 2;
        }

        y += 4; // Space between steps
      });

      // --- FOOTERS FOR ALL PAGES ---
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);

        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(margin, 285, pageWidth - margin, 285);

        doc.text(
          "Navixo Career Navigation · Execution-first personalized career planning",
          margin,
          290,
        );
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, 290, {
          align: "right",
        });
      }

      // Download file
      const safeFilename = `${roadmapTitle.trim().replace(/[^a-zA-Z0-9_-]/g, "_")}_Navixo_Roadmap.pdf`;
      doc.save(safeFilename);

      toast.success("Roadmap PDF exported successfully!");
    } catch (err: any) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={generatePDF}
      disabled={isExporting}
      className={`gap-1.5 md:gap-2 text-xs md:text-sm flex-1 sm:flex-none transition-colors ${className}`}
    >
      {isExporting ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
          <span className="hidden sm:inline">Exporting PDF…</span>
          <span className="sm:hidden">Exporting…</span>
        </>
      ) : (
        <>
          <Download className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden sm:inline">Download PDF</span>
          <span className="sm:hidden">PDF</span>
        </>
      )}
    </Button>
  );
}

export default DownloadPDFButton;
