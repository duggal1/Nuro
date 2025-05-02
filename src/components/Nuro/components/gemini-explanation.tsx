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

  // Generate variant summary for the header
  const variantSummary = `${variant?.reference || "?"}>${variant?.alternative || "?"} at position ${variant?.position || "Unknown"}`;
  
  // Format prediction for visual display
  const getPredictionDetails = () => {
    if (!variant?.prediction) return { label: "Unknown", color: "gray" };
    
    const prediction = variant.prediction.toLowerCase();
    if (prediction.includes("benign")) {
      return { 
        label: "Likely Benign", 
        color: isDark ? "emerald-400" : "emerald-500" 
      };
    } else if (prediction.includes("pathogenic")) {
      return { 
        label: "Pathogenic", 
        color: isDark ? "red-400" : "red-500" 
      };
    } else if (prediction.includes("uncertain")) {
      return { 
        label: "Uncertain Significance", 
        color: isDark ? "amber-400" : "amber-500" 
      };
    }
    return { 
      label: variant.prediction, 
      color: isDark ? "blue-400" : "blue-500" 
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
        color: isDark ? "emerald-400" : "emerald-500" 
      };
    } else if (confidence >= 70) {
      return { 
        level: "Moderate", 
        color: isDark ? "blue-400" : "blue-500" 
      };
    } else {
      return { 
        level: "Low", 
        color: isDark ? "amber-400" : "amber-500" 
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
      }
    }
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
        scale: { duration: 0.35, ease: "easeOut" }
      }
    }
  };

  useEffect(() => {
    async function getGeminiExplanation() {
      setIsLoading(true);
      setError(null);

      const prompt = `
      As a genetics expert, Break down this DNA variant and its impact for a clinician in a clear, no-nonsense way using these details:
      
      **Technical Details**:
      - **Gene**: ${geneSymbol || "Unknown"}
      - **Genomic Position**: ${variant?.position || "Not specified"}
      - **Nucleotide Change**: ${variant?.reference || "?"}>${variant?.alternative || "?"}
      - **Nuro Model Prediction**: ${variant?.prediction || "Not available"}
      - **Delta Score**: ${variant?.delta_score != null ? variant.delta_score.toFixed(6) : "Not available"} (shows predicted protein impact; negative usually means trouble)
      - **Model Confidence**: ${variant?.classification_confidence != null ? Math.round(variant.classification_confidence * 100) + "%" : "Not available"}
      
      **Instructions**:
      Write a short, clinician-friendly analysis in **MDX format**. Use ## for headers, - for bullet points, and **bold** for key terms. Explain tricky stuff in plain English, maybe with a quick analogy. Keep it accurate, cut the fluff, and handle missing data without freaking out. Ensure all sections are fully completed, especially the Technical Confidence Assessment.
      
      ## Gene Function Overview
      - Provide a one-line, human-friendly label for **${geneSymbol || "the gene"}**, e.g., "BARD1 -- DNA Repair Partner" or "GH1 -- Growth Hormone Maker."
      - Explain what the gene does (e.g., fixes DNA, keeps cells in check).
      - Give the full gene name and why it matters for health, in human terms.
      
      ## Variant Analysis
      - Describe the **nucleotide change** and where it is.
      - Decode the **Nuro model prediction** (e.g., Likely benign = probably fine, Pathogenic = bad news).
      - Clarify the **delta score** (how it affects the protein) and **confidence score** (how sure the model is).
      
      ## Clinical Implications
      - Sum up the **health impact** of this variant.
      - Note any **protein function** changes.
      - Mention **conditions** tied to **${geneSymbol || "the gene"}** mutations and if this variant matters for them.
      
      ## Technical Confidence Assessment
      - Judge the **confidence score** (e.g., >90% means it's solid).
      - Put the **delta score** in context (e.g., compare to -0.1 for nasty variants).
      - Stack this variant up against typical **benign** and **pathogenic** ones.
      
      **Guidelines**:
      - Keep it short, sharp, and geared for docs who want answers, not essays.
      - Stick to MDX syntax (headers, bold, bullets).
      - If data's missing, say so and give a best guess if you can.
      - No wild guesses—stick to the data and solid genetics know-how.
      - Complete all sections fully, no cutting off mid-sentence.
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
                    - Ensure proper spacing between list items`,
            user: prompt,
          }),
        });

        if (!response.body) {
          throw new Error("No response from Gemini");
        }

        const reader = response.body.getReader();
        let accumulatedText = "";
        const decoder = new TextDecoder();

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          accumulatedText += chunk;

          // Preprocessing step - make sure markdown is properly formatted
          let cleanedText = accumulatedText
            // Fix headers
            .replace(/###\s/g, "## ")
            // Fix bullet points with proper dash-space format
            .replace(/\n\*/g, "\n-")
            .replace(/\n-([^\s])/g, "\n- $1")
            // Ensure proper bold formatting
            .replace(/\*([^*]+)\*/g, "**$1**")
            // Add proper spacing between sections
            .replace(/\n## /g, "\n\n## ")
            .trim();

          // Enhanced formatting for MDX
          const serialized = await serialize(cleanedText, {
            mdxOptions: {
              remarkPlugins: [],
              rehypePlugins: [],
            },
            parseFrontmatter: false
          });
          
          setSerializedSource(serialized);
        }

      } catch (err) {
        console.error("Gemini Analysis Error:", err);
        setError("Failed to generate variant analysis. Please try again.");
      } finally {
        setIsLoading(false);
        // Set the first section as expanded by default
        setExpandedSection("Gene Function Overview");
      }
    }

    getGeminiExplanation();
  }, [variant, geneSymbol, isDark]);

  // Extract sections from MDX content to create collapsible sections
  const [sections, setSections] = useState<string[]>([
    "Gene Function Overview",
    "Variant Analysis",
    "Clinical Implications",
    "Technical Confidence Assessment"
  ]);

  // Custom section component to handle the collapsible sections
  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => {
    const isExpanded = expandedSection === title;
    
    return (
      <div className="mb-2">
        <button
          onClick={() => setExpandedSection(isExpanded ? null : title)}
          className={cn(
            "flex items-center justify-between w-full py-3 px-4 rounded-lg text-left font-medium transition-all duration-200",
            isExpanded 
              ? isDark ? "bg-gray-800/80" : "bg-gray-100/80" 
              : isDark ? "bg-black hover:bg-gray-900" : "bg-white hover:bg-gray-50",
            isDark ? "text-white" : "text-gray-800"
          )}
        >
          <span className="text-sm font-medium">{title}</span>
          <ChevronDown 
            className={cn(
              "h-4 w-4 transition-transform",
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
              <div className={cn(
                "py-4 px-5",
                isDark ? "text-gray-300" : "text-gray-600"
              )}>
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
    h2: ({ children }: { children: React.ReactNode }) => {
      // We'll filter these out and use our own section headers
      return null;
    },
    p: ({ children }: { children: React.ReactNode }) => (
      <p className={cn(
        "text-sm leading-relaxed my-2",
        isDark ? "text-gray-300" : "text-gray-600"
      )}>
        {children}
      </p>
    ),
    ul: ({ children }: { children: React.ReactNode }) => (
      <ul className="list-disc pl-5 space-y-2 my-3">
        {children}
      </ul>
    ),
    li: ({ children }: { children: React.ReactNode }) => (
      <li className={cn(
        "text-sm leading-relaxed",
        isDark ? "text-gray-300" : "text-gray-600"
      )}>
        {children}
      </li>
    ),
    strong: ({ children }: { children: React.ReactNode }) => (
      <strong className={cn(
        "font-medium",
        isDark ? "text-emerald-500" : "text-green-600"
      )}>
        {children}
      </strong>
    )
  };

  // Split the MDX content by sections
  const SectionedContent = () => {
    // This is a placeholder - in a real implementation you would parse the MDX 
    // to get the content for each section. For now, we'll just display all content
    // in each section for demonstration.
    return (
      <>
        {sections.map((section) => (
          <Section key={section} title={section}>
            <MDXRemote {...serializedSource} components={components} />
          </Section>
        ))}
      </>
    );
  };

  // Loading animation component - using original loader design
  const LoadingAnimation = () => (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className="relative">
        <div className={cn(
          "h-8 w-8 rounded-full",
          isDark ? "border-green-600/30" : "border-green-400/20"
        )} />
      </div>
      <Loader/>
    
      <p className={cn(
        "text-sm font-sans animate-pulse",
        isDark ? "text-gray-400" : "text-gray-500"
      )}>
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
          isDark 
            ? "bg-black border-gray-800" 
            : "bg-white border-gray-200"
        )}
      >
        {/* Header Section */}
        <div className={cn(
          "p-5 border-b flex flex-col gap-2.5",
          isDark ? "border-gray-800/80" : "border-gray-100"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn(
                "flex items-center justify-center h-8 w-8 rounded-full",
                isDark ? "bg-emerald-500/10" : "bg-emerald-50"
              )}>
                <Bot className={cn("h-4 w-4", isDark ? "text-emerald-400" : "text-emerald-500")} />
              </div>
              <h3 className={cn(
                "font-medium text-base",
                isDark ? "text-white" : "text-gray-900"
              )}>
                AI Analysis
              </h3>
            </div>
            
            {/* Prediction Badge */}
            {!isLoading && !error && variant?.prediction && (
              <div className={cn(
                "px-2.5 py-1 rounded-full text-xs font-medium",
                `text-${predictionDetails.color}`,
                isDark ? `bg-${predictionDetails.color.split("-")[0]}-900/20` : `bg-${predictionDetails.color.split("-")[0]}-50`
              )}>
                {predictionDetails.label}
              </div>
            )}
          </div>
          
          {/* Variant info */}
          {!isLoading && !error && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <h4 className={cn(
                  "text-sm font-medium",
                  isDark ? "text-gray-300" : "text-gray-700"
                )}>
                  {geneSymbol || "Unknown gene"}
                </h4>
                <div className={cn(
                  "px-2 py-0.5 rounded-md text-xs",
                  isDark ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-600"
                )}>
                  {variantSummary}
                </div>
              </div>
              
              {/* Metrics */}
              <div className="flex flex-wrap gap-3 mt-1">
                {/* Delta Score */}
                {variant?.delta_score != null && (
                  <div className="flex items-center gap-1.5">
                    <div className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      variant.delta_score < -0.1 
                        ? (isDark ? "bg-red-400" : "bg-red-500")
                        : variant.delta_score < 0 
                          ? (isDark ? "bg-amber-400" : "bg-amber-500")
                          : (isDark ? "bg-emerald-400" : "bg-emerald-500")
                    )} />
                    <span className={cn(
                      "text-xs",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>
                      Delta score: <span className={cn(
                        "font-medium",
                        isDark ? "text-gray-200" : "text-gray-700"
                      )}>{variant.delta_score.toFixed(6)}</span>
                    </span>
                  </div>
                )}
                
                {/* Confidence */}
                {variant?.classification_confidence != null && (
                  <div className="flex items-center gap-1.5">
                    <div className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      `bg-${confidenceDetails.color}`
                    )} />
                    <span className={cn(
                      "text-xs",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>
                      Confidence: <span className={cn(
                        "font-medium",
                        isDark ? "text-gray-200" : "text-gray-700"
                      )}>{Math.round(variant.classification_confidence * 100)}%</span>
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
            <div className={cn(
              "flex items-center gap-3 p-4 m-4 rounded-lg",
              isDark 
                ? "bg-red-900/10 text-red-300 border border-red-900/20" 
                : "bg-red-50 text-red-600 border border-red-100"
            )}>
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          ) : serializedSource ? (
            <div className="p-4">
              <SectionedContent />
            </div>
          ) : null}
        </CardContent>
      </Card>
    </motion.div>
  );
}