

"use client"





import { useState } from 'react'
import {

  MixerHorizontalIcon,
  LightningBoltIcon,
  TargetIcon,
  LayersIcon,
  CubeIcon
} from '@radix-ui/react-icons'
import { Dna } from 'lucide-react'

export default function Features() {
  const [hoveredCard, setHoveredCard] = useState(null)
  
  const features = [
    { 
      icon: Dna, 
      title: "DNA Sequencing", 
      description: "Advanced genomic mapping with precision accuracy down to the base pair level." 
    },
    { 
      icon: TargetIcon, 
      title: "Gene Editing", 
      description: "CRISPR-based tools for precise genetic modifications with intuitive controls." 
    },
    { 
      icon: MixerHorizontalIcon, 
      title: "Bio-synthesis", 
      description: "Automated protein and nucleic acid synthesis with real-time monitoring." 
    },
    { 
      icon: LightningBoltIcon, 
      title: "ML Predictions", 
      description: "Predictive modeling for protein folding and genetic expression patterns." 
    },
    { 
      icon: LayersIcon, 
      title: "Data Pipeline", 
      description: "Seamless Python integration with automated workflows for biodata analysis." 
    },
    { 
      icon: CubeIcon, 
      title: "Deep Learning", 
      description: "Neural networks optimized for genomic pattern recognition and classification." 
    }
  ]

  return (
    <section className="py-12 md:py-20 bg-white dark:bg-black text-black dark:text-white transition-colors duration-300">
      <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
        <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-8">
          <h2 className="text-balance text-3xl font-light tracking-tight lg:text-4xl">
            Redefining biotech infrastructure
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Where DNA science meets computational intelligence, delivering a seamless integration for advanced genomic research.
          </p>
        </div>
        
        <div className="relative mx-auto grid max-w-4xl sm:grid-cols-2 lg:grid-cols-3 gap-px">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group relative bg-white dark:bg-black border-t border-l border-gray-50 dark:border-gray-900 p-6 transition-all duration-700 ease-in-out"
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                transform: hoveredCard === index ? 'scale(1.01)' : 'scale(1)',
              }}
            >
              {/* "+" connector at right edge */}
              {index % 3 !== 2 && (
                <div 
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 z-10 pointer-events-none"
                  style={{
                    opacity: hoveredCard === index || hoveredCard === index + 1 ? 0.6 : 0,
                    transition: 'opacity 500ms ease-in-out'
                  }}
                >
                  <span className="absolute inset-0 flex items-center justify-center text-xs text-gray-400 dark:text-gray-600 font-light">+</span>
                </div>
              )}
              
              {/* "+" connector at bottom edge */}
              {index < features.length - 3 && (
                <div 
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 z-10 pointer-events-none"
                  style={{
                    opacity: hoveredCard === index || hoveredCard === index + 3 ? 0.6 : 0,
                    transition: 'opacity 500ms ease-in-out'
                  }}
                >
                  <span className="absolute inset-0 flex items-center justify-center text-xs text-gray-400 dark:text-gray-600 font-light">+</span>
                </div>
              )}
              
              <div className="space-y-3">
                <div 
                  className="text-gray-900 dark:text-gray-100"
                  style={{
                    transform: hoveredCard === index ? 'translateY(-1px)' : 'translateY(0)',
                    transition: 'transform 600ms ease-out'
                  }}
                >
                  <feature.icon className="w-4 h-4" />
                </div>
                <h3 
                  className="text-xs font-medium mt-2 tracking-wide"
                  style={{
                    transform: hoveredCard === index ? 'translateY(-1px)' : 'translateY(0)',
                    transition: 'transform 700ms ease-out'
                  }}
                >
                  {feature.title}
                </h3>
                <p 
                  className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed"
                  style={{
                    opacity: hoveredCard === index ? 1 : 0.8,
                    transition: 'opacity 800ms ease-in-out'
                  }}
                >
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}