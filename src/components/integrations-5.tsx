
"use client"
import React, { ReactNode } from 'react'
import { Gemini, Replit, MagicUI, VSCodium, MediaWiki, GooglePaLM } from '@/components/logos'
import { cn } from '@/lib/utils'
import Image from 'next/image'

export default function IntegrationsSection() {
    return (
        <section>
            <div className="py-24 md:py-32">
                <div className="mx-auto max-w-5xl px-6">
                    <div className="aspect-16/10 group relative mx-auto flex max-w-[22rem] items-center justify-between sm:max-w-sm">
                        <div
                            role="presentation"
                            className="bg-linear-to-b border-foreground/5 absolute inset-0 z-10 aspect-square animate-spin items-center justify-center rounded-full border-t from-lime-500/15 to-transparent to-25% opacity-0 duration-[3.5s] group-hover:opacity-100 dark:from-white/5"></div>
                        <div
                            role="presentation"
                            className="bg-linear-to-b border-foreground/5 absolute inset-16 z-10 aspect-square scale-90 animate-spin items-center justify-center rounded-full border-t from-blue-500/15 to-transparent to-25% opacity-0 duration-[3.5s] group-hover:opacity-100"></div>
                        <div className="bg-linear-to-b from-muted-foreground/15 absolute inset-0 flex aspect-square items-center justify-center rounded-full border-t to-transparent to-25%">
                            <IntegrationCard className="-translate-x-1/6 absolute left-0 top-1/4 -translate-y-1/4">
                                <Gemini />
                            </IntegrationCard>
                            <IntegrationCard className="absolute top-0 -translate-y-1/2">
                                <Replit />
                            </IntegrationCard>
                            <IntegrationCard className="translate-x-1/6 absolute right-0 top-1/4 -translate-y-1/4">
                                <MagicUI />
                            </IntegrationCard>
                        </div>
                        <div className="bg-linear-to-b from-muted-foreground/15 absolute inset-16 flex aspect-square scale-90 items-center justify-center rounded-full border-t to-transparent to-25%">
                            <IntegrationCard className="absolute top-0 -translate-y-1/2">
                                <VSCodium />
                            </IntegrationCard>
                            <IntegrationCard className="absolute left-0 top-1/4 -translate-x-1/4 -translate-y-1/4">
                                <MediaWiki />
                            </IntegrationCard>
                            <IntegrationCard className="absolute right-0 top-1/4 -translate-y-1/4 translate-x-1/4">
                                <GooglePaLM />
                            </IntegrationCard>
                        </div>
                    
                        <div className="absolute inset-x-0 bottom-0 mx-auto my-2 flex w-fit justify-center gap-2">
                            <div className="bg-muted relative z-20 rounded-full border p-1">
                                <IntegrationCard
                                    className="shadow-black-950/10 dark:bg-background size-14 border-black/20 shadow-xl dark:border-white/25 dark:shadow-white/15"
                                    isCenter={true}>
                                  <Image
                                    src="/Nuro1.png"
                                    alt="Nuro Logo"
                                    width={30}
                                    height={30}
                                    className="size-60"
                                  />
                                </IntegrationCard>
                            </div>
                        </div>
                    </div>
                    </div>

        {/* Text and button */}
        <div className="relative z-20 max-w-lg mx-auto mt-16 space-y-6 text-center">
          <div className="inline-block px-3 py-1 text-md font-medium text-teal-800 bg-teal-100 rounded-full dark:bg-teal-900/30 dark:text-teal-300">
            Trusted by thousands of biotech companies
          </div>
          <h2 className="text-3xl font-bold text-balance md:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
            Accelerate DNA Sequencing & Mutation Analysis
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-lg">
            Connect seamlessly with your biotech workflow to enhance genetic analysis and mutation detection using advanced AI.
          </p>
        
        </div>
      </div>
    </section>
  )
}
type IntegrationCardProps = {
  children: ReactNode
  className?: string
  isCenter?: boolean
}

const IntegrationCard = ({
  children,
  className,
  isCenter = false,
}: IntegrationCardProps) => (
  <div
    className={cn(
      'relative z-30 flex size-12 rounded-full border bg-white shadow-sm shadow-black/5 dark:bg-white/5 dark:backdrop-blur-md transition-all duration-300 hover:shadow-md',
      className
    )}
  >
    <div className={cn('m-auto size-fit *:size-5', isCenter && '*:size-8')}>
      {children}
    </div>
  </div>
)