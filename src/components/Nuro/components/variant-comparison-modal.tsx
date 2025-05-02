/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import type { ClinvarVariant } from "@/utils/genome-api";
import { Button } from "@/components/ui/button";
import { Check, ExternalLink, Shield, X, ArrowRight, AlertTriangle } from "lucide-react";
import {
  getClassificationColorClasses,
  getNucleotideColorClass,
} from "@/utils/coloring-utils";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { toast } from "sonner";
import { Loader } from "@/components/Loader";

export function VariantComparisonModal({
  comparisonVariant,
  onClose,
}: {
  comparisonVariant: ClinvarVariant | null;
  onClose: () => void;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    if (comparisonVariant) {
      toast.success("Variant comparison loaded", {
        icon: <Shield className="h-4 w-4" />,
        description: `Comparing ClinVar and Evo2 classifications for variant at position ${comparisonVariant.location}`
      });
    }
  }, [comparisonVariant]);

  if (!comparisonVariant || !comparisonVariant.evo2Result) return null;

  const isConsistent = 
    comparisonVariant.classification.toLowerCase() === 
    comparisonVariant.evo2Result.prediction.toLowerCase();

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring",
        damping: 25, 
        stiffness: 300 
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        staggerChildren: 0.08,
        delayChildren: 0.1,
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-lg"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <motion.div 
          className={cn(
            "fixed inset-0",
            isDark ? "bg-black/80" : "bg-black/40"
          )}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
        
        <motion.div 
          className={cn(
            "max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl shadow-2xl",
            isDark 
              ? "bg-gradient-to-b from-gray-900 to-black border border-gray-800/50 text-white" 
              : "bg-gradient-to-b from-white to-gray-50 border border-gray-200/50 text-gray-900"
          )}
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Modal header */}
          <div className={cn(
            "relative p-6 backdrop-blur-md",
            isDark 
              ? "border-b border-gray-800/50 bg-black/20" 
              : "border-b border-gray-200/50 bg-white/50"
          )}>
            <div className="flex items-center justify-between">
              <h3 className={cn(
                "font-serif text-xl",
                isDark ? "text-white" : "text-gray-900"
              )}>
                Variant Analysis Comparison
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className={cn(
                  "h-8 w-8 cursor-pointer rounded-full p-0 absolute -top-1 right-3 transition-transform hover:scale-110",
                  isDark 
                    ? "text-gray-400 hover:bg-gray-800 hover:text-white" 
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Modal content */}
          <div className="overflow-y-auto max-h-[calc(90vh-10rem)]">
            <motion.div 
              className="p-6 space-y-6"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div 
                variants={itemVariants}
                className={cn(
                  "rounded-2xl border p-6 relative overflow-hidden",
                  isDark 
                    ? "border-gray-800/50 bg-gray-900/30 backdrop-blur-md" 
                    : "border-gray-200/50 bg-gray-50/50"
                )}
              >
                <div className="absolute inset-0 pointer-events-none opacity-10">
                  <div className={cn(
                    "absolute -inset-[40%] blur-3xl rounded-full",
                    isDark ? "bg-indigo-900/30" : "bg-indigo-100/80"
                  )} />
                </div>
                
                <h4 className={cn(
                  "mb-4 text-sm font-medium font-sans flex items-center gap-2",
                  isDark ? "text-gray-200" : "text-gray-700"
                )}>
                  <span className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full",
                    isDark ? "bg-indigo-900/50" : "bg-indigo-100"
                  )}>
                    <span className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      isDark ? "bg-indigo-400" : "bg-indigo-600"
                    )}></span>
                  </span>
                  Variant Information
                </h4>
                <div className="grid gap-8 md:grid-cols-2 relative z-10">
                  <div>
                    <div className="space-y-4">
                      <div className="flex">
                        <span className={cn(
                          "w-28 text-xs font-sans",
                          isDark ? "text-gray-400" : "text-gray-600"
                        )}>
                          Position:
                        </span>
                        <span className={cn(
                          "text-xs font-sans font-medium",
                          isDark ? "text-gray-200" : "text-gray-900"
                        )}>
                          {comparisonVariant.location}
                        </span>
                      </div>
                      <div className="flex">
                        <span className={cn(
                          "w-28 text-xs font-sans",
                          isDark ? "text-gray-400" : "text-gray-600"
                        )}>
                          Type:
                        </span>
                        <span className={cn(
                          "text-xs font-sans font-medium",
                          isDark ? "text-gray-200" : "text-gray-900"
                        )}>
                          {comparisonVariant.variation_type}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="space-y-4">
                      <div className="flex">
                        <span className={cn(
                          "w-28 text-xs font-sans",
                          isDark ? "text-gray-400" : "text-gray-600"
                        )}>
                          Variant:
                        </span>
                        <span className="font-mono text-xs font-medium">
                          {(() => {
                            const match =
                              comparisonVariant.title.match(/(\w)>(\w)/);
                            if (match && match.length === 3) {
                              const [_, ref, alt] = match;
                              return (
                                <>
                                  <span
                                    className={getNucleotideColorClass(ref!)}
                                  >
                                    {ref}
                                  </span>
                                  <span>{">"}</span>
                                  <span
                                    className={getNucleotideColorClass(alt!)}
                                  >
                                    {alt}
                                  </span>
                                </>
                              );
                            }
                            return comparisonVariant.title;
                          })()}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className={cn(
                          "w-28 text-xs font-sans",
                          isDark ? "text-gray-400" : "text-gray-600"
                        )}>
                          ClinVar ID:
                        </span>
                        <a
                          href={`https://www.ncbi.nlm.nih.gov/clinvar/variation/${comparisonVariant.clinvar_id}`}
                          className={cn(
                            "text-xs hover:underline font-sans flex items-center group",
                            isDark ? "text-indigo-400" : "text-indigo-600"
                          )}
                          target="_blank"
                        >
                          {comparisonVariant.clinvar_id}
                          <ExternalLink className={cn(
                            "ml-1 inline-block h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          )} />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Variant results */}
              <motion.div variants={itemVariants}>
                <h4 className={cn(
                  "mb-4 text-sm font-medium font-sans flex items-center gap-2",
                  isDark ? "text-gray-200" : "text-gray-700"
                )}>
                  <span className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full",
                    isDark ? "bg-indigo-900/50" : "bg-indigo-100"
                  )}>
                    <span className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      isDark ? "bg-indigo-400" : "bg-indigo-600"
                    )}></span>
                  </span>
                  Analysis Comparison
                </h4>
                <div className={cn(
                  "rounded-2xl border p-6 relative overflow-hidden",
                  isDark 
                    ? "border-gray-800/50 bg-black/30 backdrop-blur-md" 
                    : "border-gray-200/50 bg-white/50"
                )}>
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* ClinVar Assesment */}
                    <div className={cn(
                      "rounded-2xl p-6 backdrop-blur-sm",
                      isDark 
                        ? "bg-gray-900/30" 
                        : "bg-gray-50/50"
                    )}>
                      <h5 className={cn(
                        "mb-4 flex items-center gap-2 text-xs font-medium font-sans",
                        isDark ? "text-gray-300" : "text-gray-700"
                      )}>
                        <span className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full",
                          isDark ? "bg-gray-800" : "bg-gray-200"
                        )}>
                          <span className={cn(
                            "h-3 w-3 rounded-full",
                            isDark ? "bg-gray-400" : "bg-gray-600"
                          )}></span>
                        </span>
                        ClinVar Assessment
                      </h5>
                      <div className="mt-4 space-y-4">
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                          className={cn(
                            "w-fit rounded-md px-3 py-1.5 text-xs font-medium font-sans",
                            getClassificationColorClasses(comparisonVariant.classification)
                          )}
                        >
                          {comparisonVariant.classification ||
                            "Unknown significance"}
                        </motion.div>
                      </div>
                    </div>

                    {/* Evo2 Prediction */}
                    <div className={cn(
                      "rounded-2xl p-6 backdrop-blur-sm",
                      isDark 
                        ? "bg-gray-900/30" 
                        : "bg-gray-50/50"
                    )}>
                      <h5 className={cn(
                        "mb-4 flex items-center gap-2 text-xs font-medium font-sans",
                        isDark ? "text-gray-300" : "text-gray-700"
                      )}>
                        <span className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full",
                          isDark ? "bg-indigo-900/50" : "bg-indigo-100"
                        )}>
                          <span className={cn(
                            "h-3 w-3 rounded-full",
                            isDark ? "bg-indigo-400" : "bg-indigo-600"
                          )}></span>
                        </span>
                        Evo2 Prediction
                      </h5>
                      <div className="mt-4 space-y-4">
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                          className={cn(
                            "flex w-fit items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium font-sans",
                            getClassificationColorClasses(comparisonVariant.evo2Result.prediction)
                          )}
                        >
                          <Shield className="w-3 h-3" />
                          {comparisonVariant.evo2Result.prediction}
                        </motion.div>
                      </div>
                      {/* Delta score */}
                      <div className="mt-6">
                        <div className={cn(
                          "mb-2 text-xs font-sans",
                          isDark ? "text-gray-400" : "text-gray-600"
                        )}>
                          Delta Likelihood Score:
                        </div>
                        <div className={cn(
                          "text-sm font-medium font-sans",
                          isDark ? "text-gray-200" : "text-gray-900"
                        )}>
                          {comparisonVariant.evo2Result.delta_score.toFixed(6)}
                        </div>
                        <div className={cn(
                          "text-xs font-sans",
                          isDark ? "text-gray-500" : "text-gray-500"
                        )}>
                          {comparisonVariant.evo2Result.delta_score < 0
                            ? "Negative score indicates loss of function"
                            : "Positive score indicated gain/neutral function"}
                        </div>
                      </div>
                      {/* Confidence bar */}
                      <div className="mt-6">
                        <div className={cn(
                          "mb-2 text-xs font-sans",
                          isDark ? "text-gray-400" : "text-gray-600"
                        )}>
                          Confidence:
                        </div>
                        <motion.div 
                          className={cn(
                            "mt-1 h-2 w-full overflow-hidden rounded-full",
                            isDark ? "bg-gray-800" : "bg-gray-200"
                          )}
                        >
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ 
                              width: `${Math.min(100, comparisonVariant.evo2Result.classification_confidence * 100)}%` 
                            }}
                            transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                            className={`h-2 rounded-full ${
                              comparisonVariant.evo2Result.prediction.includes("pathogenic")
                                ? isDark 
                                  ? "bg-gradient-to-r from-red-600 to-red-400" 
                                  : "bg-gradient-to-r from-red-600 to-red-500"
                                : isDark 
                                  ? "bg-gradient-to-r from-green-600 to-green-400" 
                                  : "bg-gradient-to-r from-green-600 to-green-500"
                            }`}
                          />
                        </motion.div>
                        <div className={cn(
                          "mt-1 text-right text-xs font-sans",
                          isDark ? "text-gray-500" : "text-gray-500"
                        )}>
                          {Math.round(
                            comparisonVariant.evo2Result
                              .classification_confidence * 100,
                          )}
                          %
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Assessment Agreement */}
                  <motion.div 
                    variants={itemVariants}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className={cn(
                      "mt-8 rounded-xl p-5 relative overflow-hidden",
                      isDark
                        ? isConsistent ? "bg-green-900/10 border border-green-900/20" : "bg-amber-900/10 border border-amber-900/20"
                        : isConsistent ? "bg-green-50 border border-green-100" : "bg-amber-50 border border-amber-100"
                    )}
                  >
                    <div className="absolute inset-0 pointer-events-none opacity-10">
                      <div className={cn(
                        "absolute -inset-[40%] blur-3xl rounded-full",
                        isConsistent 
                          ? isDark ? "bg-green-800" : "bg-green-200" 
                          : isDark ? "bg-amber-800" : "bg-amber-200"
                      )} />
                    </div>
                    
                    <div className="flex items-center gap-3 relative z-10">
                      <span
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full",
                          isConsistent
                            ? isDark ? "bg-green-900/40" : "bg-green-100"
                            : isDark ? "bg-amber-900/40" : "bg-amber-100"
                        )}
                      >
                        {isConsistent ? (
                          <Check className={cn(
                            "h-4 w-4",
                            isDark ? "text-green-400" : "text-green-600"
                          )} />
                        ) : (
                          <AlertTriangle className={cn(
                            "h-4 w-4",
                            isDark ? "text-amber-400" : "text-amber-600"
                          )} />
                        )}
                      </span>
                      <span className={cn(
                        "font-medium font-sans",
                        isDark
                          ? isConsistent ? "text-green-300" : "text-amber-300"
                          : isConsistent ? "text-green-700" : "text-amber-700"
                      )}>
                        {isConsistent
                          ? "Evo2 prediction agrees with ClinVar classification"
                          : "Evo2 prediction differs from ClinVar classification"}
                      </span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Modal footer */}
          <div className={cn(
            "flex justify-end p-5",
            isDark 
              ? "border-t border-gray-800/50 bg-black/30 backdrop-blur-md" 
              : "border-t border-gray-200/50 bg-white/50 backdrop-blur-md"
          )}>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                onClick={onClose}
                className={cn(
                  "cursor-pointer font-sans",
                  isDark 
                    ? "border-gray-800 bg-gray-900 text-gray-200 hover:bg-gray-800 hover:text-white" 
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                )}
              >
                Close
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
