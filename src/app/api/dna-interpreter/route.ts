

/* eslint-disable @typescript-eslint/no-explicit-any */


// app/api/analyze-dna/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

export const runtime = 'edge'

// — CONFIG ——
const GEMINI_MODEL = 'gemini-2.5-flash-preview-04-17' as const
const THINKING_BUDGET = 2096

if (!process.env.GOOGLE_API_KEY) {
  throw new Error('GOOGLE_API_KEY is not set')
}
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY })

// — TYPES ——
interface AnalysisProps {
  [key: string]: unknown
  gc_content?: number
  melting_temperature?: number
}

interface ApiResult {
  from_api: boolean
  result: unknown
}

// — FALLBACKS ——
// Removing tryBlastNCBI, tryBlastEBI, and tryHmmerPfam functions as we will rely solely on LLM.

// — ROUTE ——
export async function POST(req: NextRequest): Promise<NextResponse<ApiResult>> {
  console.log('POST /api/dna-interpreter: received request (LLM-only mode)');
  let body: unknown;
  try {
    body = await req.json();
  } catch (err) {
    console.error('invalid JSON payload', err);
    return NextResponse.json({ from_api: false, result: { error: 'Invalid JSON' } }, { status: 400 });
  }

  const { sequence, properties } = body as Record<string, unknown>;
  if (typeof sequence !== 'string' || sequence.trim() === '') {
    console.error('`sequence` is not a non-empty string', sequence);
    return NextResponse.json({ from_api: false, result: { error: '`sequence` must be a non-empty string' } }, { status: 400 });
  }
  console.log('sequence length =', sequence.length);

  const props: AnalysisProps = (properties && typeof properties === 'object') ? (properties as AnalysisProps) : {};

  console.log('Proceeding directly to LLM-based DNA analysis.');
  
  const prompt = `
You are a highly sophisticated DNA analysis and bioinformatics expert AI. Your task is to analyze the provided DNA sequence and return a comprehensive analysis **exclusively in a valid JSON object format.** Do not include any explanatory text or markdown formatting outside of the JSON structure itself.

**DNA Sequence to Analyze:**
\`\`\`dna
${sequence}
\`\`\`

**Provided Properties (if any, for context):**
\`\`\`json
${JSON.stringify(props, null, 2)}
\`\`\`

**Analysis Instructions & Output JSON Schema:**

Your JSON output MUST strictly conform to the following structure. Be as definitive and confident as possible in your findings, drawing on your extensive biological knowledge. If the sequence is short or ambiguous, provide the most plausible interpretation.

\`\`\`json
{
  "sequence_identity": {
    "most_probable_gene_name": "string | null (e.g., 'TP53 tumor suppressor', 'APOE apolipoprotein E', 'Novel Kinesin-like Protein X', 'Putative non-coding RNA Y', 'Segment of Mitochondrial D-Loop'. Be specific. If unknown but resembles a family, state e.g., 'Unknown gene with G-protein coupled receptor features'.)",
    "most_probable_gene_symbol": "string | null (e.g., 'TP53', 'APOE', 'NKLX', 'MIR101'. Provide standard symbol if known.)",
    "organism_context_suggestion": "string | null (e.g., 'Human (Homo sapiens)', 'Mouse (Mus musculus)', 'General Eukaryotic', 'Bacterial - likely E. coli based on codon usage', 'Viral - retroviral sequence characteristics'. Make an educated guess.)",
    "identification_confidence_level": "string (One of: 'Very High', 'High', 'Medium', 'Low', 'Very Low - Highly Speculative')",
    "identification_rationale": "string (Briefly explain the basis for your identification or the reason for uncertainty. E.g., 'Strong homology (98%) to known human TP53 sequence in exons 4-7.', 'Contains conserved domains typical of kinase family.', 'Short sequence, limited homology, speculative identification based on GC content and minimal ORF.')"
  },
  "general_analysis_summary": {
    "sequence_length_bp": ${sequence.length},
    "gc_content_percent": "number | null (e.g., 45.5. Calculate this value.)",
    "estimated_molecular_weight_kDa": "number | null (Approximate, if a primary protein product is predicted, otherwise null.)",
    "number_of_predicted_orfs": "number (Count of Open Reading Frames > 50 amino acids, or a relevant threshold.)"
  },
  "predicted_features_and_elements": [
    {
      "feature_id": "string (e.g., 'ORF_1', 'Predicted_Exon_1', 'rRNA_gene_fragment', 'Enhancer_Motif_A')",
      "feature_type": "string (e.g., 'Protein-coding sequence (CDS)', 'Open Reading Frame (ORF)', 'Exon', 'Intron', 'Non-coding RNA (ncRNA)', 'tRNA', 'rRNA', 'Promoter Region', 'Enhancer Element', 'Repetitive Element')",
      "start_bp": "number (1-based)",
      "end_bp": "number (1-based)",
      "strand": "string ('+' or '-')",
      "predicted_function_or_role": "string | null (e.g., 'Encodes a putative DNA-binding protein.', 'Component of ribosomal machinery.', 'May regulate transcription of nearby genes.')",
      "prediction_confidence": "string ('High', 'Medium', 'Low')"
    }
  ],
  "functional_and_biological_insights": {
    "dominant_predicted_biological_process": "string | null (e.g., 'DNA repair', 'Metabolic process - glycolysis', 'Cell signaling - receptor tyrosine kinase pathway', 'Transcriptional regulation')",
    "potential_molecular_function": "string | null (e.g., 'ATP binding', 'Transcription factor activity', 'Catalytic activity - hydrolase', 'Structural molecule activity')",
    "hypothesized_pathway_involvement": "string | null (e.g., 'MAPK signaling pathway', 'Ubiquitin-proteasome system', 'None apparent')",
    "possible_phenotypic_implications_speculation": "string | null (e.g., 'Alterations could impact cell cycle control.', 'May relate to drug resistance if expressed in cancer cells.', 'No clear phenotypic link from sequence alone.')"
  },
  "structural_sequence_characteristics": {
    "codon_usage_analysis_summary": "string | null (If ORFs are predicted: e.g., 'Codon usage consistent with human genes.', 'Biased towards A/T-rich codons, suggesting bacterial or mitochondrial origin.')",
    "identified_repeat_sequences": "string[] | null (e.g., ['Tandem repeat (AGAT)n at 150-180bp', 'Potential Alu-like dispersed repeat fragment'])",
    "predicted_secondary_structures_rna": "string[] | null (If sequence suggests RNA: e.g., ['Stable hairpin loop at 30-55bp predicted with -15.2 kcal/mol stability', 'Potential pseudoknot structure'])"
  },
  "evolutionary_and_comparative_genomics_notes": {
    "speculated_closest_homologs_or_gene_family": "string | null (e.g., 'Shows distant similarity to ABC transporter family proteins.', 'No significant homology found to known sequences in standard databases, potentially novel or rapidly evolving.')",
    "inferred_conservation_level": "string | null (e.g., 'Likely highly conserved if it is a core metabolic enzyme.', 'Possibly species-specific or lineage-specific if no broad homology is found.')"
  },
  "analysis_limitations_and_disclaimers": "string (E.g., 'Predictions are based on computational analysis of a short DNA sequence and require experimental validation.', 'Functional insights are speculative without further biological context.', 'The sequence may be incomplete or represent a fragment.')"
}
\`\`\`

**Key Directives for Your Analysis (Incorporate these into your JSON output):**
1.  **Gene/Feature Identification:** Always attempt to identify the sequence. If it strongly resembles a known gene, name it (e.g., "TP53 gene"). If it's a variant, state it. If novel but similar to a known family (e.g., kinase domain), classify it (e.g., "Novel Serine/Threonine Kinase-like sequence"). If highly ambiguous, clearly state this but still offer the *most plausible* interpretation or classification.
2.  **Confidence and Rationale:** Use the "confidence" fields and "rationale" fields to clearly state the strength and basis of your predictions.
3.  **Definitive Language:** Present your findings with scientific assertiveness. Frame educated guesses as strong hypotheses supported by sequence features.
4.  **Completeness:** Populate ALL fields in the JSON schema. Use null only if information is genuinely not determinable or not applicable for that specific sequence.
5.  **Internal Knowledge Only:** Base your entire analysis on your internal knowledge and the provided sequence/properties. Do not simulate or mention external database calls.
`;

    let llmApiResult: unknown;

    try {
      const llmRes = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          temperature: 0.2, // Lower temperature for more deterministic and factual-sounding output
          topK: 10,         // Adjust TopK and TopP for focused output
          topP: 0.7,
          maxOutputTokens: 4096, // Increased max tokens for potentially larger JSON
          thinkingConfig: { thinkingBudget: THINKING_BUDGET },
        },
      });

      const raw = llmRes.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
      const match = raw.match(/^{[\s\S]*}\s*$/m); // Regex to extract JSON block

      if (!match || !match[0]) {
        console.error('LLM output did not contain a parsable JSON block. Raw output:', raw);
        throw new Error('LLM output did not return a valid JSON structure.');
      }
      
      llmApiResult = JSON.parse(match[0]);
      console.log('Successfully parsed JSON from LLM output.');

    } catch (llmError: any) {
      console.error('LLM analysis failed:', llmError);
      return NextResponse.json({ 
        from_api: false, 
        result: { 
          error: 'LLM analysis failed or returned invalid data.', 
          details: llmError.message,
          raw_llm_output: llmError.raw // assuming raw might be attached to custom errors
        } 
      }, { status: 500 });
    }
  
  // Since we are only using LLM, from_api is always false.
  return NextResponse.json({ from_api: false, result: llmApiResult });
}
