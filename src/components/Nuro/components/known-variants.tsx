"use client";

import {
  analyzeVariantWithAPI,
  type ClinvarVariant,
  type GeneFromSearch,
} from "@/utils/genome-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart2,
  ExternalLink,
  RefreshCw,
  Shield,
  Zap,
  ListFilter,
  FileBarChart2,
  AlertTriangle,
} from "lucide-react";
import { getClassificationColorClasses } from "@/utils/coloring-utils";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Loader } from "@/components/Loader";
import { toast } from "sonner";

export default function KnownVariants({
  refreshVariants,
  showComparison,
  updateClinvarVariant,
  clinvarVariants,
  isLoadingClinvar,
  clinvarError,
  genomeId,
  gene,
}: {
  refreshVariants: () => void;
  showComparison: (variant: ClinvarVariant) => void;
  updateClinvarVariant: (id: string, newVariant: ClinvarVariant) => void;
  clinvarVariants: ClinvarVariant[];
  isLoadingClinvar: boolean;
  clinvarError: string | null;
  genomeId: string;
  gene: GeneFromSearch;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  const analyzeVariant = async (variant: ClinvarVariant) => {
    let variantDetails = null;
    const position = variant.location
      ? parseInt(variant.location.replaceAll(",", ""))
      : null;

    const refAltMatch = variant.title.match(/(\w)>(\w)/);

    if (refAltMatch && refAltMatch.length === 3) {
      variantDetails = {
        position,
        reference: refAltMatch[1],
        alternative: refAltMatch[2],
      };
    }

    if (
      !variantDetails ||
      !variantDetails.position ||
      !variantDetails.reference ||
      !variantDetails.alternative
    ) {
      toast.error("Could not parse variant details", {
        icon: <AlertTriangle className="h-4 w-4" />,
        description: "The variant data format could not be recognized."
      });
      return;
    }

    updateClinvarVariant(variant.clinvar_id, {
      ...variant,
      isAnalyzing: true,
    });
    
    toast.loading(`Analyzing variant ${variant.title}...`, {
      icon: <RefreshCw className="h-4 w-4 animate-spin" />,
      description: "This may take a few moments."
    });

    try {
      const data = await analyzeVariantWithAPI({
        position: variantDetails.position,
        alternative: variantDetails.alternative,
        genomeId: genomeId,
        chromosome: gene.chrom,
      });

      const updatedVariant: ClinvarVariant = {
        ...variant,
        isAnalyzing: false,
        evo2Result: data,
      };

      updateClinvarVariant(variant.clinvar_id, updatedVariant);
      
      toast.success("Analysis complete", {
        description: `Prediction: ${data.prediction}`,
        icon: <Shield className="h-4 w-4" />
      });

      showComparison(updatedVariant);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Analysis failed";
      
      updateClinvarVariant(variant.clinvar_id, {
        ...variant,
        isAnalyzing: false,
        evo2Error: errorMsg,
      });
      
      toast.error(`Analysis failed: ${errorMsg}`, {
        icon: <AlertTriangle className="h-4 w-4" />,
        description: "There was an error analyzing this variant."
      });
    }
  };
  
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.2 }
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn(
        "overflow-hidden border-none shadow-xl rounded-2xl",
        isDark 
          ? "bg-gradient-to-b from-gray-900/60 to-black/90 backdrop-blur-md text-white" 
          : "bg-gradient-to-b from-white to-gray-50/90 backdrop-blur-md text-gray-900"
      )}>
        <CardHeader className={cn(
          "flex flex-row items-center justify-between pt-6 pb-3",
          isDark ? "border-b border-gray-800/50" : "border-b border-gray-200/30"
        )}>
          <CardTitle className={cn(
            "flex items-center gap-2 font-serif text-lg",
            isDark ? "text-white" : "text-gray-900"
          )}>
            <FileBarChart2 className="h-5 w-5 text-indigo-500" />
            Known Variants from ClinVar
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              refreshVariants();
              toast.success("Refreshing variants...", {
                icon: <RefreshCw className="h-4 w-4 animate-spin" />,
                description: "Fetching latest variants data."
              });
            }}
            disabled={isLoadingClinvar}
            className={cn(
              "h-8 cursor-pointer text-xs font-sans group",
              isDark 
                ? "text-gray-300 hover:bg-gray-800 hover:text-white" 
                : "text-gray-700 hover:bg-gray-100"
            )}
          >
            <RefreshCw className={cn(
              "mr-2 h-3.5 w-3.5 transition-all",
              isLoadingClinvar ? "animate-spin" : "group-hover:rotate-180"
            )} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="py-6">
          {clinvarError && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "p-4 mb-6 text-xs font-sans rounded-xl flex items-center gap-3",
                isDark 
                  ? "bg-red-950/10 text-red-300 border border-red-900/20" 
                  : "bg-red-50 text-red-600 border border-red-100"
              )}
            >
              {clinvarError}
            </motion.div>
          )}

          {isLoadingClinvar ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <Loader />
              <p className={cn(
                "text-sm font-sans",
                isDark ? "text-gray-400" : "text-gray-500"
              )}>
                Loading variants...
              </p>
            </div>
          ) : clinvarVariants.length > 0 ? (
            <div className={cn(
              "max-h-[420px] overflow-y-auto rounded-xl border",
              isDark 
                ? "border-gray-800/50 bg-gray-900/30 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent" 
                : "border-gray-200/50 bg-white/30 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
            )}>
              <Table>
                <TableHeader className="sticky top-0 z-10">
                  <TableRow className={cn(
                    "hover:bg-transparent",
                    isDark 
                      ? "bg-black/50 backdrop-blur-md" 
                      : "bg-gray-50/80 backdrop-blur-md"
                  )}>
                    <TableHead className={cn(
                      "py-3 text-xs font-medium font-sans",
                      isDark ? "text-gray-300" : "text-gray-700"
                    )}>
                      Variant
                    </TableHead>
                    <TableHead className={cn(
                      "py-3 text-xs font-medium font-sans",
                      isDark ? "text-gray-300" : "text-gray-700"
                    )}>
                      Type
                    </TableHead>
                    <TableHead className={cn(
                      "py-3 text-xs font-medium font-sans",
                      isDark ? "text-gray-300" : "text-gray-700"
                    )}>
                      Clinical Significance
                    </TableHead>
                    <TableHead className={cn(
                      "py-3 text-xs font-medium font-sans",
                      isDark ? "text-gray-300" : "text-gray-700"
                    )}>
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    <motion.div
                      variants={container}
                      initial="hidden"
                      animate="visible"
                    >
                      {clinvarVariants.map((variant, index) => (
                        <motion.tr
                          key={variant.clinvar_id}
                          variants={item}
                          custom={index}
                          className={cn(
                            "border-b",
                            isDark 
                              ? "border-gray-800/70 hover:bg-gray-800/30" 
                              : "border-gray-200/50 hover:bg-indigo-50/30"
                          )}
                        >
                          <TableCell className="py-3">
                            <div className={cn(
                              "text-xs font-medium font-sans",
                              isDark ? "text-gray-200" : "text-gray-800"
                            )}>
                              {variant.title}
                            </div>
                            <div className="mt-1 flex items-center gap-1 text-xs text-[#3c4f3d]/70">
                              <p className={cn(
                                "font-sans",
                                isDark ? "text-gray-400" : "text-gray-500"
                              )}>
                                Location: {variant.location}
                              </p>
                              <Button
                                variant="link"
                                size="sm"
                                className={cn(
                                  "h-6 cursor-pointer px-0 text-xs font-sans group",
                                  isDark ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-600 hover:text-indigo-700"
                                )}
                                onClick={() =>
                                  window.open(
                                    `https://www.ncbi.nlm.nih.gov/clinvar/variation/${variant.clinvar_id}`,
                                    "_blank",
                                  )
                                }
                              >
                                View in ClinVar
                                <ExternalLink className="inline-block w-2.5 h-2.5 ml-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className={cn(
                            "py-3 text-xs font-sans",
                            isDark ? "text-gray-300" : "text-gray-700"
                          )}>
                            {variant.variation_type}
                          </TableCell>
                          <TableCell className="py-3 text-xs">
                            <div
                              className={cn(
                                "w-fit rounded-md px-2 py-1 text-center font-sans",
                                getClassificationColorClasses(variant.classification)
                              )}
                            >
                              {variant.classification || "Unknown"}
                            </div>
                            {variant.evo2Result && (
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className="mt-2"
                              >
                                <div
                                  className={cn(
                                    "flex w-fit items-center gap-1 rounded-md px-2 py-1 text-center font-sans",
                                    getClassificationColorClasses(variant.evo2Result.prediction)
                                  )}
                                >
                                  <Shield className="w-3 h-3" />
                                  <span>Evo2: {variant.evo2Result.prediction}</span>
                                </div>
                              </motion.div>
                            )}
                          </TableCell>
                          <TableCell className="py-3 text-xs">
                            <div className="flex flex-col items-end gap-1">
                              {variant.variation_type
                                .toLowerCase()
                                .includes("single nucleotide") ? (
                                !variant.evo2Result ? (
                                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className={cn(
                                        "h-7 cursor-pointer px-3 text-xs font-sans",
                                        isDark 
                                          ? "border-indigo-900/40 bg-indigo-950/20 text-indigo-300 hover:bg-indigo-900/30" 
                                          : "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                                      )}
                                      disabled={variant.isAnalyzing}
                                      onClick={() => analyzeVariant(variant)}
                                    >
                                      {variant.isAnalyzing ? (
                                        <>
                                          <span className={cn(
                                            "mr-1 inline-block h-3 w-3 animate-spin rounded-full border-2",
                                            isDark
                                              ? "border-indigo-800 border-t-indigo-300"
                                              : "border-indigo-300 border-t-indigo-600"
                                          )}></span>
                                          Analyzing...
                                        </>
                                      ) : (
                                        <>
                                          <Zap className="inline-block w-3 h-3 mr-1" />
                                          Analyze with Evo2
                                        </>
                                      )}
                                    </Button>
                                  </motion.div>
                                ) : (
                                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className={cn(
                                        "h-7 cursor-pointer px-3 text-xs font-sans",
                                        isDark
                                          ? "border-purple-900/40 bg-purple-950/20 text-purple-300 hover:bg-purple-900/30"
                                          : "border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100"
                                      )}
                                      onClick={() => showComparison(variant)}
                                    >
                                      <BarChart2 className="inline-block w-3 h-3 mr-1" />
                                      Compare Results
                                    </Button>
                                  </motion.div>
                                )
                              ) : null}
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className={cn(
                "flex flex-col items-center justify-center h-48 text-center",
                isDark ? "text-gray-500" : "text-gray-400"
              )}
            >
              <div className={cn(
                "flex h-20 w-20 items-center justify-center rounded-full mb-4",
                isDark ? "bg-gray-900" : "bg-gray-100"
              )}>
                <ListFilter className={cn(
                  "h-10 w-10",
                  isDark ? "text-gray-700" : "text-gray-300"
                )} />
              </div>
              <p className={cn(
                "text-sm leading-relaxed font-sans",
                isDark ? "text-gray-400" : "text-gray-500"
              )}>
                No ClinVar variants found for this gene.
              </p>
              <p className={cn(
                "text-sm mt-2 font-sans",
                isDark ? "text-gray-500" : "text-gray-400"
              )}>
                Try refreshing or analyzing a different gene.
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
