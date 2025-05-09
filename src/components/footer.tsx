"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { motion } from "framer-motion";
import { BlurredStagger } from "./ui/blurred-stagger-text";
import Image from "next/image";
import AnimationContainer from "./Contanier";

const socials = [
    {
      name: "GitHub",
      href: "https://github.com/your-org",
      svg: (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          fill="none" 
          viewBox="0 0 48 48" 
          id="github"
          className="w-6 h-6"
        >
          <rect width="48" height="48" fill="#000" rx="24"></rect>
          <path 
            fill="#fff" 
            fillRule="evenodd" 
            d="M31.4225 46.8287C29.0849 47.589 26.5901 48 24 48C21.4081 48 18.9118 47.5884 16.5728 46.8272C17.6533 46.9567 18.0525 46.2532 18.0525 45.6458C18.0525 45.3814 18.048 44.915 18.0419 44.2911C18.035 43.5692 18.0259 42.6364 18.0195 41.5615C11.343 43.0129 9.9345 38.3418 9.9345 38.3418C8.844 35.568 7.2705 34.8294 7.2705 34.8294C5.091 33.3388 7.4355 33.369 7.4355 33.369C9.843 33.5387 11.1105 35.8442 11.1105 35.8442C13.2525 39.5144 16.728 38.4547 18.096 37.8391C18.3135 36.2871 18.9345 35.2286 19.62 34.6283C14.2905 34.022 8.688 31.9625 8.688 22.7597C8.688 20.1373 9.6225 17.994 11.1585 16.3142C10.911 15.7065 10.0875 13.2657 11.3925 9.95888C11.3925 9.95888 13.4085 9.31336 17.9925 12.4206C19.908 11.8876 21.96 11.6222 24.0015 11.6114C26.04 11.6218 28.0935 11.8876 30.0105 12.4206C34.5915 9.31336 36.603 9.95888 36.603 9.95888C37.9125 13.2657 37.089 15.7065 36.8415 16.3142C38.3805 17.994 39.309 20.1373 39.309 22.7597C39.309 31.9849 33.6975 34.0161 28.3515 34.6104C29.2125 35.3519 29.9805 36.8168 29.9805 39.058C29.9805 41.2049 29.9671 43.0739 29.9582 44.3125C29.9538 44.9261 29.9505 45.385 29.9505 45.6462C29.9505 46.2564 30.3401 46.9613 31.4225 46.8287Z" 
            clipRule="evenodd"
          ></path>
        </svg>
      ),
    },
    {
      name: "Twitter",
      href: "https://twitter.com/your-org",
      svg: (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          enableBackground="new 0 0 100 100" 
          viewBox="0 0 100 100" 
          id="x"
          className="w-6 h-6"
        >
          <g>
            <path d="M69.7,8.7H30.4c-11.7,0-21.3,9.5-21.3,21.3v41.2c0,11.7,9.5,21.3,21.3,21.3h39.4c11.7,0,21.3-9.5,21.3-21.3V29.9 C91,18.2,81.5,8.7,69.7,8.7z M76.8,78.3l-15.4,0c-0.1,0-0.2,0-0.2-0.1L46.8,57.3c0,0-0.1,0-0.1,0C40.9,64,35.2,70.6,29.6,77.1 c-0.3,0.4-0.7,0.7-1,1c-0.1,0.1-0.2,0.1-0.3,0.1l-4.2,0c-0.1,0-0.2,0-0.1-0.1l20.5-23.8c0.1-0.1,0.1-0.2,0-0.3L24.1,24.3 c0,0,0-0.1,0-0.1h15.5c0.1,0,0.1,0,0.2,0.1L53.4,44c0,0,0,0,0.1,0l16.9-19.7c0.1-0.1,0.2-0.1,0.3-0.1l4.2,0c0.2,0,0.2,0.1,0.1,0.2 L55.6,46.9c-0.1,0.1-0.1,0.2,0,0.3l21.3,31C76.9,78.2,76.9,78.3,76.8,78.3z"></path>
            <path d="M37.8,27.8C37.8,27.8,37.8,27.8,37.8,27.8l-6.7,0c-0.1,0-0.1,0.1-0.1,0.2l32.2,46.7c0,0,0,0,0.1,0h6.6 c0.1,0,0.1-0.1,0.1-0.2L37.8,27.8z"></path>
          </g>
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      href: "https://linkedin.com/company/your-org",
      svg: (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="#fff" 
          aria-label="LinkedIn" 
          viewBox="0 0 512 512" 
          id="linkedin"
          className="w-6 h-6"
        >
          <rect width="512" height="512" fill="#0077b5" rx="15%"></rect>
          <circle cx="142" cy="138" r="37"></circle>
          <path stroke="#fff" strokeWidth="66" d="M244 194v198M142 194v198"></path>
          <path d="M276 282c0-20 13-40 36-40 24 0 33 18 33 45v105h66V279c0-61-32-89-76-89-34 0-51 19-59 32"></path>
        </svg>
      ),
    },
    {
      name: "Reddit",
      href: "https://reddit.com/r/your-subreddit",
      svg: (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          aria-label="Reddit" 
          viewBox="0 0 512 512" 
          id="reddit"
          className="w-6 h-6"
        >
          <rect width="512" height="512" fill="#f40" rx="15%"></rect>
          <g fill="#fff">
            <ellipse cx="256" cy="307" rx="166" ry="117"></ellipse>
            <circle cx="106" cy="256" r="42"></circle>
            <circle cx="407" cy="256" r="42"></circle>
            <circle cx="375" cy="114" r="32"></circle>
          </g>
          <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="#fff" strokeWidth="16" d="m256 196 23-101 73 15"></path>
            <path stroke="#f40" strokeWidth="13" d="m191 359c33 25 97 26 130 0"></path>
          </g>
          <g fill="#f40">
            <circle cx="191" cy="287" r="31"></circle>
            <circle cx="321" cy="287" r="31"></circle>
          </g>
        </svg>
      ),
    },
  ];
  

const links = [
  { title: "Features", href: "#" },
  { title: "Solution", href: "#" },
  { title: "Customers", href: "#" },
  { title: "Pricing", href: "#" },
  { title: "Help", href: "#" },
  { title: "About", href: "#" },
];

export default function FooterSection() {
  return (
    <AnimationContainer
      className="footer-nuro"
      animation="fade"
      delay={0}
      duration={0.8}
      once={false}
    >
      <footer className="py-16 md:py-32">
        <div className="mx-auto max-w-5xl px-6">
          {/* Logo + Name aligned horizontally */}
          <AnimationContainer
            className="flex items-center justify-center space-x-3"
            animation="fade"
            delay={0}
            duration={0.8}
            once={false}
          >
            <Link href="/" aria-label="go home" className="flex items-center">
              <Image
                src="/nuro-new.png"
                alt="Logo"
                width={40}
                height={40}
                className="w-10 h-10 hover:animate-spin"
              />
              <BlurredStagger
                text="Nuro"
                className="text-3xl font-bold text-black dark:text-white"
              />
            </Link>
          </AnimationContainer>

          {/* Nav links */}
          <AnimationContainer
            className="mt-8 flex flex-wrap justify-center gap-6 text-sm"
            animation="slide-up"
            delay={0.1}
            duration={0.6}
            once={false}
          >
            {links.map((link, idx) => (
              <motion.span
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.1 + idx * 0.05,
                  duration: 0.4,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
              >
                <Link
                  href={link.href}
                  className={cn(
                    "text-muted-foreground hover:text-primary block duration-150"
                  )}
                >
                  {link.title}
                </Link>
              </motion.span>
            ))}
          </AnimationContainer>

          {/* Social icons */}
          <AnimationContainer
            className="mt-8 flex justify-center space-x-6"
            animation="fade"
            delay={0.2}
            duration={0.6}
            once={false}
          >
            {socials.map((s, i) => (
              <Link
                key={i}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.name}
                className="hover:scale-110 transition-transform duration-200"
              >
                {s.svg}
              </Link>
            ))}
          </AnimationContainer>

          {/* Copyright */}
          <AnimationContainer
            className="mt-8 block text-center text-sm text-muted-foreground"
            animation="fade"
            delay={0.3}
            duration={0.6}
            once={false}
          >
            © {new Date().getFullYear()}  Nuro, All rights reserved 
          </AnimationContainer>
        </div>
      </footer>
    </AnimationContainer>
  );
}
