"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  GeneBounds,
  GeneDetailsFromSearch,
  GeneFromSearch,
} from "@/utils/genome-api";

import { ExternalLink, Info } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function GeneInformation({
  gene,
  geneDetail,
  geneBounds,
}: {
  gene: GeneFromSearch;
  geneDetail: GeneDetailsFromSearch | null;
  geneBounds: GeneBounds | null;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 5 },
    show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Card className={cn(
        "overflow-hidden border-none shadow-xl rounded-2xl",
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
            <Info className="h-5 w-5 text-indigo-500" />
            Gene Information
          </CardTitle>
        </CardHeader>
        <CardContent className="relative py-6">
          <div className="absolute inset-0 pointer-events-none opacity-10">
            <div className={cn(
              "absolute -inset-[40%] blur-3xl rounded-full",
              isDark ? "bg-indigo-900/30" : "bg-indigo-100/80"
            )} />
          </div>
          
          <motion.div 
            className="grid gap-6 md:grid-cols-2 relative z-10"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <div className="space-y-3">
              <motion.div variants={item} className="flex">
                <span className={cn(
                  "min-w-28 w-28 text-xs font-sans",
                  isDark ? "text-gray-400" : "text-gray-500"
                )}>
                  Symbol:
                </span>
                <span className="text-xs font-medium">{gene.symbol}</span>
              </motion.div>
              <motion.div variants={item} className="flex">
                <span className={cn(
                  "min-w-28 w-28 text-xs font-sans",
                  isDark ? "text-gray-400" : "text-gray-500"
                )}>
                  Name:
                </span>
                <span className="text-xs font-sans">{gene.name}</span>
              </motion.div>
              {gene.description && gene.description !== gene.name && (
                <motion.div variants={item} className="flex">
                  <span className={cn(
                    "min-w-28 w-28 text-xs font-sans",
                    isDark ? "text-gray-400" : "text-gray-500"
                  )}>
                    Description:
                  </span>
                  <span className="text-xs font-sans">{gene.description}</span>
                </motion.div>
              )}
              <motion.div variants={item} className="flex">
                <span className={cn(
                  "min-w-28 w-28 text-xs font-sans",
                  isDark ? "text-gray-400" : "text-gray-500"
                )}>
                  Chromosome:
                </span>
                <span className="text-xs font-sans">{gene.chrom}</span>
              </motion.div>
              {geneBounds && (
                <motion.div variants={item} className="flex">
                  <span className={cn(
                    "min-w-28 w-28 text-xs font-sans",
                    isDark ? "text-gray-400" : "text-gray-500"
                  )}>
                    Position:
                  </span>
                  <span className="text-xs font-sans">
                    {Math.min(geneBounds.min, geneBounds.max).toLocaleString()} -{" "}
                    {Math.max(geneBounds.min, geneBounds.max).toLocaleString()} (
                    {Math.abs(
                      geneBounds.max - geneBounds.min + 1,
                    ).toLocaleString()}{" "}
                    bp)
                    {geneDetail?.genomicinfo?.[0]?.strand === "-" &&
                      " (reverse strand)"}
                  </span>
                </motion.div>
              )}
            </div>
            <div className="space-y-3">
              {gene.gene_id && (
                <motion.div variants={item} className="flex">
                  <span className={cn(
                    "min-w-28 w-28 text-xs font-sans",
                    isDark ? "text-gray-400" : "text-gray-500"
                  )}>
                    Gene ID:
                  </span>
                  <span className="text-xs font-sans">
                    <a
                      href={`https://www.ncbi.nlm.nih.gov/gene/${gene.gene_id}`}
                      target="_blank"
                      className={cn(
                        "flex items-center group hover:underline",
                        isDark ? "text-indigo-400" : "text-indigo-600"
                      )}
                    >
                      {gene.gene_id}
                      <ExternalLink className="inline-block w-3 h-3 ml-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                  </span>
                </motion.div>
              )}
              {geneDetail?.organism && (
                <motion.div variants={item} className="flex">
                  <span className={cn(
                    "w-28 text-xs font-sans",
                    isDark ? "text-gray-400" : "text-gray-500"
                  )}>
                    Organism:
                  </span>
                  <span className="text-xs font-sans">
                    {geneDetail.organism.scientificname}{" "}
                    {geneDetail.organism.commonname &&
                      ` (${geneDetail.organism.commonname})`}
                  </span>
                </motion.div>
              )}

              {geneDetail?.summary && (
                <motion.div variants={item} className="mt-4">
                  <h3 className={cn(
                    "mb-2 text-xs font-medium",
                    isDark ? "text-gray-300" : "text-gray-700"
                  )}>
                    Summary:
                  </h3>
                  <p className={cn(
                    "text-xs leading-relaxed font-sans rounded-xl p-4",
                    isDark 
                      ? "bg-gray-900/30 text-gray-300" 
                      : "bg-gray-50/80 text-gray-700"
                  )}>
                    {geneDetail.summary}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
