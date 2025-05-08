/* eslint-disable react-hooks/exhaustive-deps */

'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { DynamicIcon, type IconName } from 'lucide-react/dynamic'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { BlurredStagger } from './ui/new-text-effect'
import AnimationContainer from './Contanier'

// Register ScrollTrigger with GSAP
gsap.registerPlugin(ScrollTrigger)

type FAQItem = {
    id: string
    icon: IconName
    question: string
    answer: string
}

// Palette for colorful icons
const iconColorsPalette = [
    { bg: 'bg-sky-100', text: 'text-sky-700', darkBg: 'dark:bg-sky-700/30', darkText: 'dark:text-sky-300' },
    { bg: 'bg-amber-100', text: 'text-amber-700', darkBg: 'dark:bg-amber-700/30', darkText: 'dark:text-amber-300' },
    { bg: 'bg-emerald-100', text: 'text-emerald-700', darkBg: 'dark:bg-emerald-700/30', darkText: 'dark:text-emerald-300' },
    { bg: 'bg-rose-100', text: 'text-rose-700', darkBg: 'dark:bg-rose-700/30', darkText: 'dark:text-rose-300' },
    { bg: 'bg-violet-100', text: 'text-violet-700', darkBg: 'dark:bg-violet-700/30', darkText: 'dark:text-violet-300' },
];

export default function FAQsSection() {
    const sectionRef = useRef<HTMLElement>(null)
    const headingRef = useRef<HTMLHeadingElement>(null)
    const paragraphRef = useRef<HTMLParagraphElement>(null)
    const accordionRef = useRef<HTMLDivElement>(null)

    const [openItem, setOpenItem] = useState<string | null>(null)

    const faqItems: FAQItem[] = [
        {
            id: 'item-1',
            icon: 'brain',
            question: 'How does NeuroGene SaaS analyze genetic data for neurological insights?',
            answer: 'NeuroGene SaaS utilizes advanced AI algorithms to cross-reference your genetic markers with the latest neuroscience research. This allows us to identify potential predispositions and offer personalized insights for cognitive health and neurological well-being. All data is processed securely and anonymized to protect your privacy.',
        },
        {
            id: 'item-2',
            icon: 'shield-check',
            question: 'Is my genetic and personal data secure with NeuroGene SaaS?',
            answer: 'Absolutely. We employ end-to-end encryption, adhere to global data protection standards like HIPAA and GDPR, and utilize decentralized storage principles. This ensures your data is anonymized and protected with the highest level of security. You retain full control over your data and its usage.',
        },
        {
            id: 'item-3',
            icon: 'clipboard-check',
            question: 'What kind of actionable recommendations can I expect from NeuroGene SaaS?',
            answer: 'Based on your unique neuro-genetic profile, NeuroGene SaaS provides personalized lifestyle, dietary, and cognitive exercise recommendations. These are scientifically designed to optimize brain health, enhance cognitive functions, and potentially mitigate identified genetic risks, empowering you to take proactive steps.',
        },
        {
            id: 'item-4',
            icon: 'link-2',
            question: 'Can NeuroGene SaaS integrate with my existing health tracking apps?',
            answer: 'Yes, we are continuously expanding our integration capabilities. NeuroGene SaaS can currently sync with a range of popular health and wellness platforms to provide a more holistic view of your neuro-cognitive landscape. Please visit our integrations page for the most current list of compatible apps.',
        },
        {
            id: 'item-5',
            icon: 'database-zap',
            question: 'How often is the genetic database and research underpinning NeuroGene SaaS updated?',
            answer: 'Our dedicated scientific team and AI algorithms continuously update our knowledge base with the latest peer-reviewed research in neuroscience and genetics. The platform is typically updated with significant findings on a monthly basis, ensuring your insights and recommendations remain current and cutting-edge.',
        },
    ]

    // GSAP Animations for section intro
    useEffect(() => {
        if (!sectionRef.current || !headingRef.current || !paragraphRef.current || !accordionRef.current) {
            return;
        }

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top 85%', // Trigger a bit later for content to be more in view
                toggleActions: 'play none none none',
            },
        })

        // Animate heading
        tl.fromTo(
            headingRef.current,
            { opacity: 0, y: 70, filter: 'blur(6px)' }, // Slightly less blur, more y offset
            { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.3, ease: 'expo.out' } // Longer duration
        )
        // Animate paragraph, starting slightly after heading animation begins
        .fromTo(
            paragraphRef.current,
            { opacity: 0, y: 50, filter: 'blur(4px)' },
            { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.3, ease: 'expo.out', delay: -1.1 } // Increased overlap
        )
        // Animate accordion block, starting slightly after paragraph animation begins
        .fromTo(
            accordionRef.current,
            { opacity: 0, y: 60, scale: 0.97, filter: 'blur(4px)' },
            { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 1.5, ease: 'expo.out', delay: -1.0 } // Increased overlap
        )

        return () => {
            tl.kill();
            ScrollTrigger.getAll().forEach(trigger => {
                if (trigger.vars.trigger === sectionRef.current) {
                    trigger.kill();
                }
            });
        }
    }, [])

    // Framer Motion variants for accordion items
    const itemVariants = {
        hidden: { opacity: 0, y: 35, scale: 0.96 }, // More pronounced entry
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: "spring",
                damping: 25, // Softer spring: less bounce
                stiffness: 200, // Softer spring: slightly slower
                delay: i * 0.1, // Increased stagger for smoother perception
            },
        }),
    }

    // Framer Motion variants for accordion content (answer)
    const contentVariants = {
        collapsed: { opacity: 0, height: 0, marginTop: 0, filter: 'blur(1px)' }, // Very subtle blur for collapse
        open: {
            opacity: 1,
            height: 'auto',
            marginTop: '0.75rem', // from pb-3 on original AccordionContent
            filter: 'blur(0px)',
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }, // Quintic ease-out, slightly longer for very smooth feel
        },
    }

    return (
        <section ref={sectionRef} className="bg-gray-50 dark:bg-black py-24 md:py-32 overflow-hidden">
              <AnimationContainer animation="slide-up" delay={0.3} duration={0.8}>
            <div className="mx-auto max-w-5xl px-4 md:px-6">
                <div className="flex flex-col gap-12 md:flex-row md:gap-20">
                    <div className=" w-1/2">
                        <div className="sticky top-24 space-y-4">
                        <BlurredStagger 
                            text="Your Questions <br>Answered."
                            className="text-6xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl"
                        />


                            <p ref={paragraphRef} className="text-lg text-muted-foreground dark:text-slate-300">
                                Discover how NeuroGene SaaS unlocks personalized neuro-genetic insights.
                                Can&apos;t find what you&apos;re looking for? Our expert{' '}
                                <Link
                                    href="#"
                                    className="bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-pink-400 rounded"
                                >
                                    support team
                                </Link>
                                {' '}is ready to assist.
                            </p>
                        </div>
                    </div>
                    <div ref={accordionRef} className="md:w-3/5 lg:w-2/3">
                        <Accordion
                            type="single"
                            collapsible
                            className="w-full space-y-4"
                            value={openItem ?? undefined}
                            onValueChange={(value) => setOpenItem(value === openItem ? null : value)}
                        >
                            {faqItems.map((item, index) => {
                                const colorSet = iconColorsPalette[index % iconColorsPalette.length];
                                return (
                                    <motion.div
                                        key={item.id}
                                        custom={index}
                                        variants={itemVariants}
                                        initial="hidden"
                                        animate="visible"
                                    >
                                        <AccordionItem
                                            value={item.id}
                                            // Updated border colors: gray-300 for light, gray-800 for dark
                                            className={`bg-background dark:bg-neutral-900 shadow-xl rounded-xl border border-gray-300 dark:border-gray-800 transition-all duration-300 hover:shadow-2xl focus-within:ring-2 focus-within:ring-primary-500 dark:focus-within:ring-primary-400 focus-within:ring-offset-2 dark:focus-within:ring-offset-black`}
                                        >
                                            <AccordionTrigger className="group flex w-full cursor-pointer items-center justify-between px-6 py-5 text-left hover:no-underline">
                                                <div className="flex items-center gap-4">
                                                    <motion.div
                                                        className={`flex size-8 items-center justify-center rounded-lg ${colorSet.bg} ${colorSet.text} ${colorSet.darkBg} ${colorSet.darkText} transition-colors duration-300`}
                                                        animate={{ rotate: openItem === item.id ? 90 : 0 }}
                                                        transition={{ type: "spring", stiffness: 250, damping: 25, duration: 0.3 }} // Adjusted spring for rotation
                                                    >
                                                        <DynamicIcon
                                                            name={item.icon}
                                                            className="m-auto size-5"
                                                        />
                                                    </motion.div>
                                                    <span className="text-base font-semibold text-gray-800 dark:text-slate-100 group-hover:text-primary dark:group-hover:text-primary-300 transition-colors">
                                                        {item.question}
                                                    </span>
                                                </div>
                                            </AccordionTrigger>
                                            <AnimatePresence initial={false}>
                                                {openItem === item.id && (
                                                    <motion.section
                                                        key="content"
                                                        initial="collapsed"
                                                        animate="open"
                                                        exit="collapsed"
                                                        variants={contentVariants}
                                                        className="overflow-hidden"
                                                    >
                                                        <AccordionContent className="px-6 pt-0 pb-5">
                                                            <div className="pl-[calc(2rem+0.75rem)]">
                                                                <p className="text-base text-muted-foreground dark:text-slate-400">
                                                                    {item.answer}
                                                                </p>
                                                            </div>
                                                        </AccordionContent>
                                                    </motion.section>
                                                )}
                                            </AnimatePresence>
                                        </AccordionItem>
                                    </motion.div>
                                );
                            })}
                        </Accordion>
                    </div>
                </div>
            </div>
            </AnimationContainer>
        </section>
    )
}
