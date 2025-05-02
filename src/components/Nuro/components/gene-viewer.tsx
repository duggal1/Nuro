/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import {
  fetchGeneDetails,
  fetchGeneSequence as apiFetchGeneSequence,
  fetchClinvarVariants as apiFetchClinvarVariants,
  type GeneBounds,
  type GeneDetailsFromSearch,
  type GeneFromSearch,
  type ClinvarVariant,
} from "@/utils/genome-api";
import { Button } from "@/components/ui/button";
import {ArrowLeft , Info, Database, Atom, Dna, AlertTriangle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { GeneInformation } from "./gene-information";
import { GeneSequence } from "./gene-sequence";
import KnownVariants from "./known-variants";
import { VariantComparisonModal } from "./variant-comparison-modal";
import VariantAnalysis, {
  type VariantAnalysisHandle,
} from "./variant-analysis";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Loader } from "@/components/Loader";
import { toast } from "sonner";

export default function GeneViewer({
  gene,
  genomeId,
  onClose,
}: {
  gene: GeneFromSearch;
  genomeId: string;
  onClose: () => void;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  const [geneSequence, setGeneSequence] = useState("");
  const [geneDetail, setGeneDetail] = useState<GeneDetailsFromSearch | null>(
    null,
  );
  const [geneBounds, setGeneBounds] = useState<GeneBounds | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [startPosition, setStartPosition] = useState<string>("");
  const [endPosition, setEndPosition] = useState<string>("");
  const [isLoadingSequence, setIsLoadingSequence] = useState(false);

  const [clinvarVariants, setClinvarVariants] = useState<ClinvarVariant[]>([]);
  const [isLoadingClinvar, setIsLoadingClinvar] = useState(false);
  const [clinvarError, setClinvarError] = useState<string | null>(null);

  const [actualRange, setActualRange] = useState<{
    start: number;
    end: number;
  } | null>(null);

  const [comparisonVariant, setComparisonVariant] =
    useState<ClinvarVariant | null>(null);

  const [activeSequencePosition, setActiveSequencePosition] = useState<
    number | null
  >(null);
  const [activeReferenceNucleotide, setActiveReferenceNucleotide] = useState<
    string | null
  >(null);

  const variantAnalysisRef = useRef<VariantAnalysisHandle>(null);

  const updateClinvarVariant = (
    clinvar_id: string,
    updateVariant: ClinvarVariant,
  ) => {
    setClinvarVariants((currentVariants) =>
      currentVariants.map((v) =>
        v.clinvar_id == clinvar_id ? updateVariant : v,
      ),
    );
  };

  const fetchGeneSequence = useCallback(
    async (start: number, end: number) => {
      try {
        setIsLoadingSequence(true);
        setError(null);

        const {
          sequence,
          actualRange: fetchedRange,
          error: apiError,
        } = await apiFetchGeneSequence(gene.chrom, start, end, genomeId);

        setGeneSequence(sequence);
        setActualRange(fetchedRange);

        if (apiError) {
          setError(apiError);
          toast.error("Failed to load sequence: " + apiError, {
            icon: <AlertTriangle className="h-4 w-4" />,
            description: "There was an error retrieving the gene sequence."
          });
        } else if (sequence) {
          toast.success("Sequence loaded successfully", {
            description: `${fetchedRange.end - fetchedRange.start + 1} base pairs loaded`,
            icon: <Database className="h-4 w-4" />
          });
        }
      } catch (err) {
        const errorMsg = "Failed to load sequence data";
        setError(errorMsg);
        toast.error(errorMsg, {
          icon: <AlertTriangle className="h-4 w-4" />,
          description: "Please check your connection and try again."
        });
      } finally {
        setIsLoadingSequence(false);
      }
    },
    [gene.chrom, genomeId],
  );

  useEffect(() => {
    const initializeGeneData = async () => {
      setIsLoading(true);

      if (!gene.gene_id) {
        const errorMsg = "Gene ID is missing, cannot fetch details";
        setError(errorMsg);
        toast.error(errorMsg);
        setIsLoading(false);
        return;
      }

      try {
        const {
          geneDetails: fetchedDetail,
          geneBounds: fetchedGeneBounds,
          initialRange: fetchedRange,
        } = await fetchGeneDetails(gene.gene_id);

        setGeneDetail(fetchedDetail);
        setGeneBounds(fetchedGeneBounds);
        
        toast.success("Gene information loaded", {
          description: `${gene.symbol} details retrieved successfully`,
          icon: <Info className="h-4 w-4" />
        });

        if (fetchedRange) {
          setStartPosition(String(fetchedRange.start));
          setEndPosition(String(fetchedRange.end));
          await fetchGeneSequence(fetchedRange.start, fetchedRange.end);
        }
      } catch (err) {
        const errorMsg = "Failed to load gene information. Please try again.";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    initializeGeneData();
  }, [gene, genomeId, fetchGeneSequence]);

  const handleSequenceClick = useCallback(
    (position: number, nucleotide: string) => {
      setActiveSequencePosition(position);
      setActiveReferenceNucleotide(nucleotide);
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (variantAnalysisRef.current) {
        variantAnalysisRef.current.focusAlternativeInput();
      }
    },
    [],
  );

  const handleLoadSequence = useCallback(() => {
    const start = parseInt(startPosition);
    const end = parseInt(endPosition);
    let validationError: string | null = null;

    if (isNaN(start) || isNaN(end)) {
      validationError = "Please enter valid start and end positions";
    } else if (start >= end) {
      validationError = "Start position must be less than end position";
    } else if (geneBounds) {
      const minBound = Math.min(geneBounds.min, geneBounds.max);
      const maxBound = Math.max(geneBounds.min, geneBounds.max);
      if (start < minBound) {
        validationError = `Start position (${start.toLocaleString()}) is below the minimum value (${minBound.toLocaleString()})`;
      } else if (end > maxBound) {
        validationError = `End position (${end.toLocaleString()}) exceeds the maximum value (${maxBound.toLocaleString()})`;
      }

      if (end - start > 10000) {
        validationError = `Selected range exceeds maximum view range of 10,000 bp.`;
      }
    }

    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setError(null);
    fetchGeneSequence(start, end);
  }, [startPosition, endPosition, fetchGeneSequence, geneBounds]);

  const fetchClinvarVariants = async () => {
    if (!gene.chrom || !geneBounds) return;

    setIsLoadingClinvar(true);
    setClinvarError(null);

    try {
      const variants = await apiFetchClinvarVariants(
        gene.chrom,
        geneBounds,
        genomeId,
      );
      setClinvarVariants(variants);
      
      if (variants.length > 0) {
        toast.success(`${variants.length} ClinVar variants loaded`, {
          icon: <Database className="h-4 w-4" />,
          description: "Genetic variants from ClinVar database are ready to analyze."
        });
      } else {
        toast.info("No ClinVar variants found for this gene", {
          icon: <Info className="h-4 w-4" />,
          description: "Try searching for a different gene with known variants."
        });
      }
      
      console.log(variants);
    } catch (error) {
      const errorMsg = "Failed to fetch ClinVar variants";
      setClinvarError(errorMsg);
      setClinvarVariants([]);
      toast.error(errorMsg, {
        icon: <AlertTriangle className="h-4 w-4" />,
        description: "Unable to retrieve variant data from ClinVar."
      });
    } finally {
      setIsLoadingClinvar(false);
    }
  };

  useEffect(() => {
    if (geneBounds) {
      fetchClinvarVariants();
    }
  }, [geneBounds]);

  const showComparison = (variant: ClinvarVariant) => {
    if (variant.evo2Result) {
      setComparisonVariant(variant);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-6">
        <Loader />
        <p className={cn(
          "text-sm font-sans",
          isDark ? "text-gray-400" : "text-gray-500"
        )}>Loading gene information...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "group cursor-pointer transition-all",
            isDark 
              ? "text-gray-300 hover:bg-gray-900/70" 
              : "text-gray-700 hover:bg-gray-100/70"
          )}
          onClick={onClose}
        >
          <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
          <span className="font-sans">Back to results</span>
        </Button>
        
        <div className={cn(
          "flex items-center gap-2 rounded-full border px-4 py-1.5",
          isDark 
            ? "border-indigo-900/30 bg-indigo-950/20 text-indigo-300" 
            : "border-indigo-100 bg-indigo-50 text-indigo-700"
        )}>
          <Dna className="h-4 w-4" />
          <span className="text-sm font-sans">{gene.symbol} | {gene.chrom}</span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="relative"
      >
        <div className="absolute top-0 right-0 -mt-12 mr-4">
        
          
        </div>
        
        <VariantAnalysis
          ref={variantAnalysisRef}
          gene={gene}
          genomeId={genomeId}
          chromosome={gene.chrom}
          clinvarVariants={clinvarVariants}
          referenceSequence={activeReferenceNucleotide}
          sequencePosition={activeSequencePosition}
          geneBounds={geneBounds}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <KnownVariants
          refreshVariants={fetchClinvarVariants}
          showComparison={showComparison}
          updateClinvarVariant={updateClinvarVariant}
          clinvarVariants={clinvarVariants}
          isLoadingClinvar={isLoadingClinvar}
          clinvarError={clinvarError}
          genomeId={genomeId}
          gene={gene}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <GeneSequence
          geneBounds={geneBounds}
          geneDetail={geneDetail}
          startPosition={startPosition}
          endPosition={endPosition}
          onStartPositionChange={setStartPosition}
          onEndPositionChange={setEndPosition}
          sequenceData={geneSequence}
          sequenceRange={actualRange}
          isLoading={isLoadingSequence}
          error={error}
          onSequenceLoadRequest={handleLoadSequence}
          onSequenceClick={handleSequenceClick}
          maxViewRange={10000}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <GeneInformation
          gene={gene}
          geneDetail={geneDetail}
          geneBounds={geneBounds}
        />
      </motion.div>

      <VariantComparisonModal
        comparisonVariant={comparisonVariant}
        onClose={() => setComparisonVariant(null)}
      />
    </motion.div>
  );
}
