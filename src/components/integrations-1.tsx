'use client'

import * as React from 'react'
import { JSX, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, useAnimation, useInView } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowUpRight } from 'lucide-react'
import { BioDataPipelineIcon, CRISPRIntegrationIcon, GeneExpressionIDEIcon, PyTorchGenomicsIcon, ResearchKnowledgeBaseIcon, SequencePredictionIcon } from './Nuro-logos'
import { BlurredStagger } from './ui/blurred-stagger-text'
import AnimationContainer from './Contanier'


// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// Define proper types for integration items
interface Integration {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
}

// Define interface for CardWithAnimation props
interface CardWithAnimationProps {
  title: string;
  description: string;
  children: React.ReactNode;
  link: string;
  index: number;
}
const integrations: Integration[] = [
    {
      title: "CRISPR Integration",
      description: "Plug in your CRISPR gene-editing workflows and get AI-driven analysis for pinpoint DNA targeting and edits.",
      icon: <CRISPRIntegrationIcon />,
      link: '/integrations/crispr'
    },
    {
      title: "PyTorch Genomics",
      description: "Run deep-learning models tuned for genomic data to analyze and predict sequence behavior.",
      icon: <PyTorchGenomicsIcon  />,
      link: '/integrations/pytorch'
    },
    {
      title: "BioData Pipeline",
      description: "Ingest and process massive DNA datasets seamlessly with our optimized ML pipelines.",
      icon: <BioDataPipelineIcon />,
      link: '/integrations/biodata'
    },
    {
      title: "Gene Expression IDE",
      description: "Build and test gene-expression analysis code in an environment tailored for computational biology.",
      icon: <GeneExpressionIDEIcon/>,
      link: '/integrations/genexpression'
    },
    {
      title: "Research Knowledge Base",
      description: "Tap into the latest scientific publications and databases to strengthen your gene-editing models.",
      icon: <ResearchKnowledgeBaseIcon />,
      link: '/integrations/research'
    },
    {
      title: "Sequence Prediction",
      description: "Use advanced ML predictors to forecast DNA edits and their likely outcomes before you run experiments.",
      icon: <SequencePredictionIcon />,
      link: '/integrations/sequence'
    }
  ];
  

export default function NuroClients(): JSX.Element {
  const sectionRef = useRef<HTMLElement | null>(null)
  const headingRef = useRef<HTMLHeadingElement | null>(null)
  const descriptionRef = useRef<HTMLParagraphElement | null>(null)
  
  useEffect(() => {
    // GSAP animation for the heading and description
    if (!sectionRef.current || !headingRef.current || !descriptionRef.current) return
    
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 1.2, 
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
          }
        }
      )
      
      gsap.fromTo(
        descriptionRef.current,
        { opacity: 0, y: 15 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 1.2, 
          delay: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
          }
        }
      )
    }, sectionRef)
    
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="overflow-hidden">
        <AnimationContainer animation="slide-up" delay={0.3} duration={0.8}>
      <div className="py-24 md:py-32">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
      
          
            <BlurredStagger 
            text="Integrate with cutting-edge research tools 🔥" 
            className="text-balance text-3xl font-semibold md:text-4xl  text-gray-900 dark:text-gray-50"
            />
            <p 
              ref={descriptionRef} 
              className="text-muted-foreground mt-6 max-w-2xl mx-auto"
            >
              Connect your DNA research and gene editing workflows with powerful AI and machine learning tools specifically designed for genomic analysis.
            </p>
          </div>
          
          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {integrations.map((integration, index) => (
              <CardWithAnimation 
                key={integration.title} 
                title={integration.title}
                description={integration.description}
                link={integration.link}
                index={index}
              >
                {integration.icon}
              </CardWithAnimation>
            ))}
          </div>
        </div>
      </div>
      </AnimationContainer>
    </section>
  )
}

const CardWithAnimation: React.FC<CardWithAnimationProps> = ({ 
  title, 
  description, 
  children, 
  link, 
  index 
}) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(cardRef, { once: true, margin: "-5% 0px" })
  const controls = useAnimation()
  
  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [isInView, controls])
  
  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        delay: index * 0.08,
        ease: [0.22, 0.03, 0.26, 1]
      }
    }
  }
  
  const iconVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.4, ease: "easeOut" } }
  }

  const buttonVariants = {
    initial: { x: 0 },
    hover: { x: 3, transition: { duration: 0.3, ease: "easeOut" } }
  }

  return (
    <motion.div
      ref={cardRef}
      variants={variants}
      initial="hidden"
      animate={controls}
      whileHover={{ y: -4, transition: { duration: 0.3, ease: "easeOut" } }}
      className="h-full"
    >
      <Card className="p-6 h-full border border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm hover:border-blue-100 dark:hover:border-blue-900 hover:shadow-md hover:shadow-blue-50 dark:hover:shadow-blue-950/30 transition-all duration-300">
        <div className="relative h-full flex flex-col">
          <motion.div 
            className="*:size-12 p-2 rounded-lg bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-950/40 dark:to-teal-950/40"
            variants={iconVariants}
            initial="initial"
            whileHover="hover"
          >
            {children}
          </motion.div>
          
          <div className="space-y-2 py-6 flex-grow">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{title}</h3>
            <p className="text-muted-foreground text-sm">{description}</p>
          </div>
          
          <div className="flex gap-3 border-t border-dashed border-gray-100 dark:border-gray-800 pt-6">
            <motion.div
              variants={buttonVariants}
              initial="initial"
              whileHover="hover"
            >
              <Button
                asChild
                variant="secondary"
                size="sm"
                className="gap-1 pr-2 shadow-none bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-800/40 dark:text-blue-300"
              >
                <Link href={link} className="flex items-center">
                  Explore
                  <ArrowUpRight className="ml-1 size-3.5" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}