/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import {Search , ChevronLeft, Dna, Database, Sparkles, Info, BrainCircuit, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import GeneViewer from "@/components/Nuro/components/gene-viewer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  type ChromosomeFromSeach,
  type GeneFromSearch,
  type GenomeAssemblyFromSearch,
  getAvailableGenomes,
  getGenomeChromosomes,
  searchGenes,
} from "@/utils/genome-api";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Loader } from "@/components/Loader";
import { HeroHeader } from "@/components/hero9-header";

type Mode = "browse" | "search";

export default function HomePage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  const [genomes, setGenomes] = useState<GenomeAssemblyFromSearch[]>([]);
  const [selectedGenome, setSelectedGenome] = useState<string>("hg38");
  const [chromosomes, setChromosomes] = useState<ChromosomeFromSeach[]>([]);
  const [selectedChromosome, setSelectedChromosome] = useState<string>("chr1");
  const [selectedGene, setSelectedGene] = useState<GeneFromSearch | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeneFromSearch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("search");
  const [loadingProgress, setLoadingProgress] = useState(0);



  
  // Simulate progress during loading states
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          const next = prev + Math.random() * 15;
          return next > 90 ? 90 : next;
        });
      }, 400);
      
      return () => {
        clearInterval(interval);
        setLoadingProgress(100);
        // Reset progress after animation completes
        setTimeout(() => setLoadingProgress(0), 600);
      };
    }
  }, [isLoading]);

  useEffect(() => {
    const fetchGenomes = async () => {
      try {
        setIsLoading(true);
        const data = await getAvailableGenomes();
        if (data.genomes && data.genomes["Human"]) {
          setGenomes(data.genomes["Human"]);
        }
      } catch (err) {
        setError("Failed to load genome data");
        toast.error("Failed to load genome data", {
          icon: <AlertTriangle className="h-4 w-4" />,
          description: "There was a problem with your genome data request"
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchGenomes();
  }, []);

  useEffect(() => {
    const fetchChromosomes = async () => {
      try {
        setIsLoading(true);
        const data = await getGenomeChromosomes(selectedGenome);
        setChromosomes(data.chromosomes);
        if (data.chromosomes.length > 0) {
          setSelectedChromosome(data.chromosomes[0]!.name);
        }
      } catch (err) {
        setError("Failed to load chromosome data");
        toast.error("Failed to load chromosome data", {
          icon: <AlertTriangle className="h-4 w-4" />,
          description: "There was a problem with your chromosome data request"
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchChromosomes();
  }, [selectedGenome]);

  const performGeneSearch = async (
    query: string,
    genome: string,
    filterFn?: (gene: GeneFromSearch) => boolean,
  ) => {
    try {
      setIsLoading(true);
      const data = await searchGenes(query, genome);
      const results = filterFn ? data.results.filter(filterFn) : data.results;

      setSearchResults(results);
      if (results.length > 0) {
        toast.success(`Found ${results.length} genes`, {
          icon: <Database className="h-4 w-4" />,
          description: `Click on any gene to view detailed analysis`
        });
      } else {
        toast.info("No genes found matching your criteria", {
          icon: <Info className="h-4 w-4" />,
          description: "Try different search terms or select another chromosome"
        });
      }
    } catch (err) {
      setError("Failed to search genes");
      toast.error("Failed to search genes", {
        icon: <AlertTriangle className="h-4 w-4" />,
        description: "There was a problem with your search request"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedChromosome || mode !== "browse") return;
    performGeneSearch(
      selectedChromosome,
      selectedGenome,
      (gene: GeneFromSearch) => gene.chrom === selectedChromosome,
    );
  }, [selectedChromosome, selectedGenome, mode]);

  const handleGenomeChange = (value: string) => {
    setSelectedGenome(value);
    setSearchResults([]);
    setSelectedGene(null);
  };

  const switchMode = (newMode: Mode) => {
    if (newMode === mode) return;

    setSearchResults([]);
    setSelectedGene(null);
    setError(null);

    if (newMode === "browse" && selectedChromosome) {
      performGeneSearch(
        selectedChromosome,
        selectedGenome,
        (gene: GeneFromSearch) => gene.chrom === selectedChromosome,
      );
    }

    setMode(newMode);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    performGeneSearch(searchQuery, selectedGenome);
  };

  const loadBRCA1Example = () => {
    setMode("search");
    setSearchQuery("BRCA1");
    performGeneSearch("BRCA1", selectedGenome);
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: "easeOut" }
  };

  const itemFade = {
    hidden: { opacity: 0, y: 10 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.2 }
    }
  };

  return (
    <>
  <HeroHeader/>
    
  {isLoading && <Loader />}
        
      

        <main className="container px-6 py-8 mx-auto">
          <AnimatePresence mode="wait">
            {selectedGene ? (
              <motion.div
                key="geneViewer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <GeneViewer
                  gene={selectedGene}
                  genomeId={selectedGenome}
                  onClose={() => setSelectedGene(null)}
                />
              </motion.div>
            ) : (
              <motion.div
                key="searchInterface"
                {...fadeIn}
                className="max-w-6xl mx-auto"
              >
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="mt-30"
                >
                  <Card className={cn(
                    "overflow-hidden border-none shadow-2xl rounded-2xl",
                    isDark 
                      ? "bg-gradient-to-b from-black to-black/80 backdrop-blur-md text-white" 
                      : "bg-gradient-to-b from-white to-gray-100 backdrop-blur-md text-gray-950"
                  )}>
                    <CardHeader className={cn(
                      "pt-6 pb-4",
                      isDark ? "border-b border-gray-800" : "border-b border-gray-300"
                    )}>
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="space-y-1">
                          <CardTitle className={cn(
                            "flex items-center gap-2 font-serif text-xl md:text-2xl",
                            isDark ? "text-white" : "text-gray-900"
                          )}>
                            <Database className="h-5 w-5 text-indigo-500" />
                            Genome Assembly
                          </CardTitle>
                          <p className={cn(
                            "text-sm font-sans",
                            isDark ? "text-gray-400" : "text-gray-500"
                          )}>
                            Select a reference genome to begin your analysis
                          </p>
                        </div>
                        <div className={cn(
                          "flex items-center gap-1.5 rounded-full px-3 py-1.5",
                          isDark 
                            ? "bg-indigo-500/10 text-indigo-300 border border-indigo-800/50" 
                            : "bg-indigo-50 text-indigo-700 border border-indigo-100"
                        )}>
                          <Dna className="h-4 w-4" />
                          <span className="text-xs font-medium">Human Genome</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid gap-8 md:grid-cols-2">
                        <div className="space-y-3">
                          <label className={cn(
                            "text-sm font-medium font-sans",
                            isDark ? "text-gray-300" : "text-gray-700"
                          )}>
                            Reference Genome
                          </label>
                          <Select
                            value={selectedGenome}
                            onValueChange={handleGenomeChange}
                            disabled={isLoading}
                          >
                            <SelectTrigger className={cn(
                              "h-12 w-full rounded-xl border transition-all", 
                              isDark 
                                ? "border-gray-800 bg-gray-900/30 focus:ring-indigo-500/20" 
                                : "border-gray-200 bg-white focus:ring-indigo-500/20"
                            )}>
                              <SelectValue placeholder="Select genome assembly" />
                            </SelectTrigger>
                            <SelectContent className={cn(
                              "rounded-xl border",
                              isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
                            )}>
                              {genomes.map((genome) => (
                                <SelectItem 
                                  key={genome.id} 
                                  value={genome.id}
                                  className={cn(
                                    "rounded-lg transition-colors",
                                    isDark
                                      ? "data-[highlighted]:bg-gray-800 data-[highlighted]:text-white"
                                      : "data-[highlighted]:bg-indigo-50 data-[highlighted]:text-indigo-900"
                                  )}
                                >
                                  <div className="flex items-center">
                                    <span>{genome.id} - {genome.name}</span>
                                    {genome.active && (
                                      <span className={cn(
                                        "ml-2 rounded-full px-2 py-0.5 text-xs",
                                        isDark ? "bg-indigo-900/50 text-indigo-300" : "bg-indigo-100 text-indigo-700"
                                      )}>
                                        active
                                      </span>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {selectedGenome && (
                            <p className={cn(
                              "text-xs",
                              isDark ? "text-gray-500" : "text-gray-500"
                            )}>
                              {
                                genomes.find((genome) => genome.id === selectedGenome)
                                  ?.sourceName
                              }
                            </p>
                          )}
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <BrainCircuit className={cn(
                              "h-5 w-5", 
                              isDark ? "text-purple-400" : "text-purple-500"
                            )} />
                            <h3 className={cn(
                              "text-sm font-medium font-sans",
                              isDark ? "text-gray-300" : "text-gray-700"
                            )}>
                              Quick Example
                            </h3>
                          </div>
                          
                          <motion.div 
                            className={cn(
                              "flex items-center gap-4 rounded-xl border p-5",
                              isDark 
                                ? "border-purple-900/20 bg-purple-950/10" 
                                : "border-purple-100 bg-purple-50/50"
                            )}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-full",
                              isDark ? "bg-purple-900/30" : "bg-purple-100"
                            )}>
                              <Info className={cn(
                                "h-5 w-5",
                                isDark ? "text-purple-300" : "text-purple-700"
                              )} />
                            </div>
                            <div className="space-y-1">
                              <h4 className={cn(
                                "text-sm font-medium font-sans",
                                isDark ? "text-gray-200" : "text-gray-800"
                              )}>
                                Try BRCA1 Analysis
                              </h4>
                              <p className={cn(
                                "text-xs leading-relaxed font-sans",
                                isDark ? "text-gray-400" : "text-gray-600"
                              )}>
                                Explore breast cancer gene BRCA1 with a single click
                              </p>
                            </div>
                            <Button
                              className={cn(
                                "ml-auto cursor-pointer rounded-xl font-sans",
                                isDark 
                                  ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:brightness-110" 
                                  : "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:brightness-110"
                              )}
                              onClick={loadBRCA1Example}
                            >
                              Try Now
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
                  className="mt-10"
                >
                  <Card className={cn(
                    "overflow-hidden border-none shadow-2xl rounded-2xl",
                    isDark 
                      ? "bg-gradient-to-b from-black to-black/80 backdrop-blur-md text-white" 
                      : "bg-gradient-to-b from-white to-gray-100 backdrop-blur-md text-gray-950"
                  )}>
                    <CardHeader className={cn(
                      "pt-6 pb-4",
                      isDark ? "border-b border-gray-800" : "border-b border-gray-300"
                    )}>
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="space-y-1">
                          <CardTitle className={cn(
                            "flex items-center gap-2 font-serif text-xl md:text-2xl",
                            isDark ? "text-white" : "text-gray-900"
                          )}>
                            <Search className="h-5 w-5 text-indigo-500" />
                            Gene Browser
                          </CardTitle>
                          <p className={cn(
                            "text-sm font-sans",
                            isDark ? "text-gray-400" : "text-gray-500"
                          )}>
                            Search for genes by name or browse by chromosome
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <Tabs
                        value={mode}
                        onValueChange={(value) => switchMode(value as Mode)}
                        className="space-y-6"
                      >
                        <TabsList className={cn(
                          "grid w-full grid-cols-2 rounded-xl p-1",
                          isDark ? "bg-gray-900" : "bg-gray-100"
                        )}>
                          <TabsTrigger
                            className={cn(
                              "cursor-pointer rounded-lg py-3 text-sm font-medium transition-all font-sans",
                              isDark 
                                ? "data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white" 
                                : "data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
                            )}
                            value="search"
                          >
                            Search Genes
                          </TabsTrigger>
                          <TabsTrigger
                            className={cn(
                              "cursor-pointer rounded-lg py-3 text-sm font-medium transition-all font-sans",
                              isDark 
                                ? "data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white" 
                                : "data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
                            )}
                            value="browse"
                          >
                            Browse Chromosomes
                          </TabsTrigger>
                        </TabsList>

                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <TabsContent value="search" className="mt-0 space-y-6">
                            <form
                              onSubmit={handleSearch}
                              className="space-y-4"
                            >
                              <div className="relative">
                                <div className={cn(
                                  "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4",
                                  isDark ? "text-gray-500" : "text-gray-400"
                                )}>
                                  <Search className="h-5 w-5" />
                                </div>
                                <Input
                                  type="text"
                                  placeholder="Enter gene symbol or name (e.g., BRCA1, TP53)"
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  className={cn(
                                    "h-12 rounded-xl pl-12 text-base transition-all ring-offset-0 focus-visible:ring-2",
                                    isDark 
                                      ? "border-gray-800 bg-gray-900/30 focus-visible:ring-indigo-500/30" 
                                      : "border-gray-200 bg-white focus-visible:ring-indigo-500/30"
                                  )}
                                />
                                <motion.div 
                                  whileHover={{ scale: 1.02 }} 
                                  whileTap={{ scale: 0.98 }}
                                  className="absolute right-2 top-1/2 -translate-y-1/2"
                                >
                                  <Button
                                    type="submit"
                                    className={cn(
                                      "h-8 cursor-pointer rounded-lg px-4 text-white font-sans",
                                      isDark 
                                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 hover:brightness-110" 
                                        : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110"
                                    )}
                                    disabled={isLoading || !searchQuery.trim()}
                                  >
                                    Search
                                  </Button>
                                </motion.div>
                              </div>
                              <div className="flex justify-center">
                                <Button
                                  variant="link"
                                  className={cn(
                                    "h-auto cursor-pointer p-0 text-sm font-sans",
                                    isDark 
                                      ? "text-indigo-400 hover:text-indigo-300" 
                                      : "text-indigo-600 hover:text-indigo-700"
                                  )}
                                  onClick={loadBRCA1Example}
                                >
                                  Try BRCA1 example
                                </Button>
                              </div>
                            </form>
                          </TabsContent>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <TabsContent value="browse" className="mt-0 space-y-6">
                            <div className="space-y-4">
                              <h3 className={cn(
                                "text-sm font-medium font-sans",
                                isDark ? "text-gray-300" : "text-gray-700"
                              )}>
                                Select Chromosome
                              </h3>
                              <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto p-1 pr-2 scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-thumb-gray-400 scrollbar-track-transparent">
                                {chromosomes.map((chrom, index) => (
                                  <motion.div 
                                    key={chrom.name}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.02, duration: 0.2 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className={cn(
                                        "h-9 cursor-pointer rounded-lg font-sans",
                                        isDark 
                                          ? "border-gray-800 hover:bg-gray-800/50" 
                                          : "border-gray-200 hover:bg-gray-50",
                                        selectedChromosome === chrom.name && (
                                          isDark 
                                            ? "bg-indigo-900/20 border-indigo-700/50 text-indigo-300" 
                                            : "bg-indigo-50 border-indigo-200 text-indigo-700"
                                        )
                                      )}
                                      onClick={() => setSelectedChromosome(chrom.name)}
                                    >
                                      {chrom.name}
                                    </Button>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          </TabsContent>
                        </motion.div>
                      </Tabs>

                      {isLoading && (
                        <div className="flex justify-center py-6">
                          <Loader />
                        </div>
                      )}

                      {error && (
                        <motion.div 
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn(
                            "p-4 mt-4 text-sm rounded-xl flex items-center gap-3",
                            isDark 
                              ? "bg-red-950/10 text-red-300 border border-red-900/20" 
                              : "bg-red-50 text-red-600 border border-red-100"
                          )}
                        >
                          <div className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0",
                            isDark ? "bg-red-950/50" : "bg-red-100"
                          )}>
                            <Info className="h-4 w-4" />
                          </div>
                          <p className="font-sans">{error}</p>
                        </motion.div>
                      )}

                      <AnimatePresence>
                        {searchResults.length > 0 && !isLoading && (
                          <motion.div 
                            key="results"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-8"
                          >
                            <div className="mb-4 flex items-center justify-between">
                              <h4 className={cn(
                                "text-base font-medium font-serif",
                                isDark ? "text-gray-100" : "text-gray-900"
                              )}>
                                {mode === "search" ? (
                                  <>
                                    Search Results:{" "}
                                    <span className={cn(
                                      "text-sm font-sans",
                                      isDark ? "text-indigo-400" : "text-indigo-600"
                                    )}>
                                      {searchResults.length} genes
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    Genes on {selectedChromosome}:{" "}
                                    <span className={cn(
                                      "text-sm font-sans",
                                      isDark ? "text-indigo-400" : "text-indigo-600"
                                    )}>
                                      {searchResults.length} found
                                    </span>
                                  </>
                                )}
                              </h4>
                            </div>

                            <div className={cn(
                              "overflow-hidden rounded-xl border shadow-lg bg-white/10 dark:bg-black/20 backdrop-blur-sm",
                              isDark ? "border-gray-800" : "border-gray-200/50"
                            )}>
                              <Table>
                                <TableHeader>
                                  <TableRow className={cn(
                                    "hover:bg-transparent",
                                    isDark ? "bg-gray-900/80" : "bg-gray-50/80"
                                  )}>
                                    <TableHead className={cn(
                                      "py-3 text-xs font-medium font-sans",
                                      isDark ? "text-gray-300" : "text-gray-700"
                                    )}>
                                      Symbol
                                    </TableHead>
                                    <TableHead className={cn(
                                      "py-3 text-xs font-medium font-sans",
                                      isDark ? "text-gray-300" : "text-gray-700"
                                    )}>
                                      Name
                                    </TableHead>
                                    <TableHead className={cn(
                                      "py-3 text-xs font-medium font-sans",
                                      isDark ? "text-gray-300" : "text-gray-700"
                                    )}>
                                      Location
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {searchResults.map((gene, index) => (
                                    <motion.tr
                                      key={`${gene.symbol}-${index}`}
                                      variants={itemFade}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: index * 0.03, duration: 0.2 }}
                                      className={cn(
                                        "cursor-pointer border-b transition-colors",
                                        isDark 
                                          ? "border-gray-800 hover:bg-gray-900/50" 
                                          : "border-gray-100 hover:bg-indigo-50/30"
                                      )}
                                      onClick={() => {
                                        setSelectedGene(gene);
                                        toast.info(`Selected gene: ${gene.symbol}`, {
                                          icon: <Dna className="h-4 w-4" />,
                                          description: `Viewing detailed information and analysis options`
                                        });
                                      }}
                                    >
                                      <TableCell className={cn(
                                        "py-3 font-medium font-sans",
                                        isDark ? "text-indigo-400" : "text-indigo-600"
                                      )}>
                                        {gene.symbol}
                                      </TableCell>
                                      <TableCell className={cn(
                                        "py-3 max-w-md truncate font-sans",
                                        isDark ? "text-gray-300" : "text-gray-700"
                                      )}>
                                        {gene.name}
                                      </TableCell>
                                      <TableCell className={cn(
                                        "py-3 font-sans",
                                        isDark ? "text-gray-500" : "text-gray-500"
                                      )}>
                                        {gene.chrom}
                                      </TableCell>
                                    </motion.tr>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {!isLoading && !error && searchResults.length === 0 && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="flex flex-col items-center justify-center py-16 text-center"
                        >
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, type: "spring" }}
                            className={cn(
                              "mb-6 flex h-20 w-20 items-center justify-center rounded-full",
                              isDark ? "bg-gray-900" : "bg-gray-100"
                            )}
                          >
                            <Search className={cn(
                              "h-10 w-10",
                              isDark ? "text-gray-700" : "text-gray-300"
                            )} />
                          </motion.div>
                          <h3 className={cn(
                            "mb-2 text-lg font-medium font-serif",
                            isDark ? "text-gray-200" : "text-gray-800"
                          )}>
                            {mode === "search" ? "No Search Results Yet" : "Select a Chromosome"}
                          </h3>
                          <p className={cn(
                            "max-w-md text-sm leading-relaxed font-sans",
                            isDark ? "text-gray-400" : "text-gray-600"
                          )}>
                            {mode === "search"
                              ? "Enter a gene symbol or name in the search box above to begin exploring the genome"
                              : selectedChromosome
                                ? "No genes found on this chromosome. Try selecting a different one."
                                : "Select a chromosome from the list above to browse genes"}
                          </p>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
   
      </>
  );
}
