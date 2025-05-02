export function getNucleotideColorClass(nucleotide: string, isDark = false): string {
  switch (nucleotide.toUpperCase()) {
    case "A":
      return isDark ? "text-rose-400" : "text-rose-600"; // Adenine - Red/Rose
    case "T":
      return isDark ? "text-sky-400" : "text-sky-600";   // Thymine - Blue/Sky
    case "G":
      return isDark ? "text-emerald-400" : "text-emerald-600"; // Guanine - Green/Emerald
    case "C":
      return isDark ? "text-amber-400" : "text-amber-600"; // Cytosine - Yellow/Amber
    default:
      return isDark ? "text-gray-400" : "text-gray-600";
  }
}

export function getClassificationColorClasses(classification: string): string {
  if (!classification) return "bg-yellow-100 text-yellow-800";
  const lowercaseClass = classification.toLowerCase();

  if (lowercaseClass.includes("pathogenic")) {
    return "bg-red-100 text-red-800";
  } else if (lowercaseClass.includes("benign")) {
    return "bg-green-100 text-green-800";
  } else {
    return "bg-yellow-100 text-yellow-800";
  }
}
