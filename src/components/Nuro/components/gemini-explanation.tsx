/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { serialize } from "next-mdx-remote/serialize";
import { MDXRemote } from "next-mdx-remote";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { Bot, AlertTriangle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "@/components/Loader";

interface GeminiExplanationProps {
  variant: {
    position: number;
    reference: string;
    alternative: string;
    delta_score: number;
    prediction: string;
    classification_confidence: number;
  };
  geneSymbol: string;
}

export function GeminiExplanation({ variant, geneSymbol }: GeminiExplanationProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [serializedSource, setSerializedSource] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [sectionContents, setSectionContents] = useState<{ [key: string]: any }>({});

  // Generate variant summary for the header
  const variantSummary = `${variant?.reference || "?"}>${variant?.alternative || "?"} at position ${variant?.position || "Unknown"}`;

  // Format prediction for visual display
  const getPredictionDetails = () => {
    if (!variant?.prediction) return { label: "Unknown", color: "gray" };

    const prediction = variant.prediction.toLowerCase();
    if (prediction.includes("benign")) {
      return {
        label: "Likely Benign",
        color: isDark ? "emerald-400" : "emerald-500",
      };
    } else if (prediction.includes("pathogenic")) {
      return {
        label: "Pathogenic",
        color: isDark ? "red-400" : "red-500",
      };
    } else if (prediction.includes("uncertain")) {
      return {
        label: "Uncertain Significance",
        color: isDark ? "amber-400" : "amber-500",
      };
    }
    return {
      label: variant.prediction,
      color: isDark ? "blue-400" : "blue-500",
    };
  };

  const predictionDetails = getPredictionDetails();

  // Format confidence for visual display
  const getConfidenceLevel = () => {
    if (variant?.classification_confidence == null) return { level: "Unknown", color: "gray" };

    const confidence = variant.classification_confidence * 100;
    if (confidence >= 90) {
      return {
        level: "High",
        color: isDark ? "emerald-400" : "emerald-500",
      };
    } else if (confidence >= 70) {
      return {
        level: "Moderate",
        color: isDark ? "blue-400" : "blue-500",
      };
    } else {
      return {
        level: "Low",
        color: isDark ? "amber-400" : "amber-500",
      };
    }
  };

  const confidenceDetails = getConfidenceLevel();

  // Loading animation constants
  const loadingVariants = {
    initial: { pathLength: 0, opacity: 0 },
    animate: {
      pathLength: 1,
      opacity: 1,
      transition: {
        duration: 2,
        ease: "easeInOut",
        repeat: Infinity,
      },
    },
  };

  // Section expansion animation
  const contentVariants = {
    collapsed: { height: 0, opacity: 0, scale: 0.98 },
    expanded: {
      height: "auto",
      opacity: 1,
      scale: 1,
      transition: {
        height: { duration: 0.4, ease: [0.33, 1, 0.68, 1] },
        opacity: { duration: 0.35, ease: "easeOut" },
        scale: { duration: 0.35, ease: "easeOut" },
      },
    },
  };

  useEffect(() => {
    async function getGeminiExplanation() {
      setIsLoading(true);
      setError(null);

      const prompt = `


    As a genetics expert with a PhD-level understanding of molecular biology, provide a clear, engaging, and scientifically rigorous analysis of a DNA variant for a clinician. Use the provided data as a foundation to craft a narrative that explains the variant’s biological and clinical significance in a professional, friendly, and calm tone. The explanation must be 100% scientifically accurate, accessible to non-experts (e.g., clinicians, patients), and avoid directly repeating raw model outputs. Instead, interpret the data to describe mechanisms and implications in a bio-friendly way, using analogies where helpful. Output in **MDX format** with ## headers, - bullet points, and **bold** for key terms.

**Input Data**:
- **Gene**: ${geneSymbol || "Unknown"}
- **Genomic Position**: ${variant?.position || "Not specified"}
- **Nucleotide Change**: ${variant?.reference || "?"}>${variant?.alternative || "?"}
- **Model Prediction**: ${variant?.prediction || "Not available"}
- **Delta Score**: ${variant?.delta_score != null ? variant.delta_score.toFixed(6) : "Not available"} (indicates predicted protein impact; negative suggests disruption)
- **Model Confidence**: ${variant?.classification_confidence != null ? Math.round(variant.classification_confidence * 100) + "%" : "Not available"}

**Instructions**:
Write a concise, clinician-friendly analysis that weaves the input data into a cohesive, PhD-level biological narrative. Do not parrot raw data (e.g., “Prediction: Pathogenic” or “Delta Score: -0.5”). Instead, use the data to explain the variant’s molecular effects, cellular consequences, and clinical relevance in plain English, supported by rigorous science. Ensure **all sections** are fully completed with meaningful, non-repetitive content. Handle missing data by acknowledging it and providing reasoned, scientifically grounded estimates where possible. Use analogies to simplify complex concepts without sacrificing accuracy.

## Gene Function Overview
- Provide a one-line, human-friendly label for **${geneSymbol || "the gene"}**, e.g., “BRCA1 -- DNA Repair Guardian” or “CFTR -- Chloride Channel Controller.”
- Describe the gene’s **biological role** (e.g., DNA repair, cell signaling) at a molecular and cellular level, explaining how it contributes to normal physiology.
- Include the full gene name and its **health significance**, linking its function to disease prevention or cellular homeostasis in clear, accessible terms.

## Variant Analysis
- Explain the **nucleotide change** in terms of its molecular impact (e.g., does it alter an amino acid, introduce a stop codon, or affect splicing?). Describe its genomic location’s significance (e.g., coding region, regulatory element).
- Interpret the model’s prediction by discussing the **biological basis** for the variant’s classification (e.g., why it’s likely harmful or benign, based on protein or cellular effects). Do not directly state the prediction (e.g., “Pathogenic”).
- Use the delta score to describe the **protein impact** (e.g., destabilizes protein structure, impairs function) and the confidence score to assess **prediction reliability**, explaining what these metrics imply biologically.

## Clinical Implications
- Summarize the variant’s **health impact**, connecting molecular changes to potential disease risks or benign outcomes.
- Detail how the variant alters **protein function** or cellular processes (e.g., disrupts enzyme activity, impairs signaling pathways).
- Identify **conditions** linked to **${geneSymbol || "the gene"}** mutations and evaluate whether this variant contributes to these risks, citing relevant biological mechanisms.

## Technical Confidence Assessment
- Assess the **reliability** of the analysis based on the confidence score, explaining what high or low confidence means for clinical decision-making.
- Contextualize the **protein impact** (e.g., compare the variant’s effects to known pathogenic or benign variants in the gene).
- Discuss how this variant aligns with **typical variant profiles** (e.g., does it resemble known disease-causing mutations or harmless polymorphisms?), grounding the comparison in biological principles.

**Guidelines**:
- Craft a narrative that feels like a PhD-level geneticist explaining the variant to a clinician or patient: professional, calm, and bio-friendly.
- Use proper MDX syntax (## headers, - bullets, **bold**).
- Simplify complex terms (e.g., “nucleotide change” as “DNA letter swap”) using analogies (e.g., protein as a machine, variant as a faulty part).
- Avoid speculation; base explanations on provided data and established molecular biology.
- Ensure all sections are complete, non-repetitive, and free of truncated content.
- Make the science engaging and accessible while maintaining 100% biological accuracy, as if written by a genetics expert for a broad audience.




      `;

      try {
        const response = await fetch("/api/prediction", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            system: `You are an expert genetics analyst specializing in DNA variant interpretation.
                    You must follow proper Markdown formatting conventions exactly:
                    - Use ## for section headers (not ###)
                    - ALWAYS use proper bullet points with a dash and space (- )
                    - Bold important terms with **double asterisks**
                    - Be concise and clinically relevant
                    - Ensure proper spacing between list items
                    - Complete all requested sections fully without omission`,
            user: prompt,
          }),
        });

        if (!response.body) {
          throw new Error("No response from API");
        }

        const reader = response.body.getReader();
        let accumulatedText = "";
        const decoder = new TextDecoder();

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          accumulatedText += chunk;

          // Preprocess markdown for consistent formatting
          let cleanedText = accumulatedText
            .replace(/###\s/g, "## ")
            .replace(/\n\*/g, "\n- ")
            .replace(/\n-([^\s])/g, "\n- $1")
            .replace(/\*([^*]+)\*/g, "**$1**")
            .replace(/\n## /g, "\n\n## ")
            .trim();

          // Split content into sections
          const sectionRegex = /(## .+?)(?=\n## |$)/gs;
          const sections = cleanedText.match(sectionRegex) || [];
          const sectionMap: { [key: string]: string } = {};

          for (const section of sections) {
            const headerMatch = section.match(/^## (.+)/m);
            const header = headerMatch ? headerMatch[1].trim() : "";
            const content = section.replace(/^## .+\n/, "").trim();
            if (header && content) {
              sectionMap[header] = content;
            }
          }

          // Serialize each section individually
          const serializedSections: { [key: string]: any } = {};
          for (const [header, content] of Object.entries(sectionMap)) {
            const serialized = await serialize(content, {
              mdxOptions: {
                remarkPlugins: [],
                rehypePlugins: [],
              },
              parseFrontmatter: false,
            });
            serializedSections[header] = serialized;
          }

          setSectionContents(serializedSections);
          setSerializedSource({ compiledSource: cleanedText }); // Fallback for error checking
        }
      } catch (err) {
        console.error("Analysis Error:", err);
        setError("Failed to generate variant analysis. Please try again.");
      } finally {
        setIsLoading(false);
        setExpandedSection("Gene Function Overview");
      }
    }

    getGeminiExplanation();
  }, [variant, geneSymbol, isDark]);

  // Define sections
  const sections = [
    "Gene Function Overview",
    "Variant Analysis",
    "Clinical Implications",
    "Technical Confidence Assessment",
  ];

  // Custom section component
  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => {
    const isExpanded = expandedSection === title;

    return (
      <div className="mb-3">
        <button
          onClick={() => setExpandedSection(isExpanded ? null : title)}
          className={cn(
            "flex items-center justify-between w-full py-3 px-4 rounded-lg text-left font-medium transition-all duration-200",
            isExpanded
              ? isDark
                ? "bg-gray-800/80"
                : "bg-gray-100/80"
              : isDark
                ? "bg-black hover:bg-gray-900"
                : "bg-white hover:bg-gray-50",
            isDark ? "text-white" : "text-gray-800"
          )}
        >
          <span className="text-base font-medium">{title}</span>
          <ChevronDown
            className={cn(
              "h-5 w-5 transition-transform",
              isExpanded ? "transform rotate-180" : "",
              isDark ? "text-gray-400" : "text-gray-500"
            )}
          />
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              variants={contentVariants}
              className="overflow-hidden origin-top"
            >
              <div
                className={cn("py-4 px-5", isDark ? "text-gray-300" : "text-gray-600")}
              >
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Custom MDX components
  const components = {
    h2: () => null,
    p: ({ children }: { children: React.ReactNode }) => (
      <p
        className={cn(
          "text-base leading-relaxed my-3",
          isDark ? "text-gray-300" : "text-gray-600"
        )}
      >
        {children}
      </p>
    ),
    ul: ({ children }: { children: React.ReactNode }) => (
      <ul className="list-disc pl-6 space-y-2 my-4">{children}</ul>
    ),
    li: ({ children }: { children: React.ReactNode }) => (
      <li
        className={cn(
          "text-base leading-relaxed",
          isDark ? "text-gray-300" : "text-gray-600"
        )}
      >
        {children}
      </li>
    ),
    strong: ({ children }: { children: React.ReactNode }) => (
      <strong
        className={cn("font-medium", isDark ? "text-emerald-500" : "text-green-600")}
      >
        {children}
      </strong>
    ),
  };

  // Render sectioned content
  const SectionedContent = () => {
    return (
      <>
        {sections.map((section) => (
          <Section key={section} title={section}>
            {sectionContents[section] ? (
              <MDXRemote {...sectionContents[section]} components={components} />
            ) : (
              <p
                className={cn(
                  "text-base",
                  isDark ? "text-gray-400" : "text-gray-500"
                )}
              >
                No data available for this section.
              </p>
            )}
          </Section>
        ))}
      </>
    );
  };

  // Loading animation component
  const LoadingAnimation = () => (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className="relative">
        <div
          className={cn(
            "h-8 w-8 rounded-full",
            isDark ? "border-green-600/30" : "border-green-400/20"
          )}
        />
      </div>
      <Loader />

      <p
        className={cn(
          "text-base font-sans animate-pulse",
          isDark ? "text-gray-400" : "text-gray-500"
        )}
      >
        Analyzing variant implications...
      </p>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="w-full"
    >
      <Card
        className={cn(
          "overflow-hidden border shadow-lg rounded-xl",
          isDark ? "bg-black border-gray-800" : "bg-white border-gray-200"
        )}
      >
        {/* Header Section */}
        <div
          className={cn(
            "p-5 border-b flex flex-col gap-2.5",
            isDark ? "border-gray-800/80" : "border-gray-100"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex items-center justify-center h-8 w-8 rounded-full",
                  isDark ? "bg-emerald-500/10" : "bg-emerald-50"
                )}
              >
                <Bot
                  className={cn(
                    "h-5 w-5",
                    isDark ? "text-emerald-400" : "text-emerald-500"
                  )}
                />
              </div>
              <h3
                className={cn(
                  "font-medium text-lg",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                AI Analysis
              </h3>
            </div>

            {/* Prediction Badge */}
            {!isLoading && !error && variant?.prediction && (
              <div
                className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium",
                  `text-${predictionDetails.color}`,
                  isDark
                    ? `bg-${predictionDetails.color.split("-")[0]}-900/20`
                    : `bg-${predictionDetails.color.split("-")[0]}-50`
                )}
              >
                {predictionDetails.label}
              </div>
            )}
          </div>

          {/* Variant info */}
          {!isLoading && !error && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <h4
                  className={cn(
                    "text-base font-medium",
                    isDark ? "text-gray-300" : "text-gray-700"
                  )}
                >
                  {geneSymbol || "Unknown gene"}
                </h4>
                <div
                  className={cn(
                    "px-2 py-1 rounded-md text-sm",
                    isDark ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-600"
                  )}
                >
                  {variantSummary}
                </div>
              </div>

              {/* Metrics */}
              <div className="flex flex-wrap gap-4 mt-1">
                {/* Delta Score */}
                {variant?.delta_score != null && (
                  <div className="flex items-center gap-1.5">
                    <div
                      className={cn(
                        "h-2 w-2 rounded-full",
                        variant.delta_score < -0.1
                          ? isDark
                            ? "bg-red-400"
                            : "bg-red-500"
                          : variant.delta_score < 0
                            ? isDark
                              ? "bg-amber-400"
                              : "bg-amber-500"
                            : isDark
                              ? "bg-emerald-400"
                              : "bg-emerald-500"
                      )}
                    />
                    <span
                      className={cn(
                        "text-sm",
                        isDark ? "text-gray-400" : "text-gray-500"
                      )}
                    >
                      Delta score:{" "}
                      <span
                        className={cn(
                          "font-medium",
                          isDark ? "text-gray-200" : "text-gray-700"
                        )}
                      >
                        {variant.delta_score.toFixed(6)}
                      </span>
                    </span>
                  </div>
                )}

                {/* Confidence */}
                {variant?.classification_confidence != null && (
                 

 <div className="flex items-center gap-1.5">
                    <div
                      className={cn(
                        "h-2 w-2 rounded-full",
                        `bg-${confidenceDetails.color}`
                      )}
                    />
                    <span
                      className={cn(
                        "text-sm",
                        isDark ? "text-gray-400" : "text-gray-500"
                      )}
                    >
                      Confidence:{" "}
                      <span
                        className={cn(
                          "font-medium",
                          isDark ? "text-gray-200" : "text-gray-700"
                        )}
                      >
                        {Math.round(variant.classification_confidence * 100)}%
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <CardContent className="p-0">
          {isLoading ? (
            <LoadingAnimation />
          ) : error ? (
            <div
              className={cn(
                "flex items-center gap-3 p-4 m-4 rounded-lg",
                isDark
                  ? "bg-red-900/10 text-red-300 border border-red-900/20"
                  : "bg-red-50 text-red-600 border border-red-100"
              )}
            >
              <AlertTriangle className="h-6 w-6 flex-shrink-0" />
              <p className="text-base">{error}</p>
            </div>
          ) : Object.keys(sectionContents).length > 0 ? (
            <div className="p-5">
              <SectionedContent />
            </div>
          ) : (
            <div
              className={cn(
                "p-5 text-base",
                isDark ? "text-gray-400" : "text-gray-500"
              )}
            >
              No analysis available.
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

