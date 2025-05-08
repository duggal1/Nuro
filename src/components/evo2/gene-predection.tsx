/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import React, { useState, useEffect, useRef } from "react";
import { serialize } from "next-mdx-remote/serialize";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/Loader";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { InfoCircledIcon, ChevronDownIcon, ReloadIcon, MagnifyingGlassIcon, CopyIcon, CheckIcon } from "@radix-ui/react-icons";
import { DNAViewer } from "./DNAViewer";
import { DNAAnalyzer } from "./DNAAnalyzer";
import { searchGenes, fetchGeneDetails, fetchGeneSequence } from "@/utils/genome-api";
import { getNucleotideColorClass } from "@/utils/coloring-utils";

interface ApiError { error: string }
type Mode = "new" | "edit";
type SpeciesTemplate = {
  label: string;
  prompt: string;
  description: string;
  icon?: React.ReactNode;
  baseGenome?: string;
};

// Enhanced Evo2 API types
interface Evo2ResponseData {
  sequence: string;
  properties?: {
    gc_content?: number;
    melting_temperature?: number;
    stability_score?: number;
    pathogenicity_score?: number;
    expression_level?: number;
    toxicity_score?: number;
    secondary_structure?: string[];
    binding_sites?: Array<{
      name: string;
      position: number;
      score: number;
    }>;
    mutations?: Array<{
      position: number;
      original: string;
      mutated: string;
      effect_score: number;
    }>;
  };
  confidence_scores?: number[];
  function_predictions?: {
    enzymatic_activity?: number;
    membrane_binding?: number;
    structural_protein?: number;
    signaling?: number;
    transport?: number;
    transcription_factor?: number;
  };
  [key: string]: any; // For other potential properties
}

export function GeneDesigner() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [mode, setMode] = useState<Mode>("new");
  const [activeTab, setActiveTab] = useState<string>("input");
  const [input, setInput] = useState<string>("");
  const [sequence, setSequence] = useState<string>("");
  const [originalSequence, setOriginalSequence] = useState<string>("");
  const [serializedExplanation, setSerializedExplanation] = useState<MDXRemoteSerializeResult | null>(null);
  const [evo2Response, setEvo2Response] = useState<Evo2ResponseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const abortCtrl = useRef<AbortController | null>(null);

  // State for Popover for Advanced Settings
  const [isAdvancedSettingsOpen, setIsAdvancedSettingsOpen] = useState(false);

  // Enhanced Evo2 parameters
  const [numTokens, setNumTokens] = useState(150);
  const [temperature, setTemperature] = useState(0.7);
  const [topK, setTopK] = useState(3);
  const [topP, setTopP] = useState(1);
  const [randomSeed, setRandomSeed] = useState<number | undefined>(undefined);
  const [enableLogits, setEnableLogits] = useState(false);
  const [enableSampledProbs, setEnableSampledProbs] = useState(false);
  const [enableElapsedMs, setEnableElapsedMs] = useState(false);
  
  // Additional Evo2 parameters
  const [targetGCContent, setTargetGCContent] = useState(0.5);
  const [optimizeStability, setOptimizeStability] = useState(true);
  const [avoidPathogenicity, setAvoidPathogenicity] = useState(true);
  const [enhanceExpression, setEnhanceExpression] = useState(false);
  const [targetOrganism, setTargetOrganism] = useState("mammal");
  const [targetFunction, setTargetFunction] = useState("default");
  const [conservationLevel, setConservationLevel] = useState(0.5);
  const [mutationRate, setMutationRate] = useState(0.01);

  const speciesOptions: SpeciesTemplate[] = [
    { 
      label: "Novel Big Cat", 
      prompt: "Generate a novel big cat genome with unique adaptations, combining traits from various feline species. Emphasize agility and nocturnal hunting capabilities.",
      description: "Create a never-before-seen big cat species with novel genetic adaptations.",
      baseGenome: "felCat9",
    },
    { 
      label: "Barbarian Lion", 
      prompt: "Generate a Panthera leo derived genome for a 'Barbarian Lion' with significantly enhanced testosterone production pathways, genes for a dramatically thicker and darker mane, and genetic markers associated with extreme predatory aggression and muscle hypertrophy. The target environment is subarctic tundra.",
      description: "Enhanced lion genome with exaggerated predatory characteristics for harsh climates.",
      baseGenome: "panLeo1",
    },
    { 
      label: "Human Prototype", 
      prompt: "Homo sapiens reference DNA sequence for gene APOE, focusing on the e3 allele. Include common regulatory elements.",
      description: "Standard human genome sequence (e.g., a specific gene like APOE).",
      baseGenome: "hg38", 
    },
    { 
      label: "Enhanced Protein", 
      prompt: "Generate a synthetic DNA sequence coding for a humanized therapeutic antibody fragment (scFv) with enhanced thermal stability (target melting temperature > 75°C) and optimized codon usage for E. coli expression.",
      description: "Optimized protein-coding sequence with enhanced expression and stability.",
    },
    {
      label: "Custom Template",
      prompt: "",
      description: "Define your own custom genetic template from scratch.",
    }
  ];
  
  const [selectedSpecies, setSelectedSpecies] = useState(speciesOptions[0]);

  // Initialize input with the default selected species' prompt
  useEffect(() => {
    if (selectedSpecies && selectedSpecies.prompt) {
      setInput(selectedSpecies.prompt);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount with initial selectedSpecies

  // DNA Visualization options
  const [visualizationMode, setVisualizationMode] = useState<"linear" | "circular" | "3d">("linear");
  const [highlightFeatures, setHighlightFeatures] = useState(true);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  const reset = () => {
    setSequence("");
    setOriginalSequence("");
    setEvo2Response(null);
    setSerializedExplanation(null);
    setError(null);
  };

  const sanitizeSequence = (seq: string) => {
    const cleaned = seq.toUpperCase().replace(/[^ACGT]/g, "");
    if (!cleaned) throw new Error("No valid DNA letters (A/C/G/T) found in sequence");
    return cleaned;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sequence);
      setCopySuccess(true);
      toast.success("Copied!", {
        description: "DNA sequence copied to clipboard",
        duration: 2000,
      });
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      toast.error("Copy failed", {
        description: "Could not copy to clipboard",
        duration: 2000,
      });
    }
  };

  const enhanceDNAExplanation = async (dnaSeq: string, properties: any) => {
    try {
      // Use a specialized DNA middleware to interpret the sequence
      const dnaAnalysisPrompt = `
        You are a DNA analysis expert. Analyze this ${dnaSeq.length}-base sequence and extract key biological information:
        
        1. Identify potential genes and their functions
        2. Analyze codon usage and bias
        3. Identify regulatory regions and motifs
        4. Predict potential protein structures and functions
        5. Compare with known genetic patterns
        
        Include technical DNA terminology and visualize key patterns. Format as scientific documentation.
        
        Additional properties to consider:
        ${JSON.stringify(properties)}
      `;
      
      const explRes = await fetch("/api/dna-interpreter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          sequence: dnaSeq,
          properties: properties,
        }),
        signal: abortCtrl.current?.signal
      });
      
      if (!explRes.ok) {
        let errorDetails = `DNA interpretation failed with status: ${explRes.status}`;
        try {
          const errorJson = await explRes.json();
          errorDetails = errorJson.error || errorJson.details || JSON.stringify(errorJson);
        } catch (e) {
          // If parsing error JSON fails, try to get text
          const errorText = await explRes.text().catch(() => "Could not read error response.");
          errorDetails += ` - ${errorText}`;
        }
        throw new Error(errorDetails);
      }
      
      const interpreterApiResponse = await explRes.json();

      // Validate the structure of the response from /api/dna-interpreter
      if (!interpreterApiResponse || typeof interpreterApiResponse.result === 'undefined') {
        console.error("Invalid response structure from /api/dna-interpreter. Expected 'result' field.", interpreterApiResponse);
        throw new Error("DNA interpretation service returned an unexpected data structure (missing 'result' field).");
      }

      const actualAnalysisData = interpreterApiResponse.result;

      // Check if the 'actualAnalysisData' (which is interpreterApiResponse.result) itself indicates an error
      // This can happen if the /api/dna-interpreter route had an internal issue (e.g., its own LLM call failed)
      // and packaged that error within the 'result' field of an otherwise 200 OK response.
      if (typeof actualAnalysisData === 'object' && actualAnalysisData !== null && (actualAnalysisData as any).error) {
        console.error("Error reported within the 'result' field from /api/dna-interpreter:", actualAnalysisData);
        const nestedError = (actualAnalysisData as any).error;
        const nestedDetails = (actualAnalysisData as any).details;
        throw new Error(`DNA interpretation service reported an internal error: ${nestedError}${nestedDetails ? ` - ${nestedDetails}` : ''}`);
      }
      
      const mdxPrompt = `
        You're explaining a DNA sequence to a biotechnology researcher.
        
        Use this expert analysis to generate comprehensive documentation in MDX format with sections for:
        - Sequence Overview
        - Genetic Features
        - Potential Functions
        - 3D Structure Implications
        - Comparative Analysis
        
        Include markdown tables, lists, and technical terminology.
        
        Analysis data: ${JSON.stringify(actualAnalysisData)}
      `;
      
      const mdxRes = await fetch("/api/prediction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          system: mdxPrompt, 
          user: dnaSeq,
          maxOutputTokens: "2500",
          temperature: "0.7"
        }),
        signal: abortCtrl.current?.signal
      });
      
      if (!mdxRes.ok) throw new Error(`Explanation generation failed: ${mdxRes.status}`);
      const mdxText = await mdxRes.text();
      
      return await serialize(mdxText, { 
        mdxOptions: { remarkPlugins: [], rehypePlugins: [] }
      });
    } catch (err: any) {
      console.error("DNA explanation enhancement error:", err);
      throw err;
    }
  };

  const buildEvo2Parameters = () => {
    const params: any = {
      sequence: originalSequence || "",
      num_tokens: numTokens,
      temperature,
      top_k: topK,
      top_p: topP,
      enable_logits: enableLogits,
      enable_sampled_probs: enableSampledProbs,
      enable_elapsed_ms_per_token: enableElapsedMs,
      // Advanced Evo2 Parameters
      target_gc_content: targetGCContent,
      optimize_stability: optimizeStability,
      avoid_pathogenicity: avoidPathogenicity,
      enhance_expression: enhanceExpression,
      target_organism: targetOrganism,
      target_function: targetFunction,
      conservation_level: conservationLevel,
      mutation_rate: mutationRate
    };
    
    if (randomSeed !== undefined) params.random_seed = randomSeed;
    return params;
  };

  const handleSubmit = async () => {
    if (!input.trim()) {
      toast.error("Input is empty", { description: "Please describe the gene or provide a DNA sequence."});
      return;
    }
    
    reset();
    setLoading(true);
    setActiveTab("results");
    abortCtrl.current = new AbortController();
    let evoData: Evo2ResponseData | null = null;
    let rawSeq = "";
    let sequenceSource: "API" | "LLM" | "User Input" | null = null;

    try {
      if (mode === "new") {
        const descriptionQuery = input.trim();
        // Use baseGenome from selectedSpecies if available, otherwise default.
        const genomeIdForSearch = selectedSpecies.baseGenome || "hg38"; 
        
        let attemptApiSearch = !!selectedSpecies.baseGenome; // Only attempt API search if a baseGenome is hinted

        if (attemptApiSearch) {
          toast.info(`Attempting to find existing gene matching: "${descriptionQuery}" in ${genomeIdForSearch}...`, { duration: 2000 });
          
          try {
            const geneSearchResults = await searchGenes(descriptionQuery, genomeIdForSearch);

            if (geneSearchResults.results && geneSearchResults.results.length > 0) {
              const foundGene = geneSearchResults.results[0]; 
              if (foundGene.gene_id) {
                toast.success(`Found potential gene: ${foundGene.symbol}. Fetching details...`, { duration: 2000 });
                
                const geneDetailsData = await fetchGeneDetails(foundGene.gene_id);
                if (geneDetailsData.geneDetails && geneDetailsData.geneBounds && geneDetailsData.initialRange) {
                  const { chrom } = foundGene; 
                  const { start, end } = geneDetailsData.initialRange;
                  const chromosomeForFetch = chrom;

                  if (chromosomeForFetch) {
                    toast.info(`Fetching sequence for ${foundGene.symbol} (chr: ${chromosomeForFetch}, range: ${start}-${end})...`, { duration: 2000 });
                    const sequenceData = await fetchGeneSequence(chromosomeForFetch, start, end, genomeIdForSearch);

                    if (sequenceData.sequence && !sequenceData.error) {
                      rawSeq = sequenceData.sequence;
                      sequenceSource = "API";
                      toast.success(`Fetched DNA sequence for ${foundGene.symbol} from ${genomeIdForSearch}. Length: ${rawSeq.length}.`, { duration: 3000 });
                    } else {
                      toast.warning(`Failed to fetch sequence for ${foundGene.symbol}: ${sequenceData.error || "Unknown error"}. Falling back to AI.`, { duration: 3000 });
                      rawSeq = ""; // Ensure fallback
                    }
                  } else {
                     toast.warning(`Missing chromosome info for ${foundGene.symbol}. Falling back to AI.`, { duration: 3000 });
                     rawSeq = ""; // Ensure fallback
                  }
                } else {
                  toast.warning(`Could not fetch full details for ${foundGene.symbol}. Falling back to AI.`, { duration: 3000 });
                  rawSeq = ""; // Ensure fallback
                }
              } else {
                toast.info(`Found gene "${foundGene.symbol}" but it lacks a GeneID. Falling back to AI.`, { duration: 3000 });
                rawSeq = ""; // Ensure fallback
              }
            } else {
              toast.info(`No direct match for "${descriptionQuery}" in ${genomeIdForSearch}. Falling back to AI.`, { duration: 3000 });
            }
          } catch (apiError: any) {
            console.warn("Error during genome-api search/fetch:", apiError);
            toast.warning(`API search error: ${apiError.message}. Falling back to AI.`, { duration: 3000 });
            rawSeq = ""; // Ensure fallback
          }
        } else {
            toast.info("No specific base genome defined for this template. Using AI for initial sequence generation.", { duration: 3000 });
        }

        // If genome-api did not provide a sequence or was skipped, fall back to LLM generation
        if (!rawSeq) {
          toast.info("Using AI for initial DNA sequence generation...", { duration: 2000 });
          sequenceSource = "LLM";
        const systemPrompt = `
          You are a genetic engineering expert. Convert the English description into a valid DNA sequence for Evo2-40B.
            Return ONLY the raw DNA sequence (A, C, G, T nucleotides). No explanations or other text.
            Create a realistic sequence for the described genetic characteristics.
            If a specific organism or gene is mentioned (e.g., human APOE, Panthera leo), focus on that.
            The sequence length should roughly match the num_tokens parameter (default ~${numTokens}).
        `;
        
          // Use the direct input as the primary driver for the LLM, selectedSpecies.prompt is now for pre-filling
          const userPromptForLLM = descriptionQuery; 
        
          const llmResp = await fetch("/api/prediction", { 
          method: "POST", 
          headers: { "Content-Type": "application/json" }, 
          body: JSON.stringify({ 
            system: systemPrompt, 
              user: userPromptForLLM,
              temperature: "0.7", // Slightly less random for more predictable DNA
              maxOutputTokens: (numTokens + 500).toString() // Give some buffer over num_tokens for LLM
          }), 
          signal: abortCtrl.current.signal 
        });
        
          if (!llmResp.ok) throw new Error(`AI DNA sequence generation failed: ${llmResp.status} ${llmResp.statusText}`);
          rawSeq = await llmResp.text();
          if (!rawSeq.trim().match(/^[ACGT]+$/i)) { // Basic check for DNA like output
             throw new Error("AI did not return a valid DNA sequence. Please try rephrasing your description.");
          }
          toast.success("AI successfully generated an initial DNA sequence.", { duration: 3000 });
        }
      } else { // mode === "edit"
        rawSeq = input.trim();
        sequenceSource = "User Input"; 
        toast.info("Using provided DNA sequence for editing.", { duration: 2000 });
      }
      
      if (!rawSeq.trim()) {
        throw new Error("No DNA sequence (either fetched or generated) is available to proceed.");
      }
      
      rawSeq = sanitizeSequence(rawSeq);
      if (rawSeq.length < 10) { // Arbitrary minimum length
        throw new Error(`Sequence is too short (${rawSeq.length} bases). Please provide a longer sequence or description.`);
      }
      setOriginalSequence(rawSeq);
      
      toast.info(`Sending sequence (from ${sequenceSource}, length ${rawSeq.length}) to Evo2...`, { duration: 2000 });
      const evoBody = buildEvo2Parameters();
      evoBody.sequence = rawSeq; // Ensure rawSeq is directly passed here if buildEvo2Parameters doesn't take it
                                 // buildEvo2Parameters currently uses originalSequence state, which is set above.
                                 // Let's ensure the num_tokens in payload matches the actual sequence if it's from API/edit.
      if (sequenceSource === "API" || sequenceSource === "User Input") {
        evoBody.num_tokens = rawSeq.length; // Adjust num_tokens if sequence is pre-defined
      }
      
      const evoRes = await fetch("/api/evo2", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(evoBody), 
        signal: abortCtrl.current.signal 
      });
      
      if (!evoRes.ok) {
        const errText = await evoRes.text();
        let errMessage = `Evo2 error: ${evoRes.statusText}`;
        try {
          const errJson = JSON.parse(errText);
          errMessage = `Evo2 error: ${errJson.error || errText}`;
        } catch (e) { /* Use raw text if JSON parse fails */ }
        throw new Error(errMessage);
      }
      
      // Step 4: Handle Evo2 response
      const contentType = evoRes.headers.get('Content-Type');
      
      if (contentType?.includes('application/json')) {
        evoData = await evoRes.json() as Evo2ResponseData;
        setEvo2Response(evoData);
        setSequence(sanitizeSequence(evoData.sequence));
      } else {
        const evoSeqText = await evoRes.text();
        const cleanSeq = sanitizeSequence(evoSeqText);
        setSequence(cleanSeq);
        setEvo2Response({ sequence: cleanSeq }); 
        evoData = { sequence: cleanSeq }; 
      }
      toast.success("Evo2 processing complete.");
      
      // Step 5: Generate enhanced explanation
      const sequenceForExplanation = evoData?.sequence || originalSequence;

      if (!sequenceForExplanation) {
        throw new Error("No sequence available (post-Evo2) to generate explanation.");
      }

      toast.info("Generating DNA analysis and explanation...");
      const mdxSer = await enhanceDNAExplanation(
        sanitizeSequence(sequenceForExplanation),
        evoData?.properties || {}
      );
      
      setSerializedExplanation(mdxSer);
      toast.success("DNA analysis ready.");
      
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("handleSubmit error:", err);
        setError(err.message);
        toast.error("An error occurred", { description: err.message });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => abortCtrl.current?.abort();
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "circOut" } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "circOut" } },
  };

  const handleSpeciesSelect = (species: SpeciesTemplate) => {
    setSelectedSpecies(species);
    if (species.label !== "Custom Template" && species.prompt) {
      setInput(species.prompt);
    } else if (species.label === "Custom Template") {
      setInput(""); // Clear input for custom template
    }
  };

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible" layout>
      <Card className={cn(
        "w-full mx-auto shadow-2xl rounded-2xl",
        isDark
          ? "bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 text-white border-slate-700"
          : "bg-gradient-to-br from-indigo-50 via-purple-50 to-slate-100 text-gray-900 border-slate-200"
      )}>
        <CardHeader className="p-6 pb-4 rounded-t-2xl">
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.4, delay: 0.1, ease: "circOut" }}
            className="flex flex-col items-center"
          >
            <CardTitle className="text-3xl md:text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 py-1">
              Advanced Gene Designer
            </CardTitle>
            <p className={cn("text-sm mt-2 text-center", isDark ? "text-gray-400" : "text-gray-600")}>
              Design, analyze, and visualize genetic sequences with AI.
            </p>
          </motion.div>
        </CardHeader>
        
        <CardContent className="p-4 sm:p-6 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6 p-1 rounded-xl border dark:border-slate-700 border-slate-300 backdrop-blur-sm bg-opacity-60 dark:bg-slate-800/60 bg-slate-200/60">
              {["Design", "Results", "Visualization"].map((tabName) => (
                <TabsTrigger 
                  key={tabName}
                  value={tabName.toLowerCase()}
                  className={cn(
                    "py-2.5 px-3 text-sm font-semibold rounded-lg transition-all duration-200 ease-in-out",
                    "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
                    activeTab === tabName.toLowerCase() 
                      ? (isDark ? "bg-indigo-600 text-white shadow-lg" : "bg-indigo-500 text-white shadow-lg") 
                      : (isDark ? "text-gray-400 hover:bg-slate-700/70 hover:text-gray-100" : "text-gray-500 hover:bg-slate-300/70 hover:text-gray-800")
                  )}
                >
                  {tabName}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: "circOut" }}
                className={cn(
                  "rounded-2xl min-h-[450px] p-3 sm:p-4 md:p-6",
                  isDark ? "bg-slate-800/30" : "bg-white/30",
                  "backdrop-blur-lg border dark:border-slate-700/50 border-slate-300/50"
                )}
              >
                {activeTab === "input" && (
                  <TabsContent value="input" className="space-y-6 outline-none mt-0 pt-0">
                    <motion.div 
                        variants={itemVariants} 
                        className="mb-6"
                    >
                      <h3 className={cn("text-xl font-semibold mb-4", isDark ? "text-gray-100" : "text-gray-800")}>
                        1. Select a Template
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {speciesOptions.map((opt, index) => (
                          <motion.div
                            key={opt.label}
                            layout
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: index * 0.05, duration:0.3, ease:"circOut" }}
                            whileHover={{ scale: 1.03, y: -2, boxShadow: "0px 8px 20px rgba(0,0,0,0.12)" }}
                          >
                            <TooltipProvider delayDuration={200}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant={opt === selectedSpecies ? "default" : "outline"}
                                    className={cn(
                                      "h-auto w-full py-4 px-4 justify-start text-left rounded-xl shadow-md transition-all duration-200",
                                      "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-background",
                                      opt === selectedSpecies 
                                        ? (isDark ? "bg-indigo-600 border-indigo-500 ring-2 ring-indigo-400" : "bg-indigo-500 border-indigo-600 text-white ring-2 ring-indigo-300")
                                        : (isDark ? "bg-slate-800 border-slate-700 hover:bg-slate-700/80" : "bg-white border-gray-300 hover:bg-gray-50/80")
                                    )}
                                    onClick={() => handleSpeciesSelect(opt)}
                                  >
                                    <div className="flex flex-col items-start space-y-1">
                                      <span className="font-semibold text-base leading-tight">{opt.label}</span>
                                      <span className={cn(
                                        "text-xs opacity-80 truncate w-full",
                                        opt === selectedSpecies && isDark ? "text-indigo-200" : 
                                        (opt === selectedSpecies ? "text-indigo-100" : 
                                        (isDark ? "text-gray-400" : "text-gray-500"))
                                      )}>
                                        {opt.description}
                                      </span>
                                    </div>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="rounded-lg text-xs max-w-xs p-2 bg-slate-800 text-white border-slate-700">
                                  <p className="font-semibold">{opt.label}</p>
                                  <p>{opt.prompt || opt.description}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                    
                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4" layout>
                       <h3 className={cn("text-xl font-semibold whitespace-nowrap", isDark ? "text-gray-100" : "text-gray-800")}>
                        2. Define or Edit
                      </h3>
                      <div className="flex gap-3 shrink-0">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <motion.div whileHover={{ scale: 1.05, y: -1 }} whileTap={{ scale: 0.95 }}>
                                <Button 
                                  variant={mode === 'new' ? "default" : "outline"} 
                                  onClick={() => setMode('new')}
                                  className={cn(
                                    "rounded-lg px-4 py-2",
                                    mode === 'new' ? (isDark ? "bg-indigo-600 hover:bg-indigo-500" : "bg-indigo-500 hover:bg-indigo-600 text-white") : (isDark? "border-slate-600 hover:bg-slate-700" : "border-slate-300 hover:bg-slate-100")
                                  )}
                                >
                                  New Gene
                                </Button>
                              </motion.div>
                            </TooltipTrigger>
                            <TooltipContent className="rounded-lg text-xs p-2 bg-slate-800 text-white border-slate-700"><p>Generate a new DNA sequence from a description.</p></TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <motion.div whileHover={{ scale: 1.05, y: -1 }} whileTap={{ scale: 0.95 }}>
                              <Button 
                                variant={mode === 'edit' ? "default" : "outline"} 
                                onClick={() => setMode('edit')}
                                className={cn(
                                  "rounded-lg px-4 py-2",
                                  mode === 'edit' ? (isDark ? "bg-indigo-600 hover:bg-indigo-500" : "bg-indigo-500 hover:bg-indigo-600 text-white") : (isDark? "border-slate-600 hover:bg-slate-700" : "border-slate-300 hover:bg-slate-100")
                                )}
                              >
                                Edit Gene
                              </Button>
                              </motion.div>
                            </TooltipTrigger>
                            <TooltipContent className="rounded-lg text-xs p-2 bg-slate-800 text-white border-slate-700"><p>Modify an existing DNA sequence.</p></TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </motion.div>
                    
                    <motion.div variants={itemVariants} className="mb-6" layout>
                      <div className="flex justify-between items-center mb-2">
                        <Label htmlFor="gene-input" className="text-sm font-medium">
                          {mode === 'new' ? 'Describe Gene Properties (or use template above)' : 'Input DNA Sequence (ACGT)'}
                        </Label>
                        <span className="text-xs opacity-70">
                          {input.length} chars / {mode === 'new' ? '~' + numTokens + ' target' : 'any length'}
                        </span>
                      </div>
                      <Textarea 
                        id="gene-input"
                        value={input} 
                        onChange={e => setInput(e.target.value)} 
                        rows={8}
                        placeholder={
                          mode === 'new' 
                            ? (selectedSpecies.prompt && selectedSpecies.label !== "Custom Template" ? "Using: " + selectedSpecies.label + ". Refine details or add specifics..." : "e.g., 'A human gene for increased muscle density, resistant to lactic acid buildup...'")
                            : "Paste raw DNA sequence (A, C, G, T nucleotides only)..."
                        } 
                        className={cn(
                          "font-mono text-sm rounded-xl p-4 shadow-inner",
                          isDark ? "bg-slate-900 border-slate-700 placeholder-slate-500 focus:border-indigo-500" : "bg-white border-gray-300 placeholder-gray-400 focus:border-indigo-500"
                        )} 
                      />
                    </motion.div>
                    
                    <motion.div variants={itemVariants} layout>
                      <Popover open={isAdvancedSettingsOpen} onOpenChange={setIsAdvancedSettingsOpen}>
                        <PopoverTrigger asChild>
                           <motion.div whileHover={{ scale: 1.02, y: -1 }} className="w-full">
                          <Button variant="outline" className={cn("w-full flex justify-between items-center rounded-xl p-4 text-base", isDark ? "border-slate-600 hover:bg-slate-700/50" : "border-slate-300 hover:bg-slate-100/50")}>
                            <span>Advanced Evo2 Parameters</span>
                            <ChevronDownIcon className={cn("h-5 w-5 transition-transform duration-300", isAdvancedSettingsOpen ? "rotate-180" : "")} />
                          </Button>
                          </motion.div>
                        </PopoverTrigger>
                        <PopoverContent 
                          side="bottom" 
                          align="start" 
                          className={cn("w-[calc(100vw-2rem)] sm:w-[calc(100vw-4rem)] md:w-[600px] p-0 rounded-2xl shadow-xl border", isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-300")} style={{ zIndex: 50 }}
                        >
                          <ScrollArea className="h-[450px] rounded-2xl">
                            <div className="p-6 space-y-8">
                              <div>
                                <h4 className="font-medium mb-3">Core Parameters</h4>
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <Label>Tokens (length)</Label>
                                      <span className="text-xs">{numTokens}</span>
                                    </div>
                                    <Slider 
                                      value={[numTokens]} 
                                      min={50} 
                                      max={1000} 
                                      step={10} 
                                      onValueChange={(vals) => setNumTokens(vals[0])} 
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <Label>Temperature</Label>
                                      <span className="text-xs">{temperature.toFixed(2)}</span>
                                    </div>
                                    <Slider 
                                      value={[temperature]} 
                                      min={0.1} 
                                      max={1.0} 
                                      step={0.01} 
                                      onValueChange={(vals) => setTemperature(vals[0])} 
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <Label>Top K</Label>
                                      <span className="text-xs">{topK}</span>
                                    </div>
                                    <Slider 
                                      value={[topK]} 
                                      min={1} 
                                      max={40} 
                                      step={1} 
                                      onValueChange={(vals) => setTopK(vals[0])} 
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <Label>Top P</Label>
                                      <span className="text-xs">{topP.toFixed(2)}</span>
                                    </div>
                                    <Slider 
                                      value={[topP]} 
                                      min={0.1} 
                                      max={1.0} 
                                      step={0.01} 
                                      onValueChange={(vals) => setTopP(vals[0])} 
                                    />
                                  </div>
                                  
                                  <div className="flex items-center space-x-4">
                                    <Label>Random Seed</Label>
                                    <input 
                                      type="number" 
                                      value={randomSeed ?? ''} 
                                      onChange={e => setRandomSeed(e.target.value ? +e.target.value : undefined)} 
                                      placeholder="Optional" 
                                      className={cn(
                                        "w-24 p-1 text-sm rounded border",
                                        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"
                                      )}
                                    />
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-medium mb-3">Biological Parameters</h4>
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <Label>Target GC Content</Label>
                                      <span className="text-xs">{(targetGCContent * 100).toFixed(0)}%</span>
                                    </div>
                                    <Slider 
                                      value={[targetGCContent]} 
                                      min={0.3} 
                                      max={0.7} 
                                      step={0.01} 
                                      onValueChange={(vals) => setTargetGCContent(vals[0])} 
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <Label>Conservation Level</Label>
                                      <span className="text-xs">{(conservationLevel * 100).toFixed(0)}%</span>
                                    </div>
                                    <Slider 
                                      value={[conservationLevel]} 
                                      min={0.1} 
                                      max={1.0} 
                                      step={0.01} 
                                      onValueChange={(vals) => setConservationLevel(vals[0])} 
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <Label>Mutation Rate</Label>
                                      <span className="text-xs">{(mutationRate * 100).toFixed(2)}%</span>
                                    </div>
                                    <Slider 
                                      value={[mutationRate]} 
                                      min={0} 
                                      max={0.1} 
                                      step={0.001} 
                                      onValueChange={(vals) => setMutationRate(vals[0])} 
                                    />
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center justify-between space-x-2">
                                      <Label htmlFor="optimize-stability">Optimize Stability</Label>
                                      <Switch 
                                        id="optimize-stability" 
                                        checked={optimizeStability} 
                                        onCheckedChange={setOptimizeStability} 
                                      />
                                    </div>
                                    
                                    <div className="flex items-center justify-between space-x-2">
                                      <Label htmlFor="avoid-pathogenicity">Avoid Pathogenicity</Label>
                                      <Switch 
                                        id="avoid-pathogenicity" 
                                        checked={avoidPathogenicity} 
                                        onCheckedChange={setAvoidPathogenicity} 
                                      />
                                    </div>
                                    
                                    <div className="flex items-center justify-between space-x-2">
                                      <Label htmlFor="enhance-expression">Enhance Expression</Label>
                                      <Switch 
                                        id="enhance-expression" 
                                        checked={enhanceExpression} 
                                        onCheckedChange={setEnhanceExpression} 
                                      />
                                    </div>
                                    
                                    <div className="flex items-center justify-between space-x-2">
                                      <Label htmlFor="enable-logits">Enable Logits</Label>
                                      <Switch 
                                        id="enable-logits" 
                                        checked={enableLogits} 
                                        onCheckedChange={setEnableLogits} 
                                      />
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="target-organism">Target Organism</Label>
                                      <Select value={targetOrganism} onValueChange={setTargetOrganism}>
                                        <SelectTrigger className="w-full">
                                          <SelectValue placeholder="Select organism type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="mammal">Mammal</SelectItem>
                                          <SelectItem value="bird">Bird</SelectItem>
                                          <SelectItem value="reptile">Reptile</SelectItem>
                                          <SelectItem value="fish">Fish</SelectItem>
                                          <SelectItem value="amphibian">Amphibian</SelectItem>
                                          <SelectItem value="insect">Insect</SelectItem>
                                          <SelectItem value="plant">Plant</SelectItem>
                                          <SelectItem value="bacteria">Bacteria</SelectItem>
                                          <SelectItem value="virus">Virus</SelectItem>
                                          <SelectItem value="fungi">Fungi</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <Label htmlFor="target-function">Target Function</Label>
                                      <Select value={targetFunction} onValueChange={setTargetFunction}>
                                        <SelectTrigger className="w-full">
                                          <SelectValue placeholder="Select primary function" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="default">Default</SelectItem>
                                          <SelectItem value="enzyme">Enzyme</SelectItem>
                                          <SelectItem value="receptor">Receptor</SelectItem>
                                          <SelectItem value="structural">Structural</SelectItem>
                                          <SelectItem value="hormone">Hormone</SelectItem>
                                          <SelectItem value="signaling">Signaling</SelectItem>
                                          <SelectItem value="transport">Transport</SelectItem>
                                          <SelectItem value="immune">Immune</SelectItem>
                                          <SelectItem value="regulatory">Regulatory</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </ScrollArea>
                        </PopoverContent>
                      </Popover>
                    </motion.div>
                    
                    <motion.div variants={itemVariants} className="mt-8" layout>
                      <Button 
                        onClick={handleSubmit} 
                        disabled={loading || !input.trim()} 
                        className={cn(
                          "w-full rounded-xl text-lg py-3 transition-all duration-300 ease-in-out",
                          "focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-background",
                           isDark 
                            ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white"
                            : "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white",
                          loading ? "opacity-60 cursor-not-allowed brightness-75" : "hover:shadow-xl hover:scale-[1.02] hover:brightness-110"
                        )}
                        size="lg"
                      >
                        {loading ? (
                          <div className="flex items-center justify-center">
                            <Loader /> <span className="ml-3">Generating Sequence...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <MagnifyingGlassIcon className="mr-2 h-5 w-5" />
                            {mode === 'new' ? 'Generate DNA Sequence' : 'Process DNA Sequence'}
                          </div>
                        )}
                      </Button>
                    </motion.div>
                  </TabsContent>
                )}

                {activeTab === "results" && (
                  <TabsContent value="results" className="space-y-6 outline-none mt-0 pt-0">
                    {error && (
                       <motion.div 
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                        "p-4 mb-6 rounded-xl border text-center",
                        isDark ? "bg-red-900/40 border-red-700 text-red-200" : "bg-red-50 border-red-300 text-red-800"
                      )}>
                        <p className="font-semibold text-lg">Error Occurred</p>
                        <p className="text-sm mt-1">{error}</p>
                      </motion.div>
                    )}
                    
                    {loading && !sequence && (
                        <motion.div 
                            layout
                            initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.1, duration:0.3, ease:"circOut"}}
                            className="flex flex-col items-center justify-center py-12 text-center space-y-4 min-h-[300px]"
                        >
                            <Loader/>
                            <p className={cn("text-xl font-semibold", isDark ? "text-gray-200" : "text-gray-700")}>Analyzing & Generating...</p>
                            <p className={cn("text-base", isDark ? "text-gray-400" : "text-gray-500")}>Please wait, this may take a moment.</p>
                        </motion.div>
                    )}
                    
                    {!loading && sequence && (
                      <motion.div 
                        layout
                        className="space-y-6" 
                        initial="hidden" 
                        animate="visible"
                        variants={{ visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 }}}}
                       >
                        <motion.div variants={itemVariants} layout className={cn(
                          "rounded-2xl border",
                          isDark ? "bg-slate-800/60 border-slate-700" : "bg-white/60 border-slate-300 backdrop-blur-md"
                        )}>
                          <div className="flex justify-between items-center p-4 border-b dark:border-slate-700 border-slate-300 rounded-t-2xl">
                            <h3 className="font-semibold text-lg">Generated DNA Sequence</h3>
                            <div className="flex gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <motion.button whileHover={{scale:1.1, y: -1}} whileTap={{scale:0.9}}
                                      className={cn("p-2 rounded-md", isDark ? "hover:bg-slate-700" : "hover:bg-slate-200" )}
                                      onClick={copyToClipboard}
                                      aria-label="Copy DNA sequence"
                                    >
                                      {copySuccess ? <CheckIcon className="h-5 w-5 text-green-500" /> : <CopyIcon className="h-5 w-5" />}
                                    </motion.button>
                                  </TooltipTrigger>
                                  <TooltipContent className="rounded-lg text-xs p-2 bg-slate-800 text-white border-slate-700"><p>Copy sequence</p></TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                          <ScrollArea className="h-[200px] lg:h-[250px] rounded-b-2xl">
                            <div className={cn(
                              "p-4 text-sm font-mono break-all leading-relaxed",
                              isDark ? "text-gray-300" : "text-gray-700"
                            )}>
                              {sequence.split('').map((nucleotide, index) => (
                                <span key={index} className={getNucleotideColorClass(nucleotide, isDark)}>
                                  {nucleotide}
                                </span>
                              ))}
                            </div>
                          </ScrollArea>
                        </motion.div>
                        
                        {evo2Response && evo2Response.properties && (
                          <motion.div variants={itemVariants} layout className={cn(
                            "rounded-2xl border",
                            isDark ? "bg-slate-800/60 border-slate-700" : "bg-white/60 border-slate-300 backdrop-blur-md"
                          )}>
                            <div className="p-4 border-b dark:border-slate-700 border-slate-300 rounded-t-2xl"><h3 className="font-semibold text-lg">Sequence Properties</h3></div>
                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                              {evo2Response.properties.gc_content !== undefined && (
                                <div className="flex justify-between">
                                  <span className="text-sm font-medium">GC Content:</span>
                                  <span className="text-sm">{(evo2Response.properties.gc_content * 100).toFixed(2)}%</span>
                                </div>
                              )}
                              
                              {evo2Response.properties.melting_temperature !== undefined && (
                                <div className="flex justify-between">
                                  <span className="text-sm font-medium">Melting Temperature:</span>
                                  <span className="text-sm">{evo2Response.properties.melting_temperature.toFixed(1)}°C</span>
                                </div>
                              )}
                              
                              {evo2Response.properties.stability_score !== undefined && (
                                <div className="flex justify-between">
                                  <span className="text-sm font-medium">Stability Score:</span>
                                  <span className="text-sm">{evo2Response.properties.stability_score.toFixed(2)}</span>
                                </div>
                              )}
                              
                              {evo2Response.properties.pathogenicity_score !== undefined && (
                                <div className="flex justify-between">
                                  <span className="text-sm font-medium">Pathogenicity Score:</span>
                                  <span className="text-sm">{evo2Response.properties.pathogenicity_score.toFixed(2)}</span>
                                </div>
                              )}
                              
                              {evo2Response.properties.expression_level !== undefined && (
                                <div className="flex justify-between">
                                  <span className="text-sm font-medium">Expression Level:</span>
                                  <span className="text-sm">{evo2Response.properties.expression_level.toFixed(2)}</span>
                                </div>
                              )}
                              
                              {evo2Response.properties.toxicity_score !== undefined && (
                                <div className="flex justify-between">
                                  <span className="text-sm font-medium">Toxicity Score:</span>
                                  <span className="text-sm">{evo2Response.properties.toxicity_score.toFixed(2)}</span>
                                </div>
                              )}
                            </div>
                            
                            {evo2Response.function_predictions && (
                              <div className="mt-4">
                                <h4 className="text-sm font-medium mb-2">Function Predictions</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {Object.entries(evo2Response.function_predictions).map(([key, value]) => (
                                    <div key={key} className="flex justify-between">
                                      <span className="text-sm capitalize">{key.replace('_', ' ')}:</span>
                                      <span className="text-sm">{(Number(value) * 100).toFixed(1)}%</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {evo2Response.properties.binding_sites && evo2Response.properties.binding_sites.length > 0 && (
                              <div className="mt-4">
                                <h4 className="text-sm font-medium mb-2">Binding Sites</h4>
                                <div className="grid grid-cols-1 gap-2">
                                  {evo2Response.properties.binding_sites.map((site, index) => (
                                    <div key={index} className="flex justify-between text-sm">
                                      <span>{site.name} (Pos {site.position})</span>
                                      <span>Score: {site.score.toFixed(2)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                        
                        {serializedExplanation && (
                          <motion.div variants={itemVariants} layout className={cn(
                            "rounded-2xl border",
                            isDark ? "bg-slate-800/60 border-slate-700" : "bg-white/60 border-slate-300 backdrop-blur-md"
                          )}>
                            <div className="p-4 border-b dark:border-slate-700 border-slate-300 rounded-t-2xl"><h3 className="font-semibold text-lg">DNA Analysis</h3></div>
                            <div className="p-4 overflow-x-auto">
                              <article className={cn(
                                "prose prose-sm max-w-none prose-indigo dark:prose-invert",
                                "prose-headings:font-serif prose-headings:text-lg prose-headings:mb-2",
                                "prose-p:mb-3 prose-p:leading-relaxed",
                                "prose-table:border prose-th:p-2 prose-td:p-2 prose-table:rounded-lg"
                              )}>
                                <MDXRemote {...serializedExplanation} />
                              </article>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                    
                    {!loading && !sequence && !error && (
                       <motion.div 
                        layout
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration:0.3, ease:"circOut" }}
                        className="flex flex-col items-center justify-center py-12 text-center space-y-4 min-h-[300px]"
                       >
                        <div className={cn(
                          "w-20 h-20 rounded-full flex items-center justify-center mb-4 text-indigo-500 dark:text-purple-400",
                          isDark ? "bg-slate-800" : "bg-slate-100"
                        )}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                            <path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/><circle cx="12" cy="12" r="4"/>
                          </svg>
                        </div>
                        <h3 className="text-2xl font-semibold mb-1">No Results Yet</h3>
                        <p className={cn("text-base max-w-md", isDark ? "text-gray-400" : "text-gray-500")}>
                          Head to the &ldquo;Design&rdquo; tab, describe your gene, and let the AI work its magic!
                        </p>
                      </motion.div>
                    )}
                  </TabsContent>
                )}

                {activeTab === "visualization" && (
                  <TabsContent value="visualization" className="space-y-6 outline-none mt-0 pt-0">
                     {sequence ? (
                      <motion.div 
                        layout
                        className="space-y-6" 
                        initial="hidden" 
                        animate="visible"
                        variants={{ visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 }}}}
                      >
                        <motion.div variants={itemVariants} layout className={cn(
                          "rounded-2xl border p-4 md:p-6",
                          isDark ? "bg-slate-800/60 border-slate-700" : "bg-white/60 border-slate-300 backdrop-blur-md"
                        )}>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="viz-mode" className="block mb-2 text-sm font-medium">View Mode</Label>
                              <Select value={visualizationMode} onValueChange={(val: any) => setVisualizationMode(val)}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select view" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="linear">Linear</SelectItem>
                                  <SelectItem value="circular">Circular</SelectItem>
                                  <SelectItem value="3d">3D Structure</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <Label htmlFor="zoom-level" className="text-sm font-medium">Zoom Level</Label>
                                <span className="text-xs">{zoomLevel.toFixed(1)}x</span>
                              </div>
                              <Slider
                                id="zoom-level"
                                value={[zoomLevel]}
                                min={0.5}
                                max={5}
                                step={0.1}
                                onValueChange={(vals) => setZoomLevel(vals[0])}
                              />
                            </div>
                            
                            <div className="flex flex-col space-y-3">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="highlight-features">Highlight Features</Label>
                                <Switch
                                  id="highlight-features"
                                  checked={highlightFeatures}
                                  onCheckedChange={setHighlightFeatures}
                                />
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <Label htmlFor="show-annotations">Show Annotations</Label>
                                <Switch
                                  id="show-annotations"
                                  checked={showAnnotations}
                                  onCheckedChange={setShowAnnotations}
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                        
                        <motion.div variants={itemVariants} layout className={cn(
                          "rounded-2xl border overflow-hidden shadow-xl",
                          isDark ? "bg-slate-800/60 border-slate-700" : "bg-white/60 border-slate-300 backdrop-blur-md"
                        )}>
                          <div className="relative" style={{ minHeight: "450px", height: "500px" }}>
                            <DNAViewer
                              sequence={sequence}
                              mode={visualizationMode}
                              zoomLevel={zoomLevel}
                              highlightFeatures={highlightFeatures}
                              showAnnotations={showAnnotations}
                              properties={evo2Response?.properties}
                              isDark={isDark}
                            />
                          </div>
                        </motion.div>
                        
                        {evo2Response && (
                          <motion.div variants={itemVariants} layout className={cn(
                            "rounded-2xl border",
                            isDark ? "bg-slate-800/60 border-slate-700" : "bg-white/60 border-slate-300 backdrop-blur-md"
                          )}>
                            <div className="p-4 border-b dark:border-slate-700 border-slate-300 rounded-t-2xl"><h3 className="font-semibold text-lg">DNA Analytics</h3></div>
                            <div className="p-4 md:p-6">
                              <DNAAnalyzer 
                                sequence={sequence}
                                properties={evo2Response.properties}
                                isDark={isDark}
                              />
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div 
                        layout
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration:0.3, ease:"circOut" }}
                        className="flex flex-col items-center justify-center py-12 text-center space-y-4 min-h-[300px]"
                      >
                        <div className={cn(
                          "w-20 h-20 rounded-full flex items-center justify-center mb-4 text-indigo-500 dark:text-purple-400",
                          isDark ? "bg-slate-800" : "bg-slate-100"
                        )}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                          </svg>
                        </div>
                        <h3 className="text-2xl font-semibold mb-1">No DNA Available</h3>
                        <p className={cn("text-base max-w-md", isDark ? "text-gray-400" : "text-gray-500")}>
                          Generate a DNA sequence in the &ldquo;Design&rdquo; tab to visualize it.
                        </p>
                        <motion.div whileHover={{scale:1.05, y: -1}} className="mt-6">
                        <Button 
                          variant="outline" 
                          className="rounded-lg py-2.5 px-5 text-base"
                          onClick={() => setActiveTab("input")}
                        >
                          Go to Gene Designer
                        </Button>
                        </motion.div>
                      </motion.div>
                    )}
                  </TabsContent>
                )}
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}