"use client"

import { useTheme } from "next-themes"
import { Sparkles } from "@/components/ui/sparkles"
import { BlurredStagger } from "../ui/new-text-effect"
import AnimationContainer from "../Contanier"


export function TryNuro() {
  const { theme } = useTheme()
  
  return (
    <div className="h-screen w-full overflow-hidden">
        <AnimationContainer animation="slide-up" delay={0.3} duration={0.8}>
      <div className="mx-auto mt-40 w-full max-w-3xl px-4">
        <div className="text-center mb-16">
          <BlurredStagger 
              text="Try Nuro " 
              className="
                 text-9xl font-black tracking-tight mb-3 text-indigo-800 dark:text-indigo-400
              "
          />
            <BlurredStagger 
              text="for free" 
              className="
                 text-9xl font-black tracking-tight mb-3 text-indigo-800 dark:text-indigo-400
              "
          />
             
        
        </div>
      </div>
      
      <div className="relative -mt-24 h-96 w-full overflow-hidden [mask-image:radial-gradient(50%_50%,white,transparent)]">
        <div className="absolute inset-0 before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_bottom_center,#4f46e5,transparent_70%)] before:opacity-40" />
        <div className="absolute -left-1/2 top-1/2 aspect-[1/0.7] z-10 w-[200%] rounded-[100%] border-t border-zinc-900/20 dark:border-white/20 bg-white dark:bg-zinc-900" />
        <Sparkles
          background="transparent"
          minSize={0.4}
          size={1.4}
          speed={0.5}
          minSpeed={1}
          density={5000}
          color={theme === 'dark' ? '#ffffff' : '#000000'}
          opacity={0.8}
          minOpacity={0.1}
        />
      </div>
      </AnimationContainer>
    </div>
  )
}