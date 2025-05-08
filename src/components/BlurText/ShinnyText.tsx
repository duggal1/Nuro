import { TextShimmerWave } from "../chatbot/components/ui/text-shimmer-wave";

// Thinking: Violet to Blue
export function ThinkingShimmer() {
  return (
    <TextShimmerWave
      className='[--base-color:#aa00ff] [--base-gradient-color:#ca4fff]'
      duration={1}
      spread={1}
      zDistance={1}
      scaleDistance={1.1}
      rotateYDistance={20}
    >
      Thinking...
    </TextShimmerWave>
  );
}

// Searching: Cyan to Blue
export function SearchingShimmer() {
  return (
    <TextShimmerWave
      className='[--base-color:#0091ff] [--base-gradient-color:#00fbff]'
      duration={1}
      spread={1}
      zDistance={1}
      scaleDistance={1.1}
      rotateYDistance={20}
    >
      Searching...
    </TextShimmerWave>
  );
}

// Researching: Indigo to Aqua
export function ResearchingShimmer() {
  return (
    <TextShimmerWave
      className='[--base-color:#443bf5] [--base-gradient-color:#5100ff]'
      duration={1}
      spread={1}
      zDistance={1}
      scaleDistance={1.1}
      rotateYDistance={20}
    >
      Researching...
    </TextShimmerWave>
  );
}

// Image Generating: Purple to Pink (unchanged, as requested)
export function ImageGeneratingShimmer() {
  return (
    <TextShimmerWave
      className='[--base-color:#9900ff] [--base-gradient-color:#ff00fb]'
      duration={1}
      spread={1}
      zDistance={1}
      scaleDistance={1.1}
      rotateYDistance={20}
    >
      Generating Images...
    </TextShimmerWave>
  );
}

// Parsing: Orange to Yellow
export function ParsingShimmer() {
  return (
    <TextShimmerWave
      className='[--base-color:#ff8008] [--base-gradient-color:#ffc837]'
      duration={1}
      spread={1}
      zDistance={1}
      scaleDistance={1.1}
      rotateYDistance={20}
    >
      Parsing...
    </TextShimmerWave>
  );
}