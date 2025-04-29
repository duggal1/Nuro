"use client"

import { Sparkles } from "@/components/ui/sparkles"


export function TryNuro() {

  
  return (
    <div className="h-screen w-full overflow-hidden">
      <div className="mx-auto mt-40 w-full max-w-3xl px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-3">
            <span className="text-indigo-900 dark:text-indigo-200">
              Trusted by experts.
            </span>
          </h2>
          <h3 className="text-3xl font-medium mt-2">
            Used by the leaders.
          </h3>
        </div>
      </div>
      
      <div className="relative -mt-24 h-96 w-full overflow-hidden [mask-image:radial-gradient(50%_50%,white,transparent)]">
        <div className="absolute inset-0 before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_bottom_center,#e82a96,transparent_70%)] before:opacity-40" />
        <div className="absolute -left-1/2 top-1/2 aspect-[1/0.7] z-10 w-[200%] rounded-[100%] border-t border-zinc-900/20 dark:border-white/20 bg-white dark:bg-zinc-900" />
        <Sparkles
          background="transparent"
          minSize={0.4}
          size={1.4}
          speed={0.5}
          minSpeed={1}
          density={5000}
          color="#ffff"      // Changed to a fuchsia color
          opacity={0.8}
          minOpacity={0.1}
        />
      </div>
    </div>
  )
}