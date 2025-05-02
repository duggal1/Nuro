/* eslint-disable react/display-name */

"use client";

import {
  type AnalysisResult,
  analyzeVariantWithAPI,
  type ClinvarVariant,
  type GeneBounds,
  type GeneFromSearch,
} from "@/utils/genome-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  getClassificationColorClasses,
  getNucleotideColorClass,
} from "@/utils/coloring-utils";
import { Button } from "@/components/ui/button";
import { Zap, Dna, FlaskConical, ArrowRight, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { GeminiExplanation } from "./gemini-explanation";

export interface VariantAnalysisHandle {
  focusAlternativeInput: () => void;
}

interface VariantAnalysisProps {
  gene: GeneFromSearch;
  genomeId: string;
  chromosome: string;
  clinvarVariants: Array<ClinvarVariant>;
  referenceSequence: string | null;
  sequencePosition: number | null;
  geneBounds: GeneBounds | null;
}

const VariantAnalysis = forwardRef<VariantAnalysisHandle, VariantAnalysisProps>(
  (
    {
      gene,
      genomeId,
      chromosome,
      clinvarVariants = [],
      referenceSequence,
      sequencePosition,
      geneBounds,
    }: VariantAnalysisProps,
    ref,
  ) => {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    
    const [variantPosition, setVariantPosition] = useState<string>(
      geneBounds?.min?.toString() || "",
    );
    const [variantReference, setVariantReference] = useState("");
    const [variantAlternative, setVariantAlternative] = useState("");
    const [variantResult, setVariantResult] = useState<AnalysisResult | null>(
      null,
    );
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [variantError, setVariantError] = useState<string | null>(null);
    const alternativeInputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      focusAlternativeInput: () => {
        if (alternativeInputRef.current) {
          alternativeInputRef.current.focus();
        }
      },
    }));

    useEffect(() => {
      if (sequencePosition && referenceSequence) {
        setVariantPosition(String(sequencePosition));
        setVariantReference(referenceSequence);
      }
    }, [sequencePosition, referenceSequence]);

    const handlePositionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setVariantPosition(e.target.value);
      setVariantReference("");
    };

    const handleVariantSubmit = async (pos: string, alt: string) => {
      const position = parseInt(pos);
      if (isNaN(position)) {
        setVariantError("Please enter a valid position number");
        toast.error("Please enter a valid position number", {
          icon: <AlertTriangle className="h-4 w-4" />,
          description: "Position must be a valid numeric value."
        });
        return;
      }

      const validNucleotides = /^[ATGC]$/;
      if (!validNucleotides.test(alt)) {
        setVariantError("Nucleotides must be A, C, G or T");
        toast.error("Nucleotides must be A, C, G or T", {
          icon: <AlertTriangle className="h-4 w-4" />,
          description: "Only A, C, G, or T are valid nucleotide values."
        });
        return;
      }

      setIsAnalyzing(true);
      setVariantError(null);

      try {
        const data = await analyzeVariantWithAPI({
          position,
          alternative: alt,
          genomeId,
          chromosome,
        });
        setVariantResult(data);
        toast.success("Variant analysis complete", {
          icon: <Dna className="h-4 w-4" />,
          description: `Prediction: ${data.prediction}`
        });
      } catch (err) {
        console.error(err);
        setVariantError("Failed to analyze variant");
        toast.error("Failed to analyze variant", {
          icon: <AlertTriangle className="h-4 w-4" />,
          description: "There was an error analyzing this variant. Please try again."
        });
      } finally {
        setIsAnalyzing(false);
      }
    };

    const matchedVariant = variantPosition
      ? clinvarVariants
          .filter(
            (variant) =>
              variant?.variation_type
                ?.toLowerCase()
                .includes("single nucleotide") &&
              parseInt(variant?.location?.replaceAll(",", "")) ===
                parseInt(variantPosition.replaceAll(",", "")),
          )[0]
      : null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={cn(
          "border-none shadow-xl rounded-2xl overflow-hidden",
          isDark 
            ? "bg-gradient-to-b from-gray-900/60 to-black/90 backdrop-blur-md text-white" 
            : "bg-gradient-to-b from-white to-gray-50/90 backdrop-blur-md text-gray-900"
        )}>
          <CardHeader className={cn(
            "pt-6 pb-3",
            isDark ? "border-b border-gray-800/50" : "border-b border-gray-200/30"
          )}>
            <CardTitle className={cn(
              "flex items-center gap-2 font-serif text-lg",
              isDark ? "text-white" : "text-gray-900"
            )}>
              <FlaskConical className="h-5 w-5 text-indigo-500" />
              Variant Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="relative py-6">
            <div className="absolute inset-0 pointer-events-none opacity-10">
              <div className={cn(
                "absolute -inset-[40%] blur-3xl rounded-full",
                isDark ? "bg-indigo-900/30" : "bg-indigo-100/80"
              )} />
            </div>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className={cn(
                "mb-6 text-sm font-sans relative z-10",
                isDark ? "text-gray-400" : "text-gray-600"
              )}
            >
              Predict the impact of genetic variants using the Evo2 deep learning model.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="flex flex-wrap items-end gap-4 relative z-10"
            >
              <div>
                <label className={cn(
                  "mb-2 block text-xs font-sans",
                  isDark ? "text-gray-400" : "text-gray-600"
                )}>
                  Position
                </label>
                <Input
                  value={variantPosition}
                  onChange={handlePositionChange}
                  className={cn(
                    "h-9 w-36 text-xs font-sans transition-all",
                    isDark 
                      ? "border-gray-800 bg-gray-900/50 focus:border-indigo-700 focus:ring-indigo-700/30" 
                      : "border-gray-200 focus:border-indigo-600 focus:ring-indigo-600/20"
                  )}
                />
              </div>
              <div>
                <label className={cn(
                  "mb-2 block text-xs font-sans",
                  isDark ? "text-gray-400" : "text-gray-600"
                )}>
                  Alternative (variant)
                </label>
                <Input
                  ref={alternativeInputRef}
                  value={variantAlternative}
                  onChange={(e) =>
                    setVariantAlternative(e.target.value.toUpperCase())
                  }
                  className={cn(
                    "h-9 w-36 text-xs font-sans transition-all",
                    isDark 
                      ? "border-gray-800 bg-gray-900/50 focus:border-indigo-700 focus:ring-indigo-700/30" 
                      : "border-gray-200 focus:border-indigo-600 focus:ring-indigo-600/20"
                  )}
                  placeholder="e.g., T"
                  maxLength={1}
                />
              </div>
              {variantReference && (
                <div className={cn(
                  "flex items-center gap-2 text-xs font-sans h-9",
                  isDark ? "text-gray-300" : "text-gray-700"
                )}>
                  <span>Substitution</span>
                  <span
                    className={`font-medium ${getNucleotideColorClass(variantReference)}`}
                  >
                    {variantReference}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5" />
                  <span
                    className={`font-medium ${getNucleotideColorClass(variantAlternative)}`}
                  >
                    {variantAlternative ? variantAlternative : "?"}
                  </span>
                </div>
              )}
              <motion.div 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  disabled={isAnalyzing || !variantPosition || !variantAlternative}
                  className={cn(
                    "h-9 cursor-pointer text-xs font-sans text-white",
                    isDark
                    ? "bg-gradient-to-r from-purple-700  to-blue-700 hover:brightness-125"
                    : "bg-gradient-to-r from-blue-600  to-indigo-600 hover:brightness-125"
                  
                  )}
                  onClick={() =>
                    handleVariantSubmit(
                      variantPosition.replaceAll(",", ""),
                      variantAlternative,
                    )
                  }
                >
                  {isAnalyzing ? (
                    <>
                      <motion.div 
                        className="mr-2 h-3 w-3 rounded-full border-2 border-white/30 border-t-white"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Dna className="mr-2 h-3.5 w-3.5" />
                      Analyze variant
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.div>

            {matchedVariant && (() => {
              const refAltMatch = matchedVariant.title.match(/(\w)>(\w)/);

              let ref = null;
              let alt = null;
              if (refAltMatch && refAltMatch.length === 3) {
                ref = refAltMatch[1];
                alt = refAltMatch[2];
              }

              if (!ref || !alt) return null;

              return (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  key={matchedVariant.clinvar_id}
                  className={cn(
                    "mt-6 rounded-xl p-5 relative overflow-hidden",
                    isDark 
                      ? "border border-indigo-900/20 bg-indigo-950/10" 
                      : "border border-indigo-100 bg-indigo-50/50"
                  )}
                >
                  <div className="absolute inset-0 pointer-events-none opacity-5">
                    <div className={cn(
                      "absolute -inset-[40%] blur-3xl rounded-full",
                      isDark ? "bg-indigo-800" : "bg-indigo-300"
                    )} />
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <h4 className={cn(
                      "text-sm font-medium font-sans flex items-center gap-2",
                      isDark ? "text-indigo-300" : "text-indigo-700"
                    )}>
                      <Dna className="h-4 w-4" />
                      Known Variant Detected
                    </h4>
                    <span className={cn(
                      "text-xs font-sans",
                      isDark ? "text-gray-400" : "text-gray-600"
                    )}>
                      Position: {matchedVariant.location}
                    </span>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2 relative z-10">
                    <div className="space-y-3">
                      <div className={cn(
                        "mb-2 text-xs font-medium font-sans",
                        isDark ? "text-gray-300" : "text-gray-700"
                      )}>
                        Variant Details
                      </div>
                      <div className="text-sm font-sans">{matchedVariant.title}</div>
                      <div className="mt-3 text-sm font-sans">
                        {gene?.symbol} {variantPosition}{" "}
                        <span className="font-mono">
                          <span className={getNucleotideColorClass(ref)}>
                            {ref}
                          </span>
                          <span>{">"}</span>
                          <span className={getNucleotideColorClass(alt)}>
                            {alt}
                          </span>
                        </span>
                      </div>
                      <div className={cn(
                        "mt-3 text-xs font-sans",
                        isDark ? "text-gray-400" : "text-gray-600"
                      )}>
                        ClinVar classification{" "}
                        <span
                          className={`ml-1 rounded-md px-2 py-0.5 ${getClassificationColorClasses(matchedVariant.classification)}`}
                        >
                          {matchedVariant.classification || "Unknown"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-end">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          disabled={isAnalyzing}
                          variant="outline"
                          size="sm"
                          className={cn(
                            "h-8 cursor-pointer text-xs font-sans",
                            isDark 
                              ? "border-indigo-900/30 bg-indigo-950/20 text-indigo-300 hover:bg-indigo-900/40" 
                              : "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                          )}
                          onClick={() => {
                            setVariantAlternative(alt);
                            handleVariantSubmit(
                              variantPosition.replaceAll(",", ""),
                              alt,
                            );
                          }}
                        >
                          {isAnalyzing ? (
                            <>
                              <motion.div 
                                className={cn(
                                  "mr-2 h-3 w-3 rounded-full border-2",
                                  isDark 
                                    ? "border-indigo-700 border-t-indigo-300" 
                                    : "border-indigo-300 border-t-indigo-600"
                                )}
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Zap className="inline-block w-3 h-3 mr-1" />
                              Analyze this Variant
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              );
            })()}

            {variantError && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "p-4 mt-6 text-xs font-sans rounded-xl border flex items-center gap-3",
                  isDark 
                    ? "bg-red-950/10 text-red-300 border-red-900/20" 
                    : "bg-red-50 text-red-600 border-red-100"
                )}
              >
                {variantError}
              </motion.div>
            )}

            {variantResult && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={cn(
                  "mt-6 rounded-xl p-6 relative overflow-hidden",
                  isDark 
                    ? "border border-purple-900/20 bg-purple-950/10" 
                    : "border border-purple-100 bg-purple-50/50"
                )}
              >
                <div className="absolute inset-0 pointer-events-none opacity-5">
                  <div className={cn(
                    "absolute -inset-[40%] blur-3xl rounded-full",
                    isDark ? "bg-purple-800" : "bg-purple-300"
                  )} />
                </div>
                
                <h4 className={cn(
                  "mb-4 text-sm font-medium font-sans flex items-center gap-2",
                  isDark ? "text-purple-300" : "text-purple-700"
                )}>
                  <Dna className="h-4 w-4" />
                  Analysis Result
                </h4>
                
                <div className="grid gap-6 md:grid-cols-2 relative z-10">
                  <div>
                    <div className="mb-4">
                      <div className={cn(
                        "text-xs font-medium font-sans",
                        isDark ? "text-gray-300" : "text-gray-700"
                      )}>
                        Variant
                      </div>
                      <div className="text-sm font-sans mt-2">
                        {gene?.symbol} {variantResult.position}{" "}
                        <span className="font-mono">
                          <span className={getNucleotideColorClass(variantResult.reference)}>
                            {variantResult.reference}
                          </span>
                          {">"}
                          <span className={getNucleotideColorClass(variantResult.alternative)}>
                            {variantResult.alternative}
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="mt-5">
                      <div className={cn(
                        "text-xs font-medium font-sans",
                        isDark ? "text-gray-300" : "text-gray-700"
                      )}>
                        Delta likelihood score
                      </div>
                      <div className="text-sm font-sans mt-2">
                        {variantResult.delta_score.toFixed(6)}
                      </div>
                      <div className={cn(
                        "mt-1 text-xs font-sans",
                        isDark ? "text-gray-500" : "text-gray-500"
                      )}>
                        Negative score indicates loss of function
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className={cn(
                      "text-xs font-medium font-sans",
                      isDark ? "text-gray-300" : "text-gray-700"
                    )}>
                      Prediction
                    </div>
                    <div
                      className={`inline-block rounded-lg px-3 py-2 mt-2 text-xs font-sans ${getClassificationColorClasses(variantResult.prediction)}`}
                    >
                      {variantResult.prediction}
                    </div>
                    <div className="mt-5">
                      <div className={cn(
                        "text-xs font-medium font-sans",
                        isDark ? "text-gray-300" : "text-gray-700"
                      )}>
                        Confidence
                      </div>
                      <div className={cn(
                        "mt-2 h-2 w-full rounded-full",
                        isDark ? "bg-gray-800" : "bg-gray-200"
                      )}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, variantResult.classification_confidence * 100)}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className={`h-2 rounded-full ${
                            variantResult.prediction.includes("pathogenic") 
                              ? isDark ? "bg-gradient-to-r from-red-600 to-red-400" : "bg-gradient-to-r from-red-600 to-red-500"
                              : isDark ? "bg-gradient-to-r from-green-600 to-green-400" : "bg-gradient-to-r from-green-600 to-green-500"
                          }`}
                        ></motion.div>
                      </div>
                      <div className={cn(
                        "mt-1 text-right text-xs font-sans",
                        isDark ? "text-gray-500" : "text-gray-500"
                      )}>
                        {Math.round(
                          variantResult.classification_confidence * 100,
                        )}
                        %
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {variantResult && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="mt-6"
              >
                <GeminiExplanation 
                  variant={variantResult}
                  geneSymbol={gene.symbol}
                />
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  },
);

export default VariantAnalysis;