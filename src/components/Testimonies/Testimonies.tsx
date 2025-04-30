/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/utils";
import { TESTIMONIALS } from "./constants";
import { Marquee } from "@/components/magicui/marquee";
import { Testimonial, HighlightedTextProps, TestimonialCardProps, SplitIntoRowsFunction } from "@/types/testimonials";
import { FC, JSX } from 'react';
import BlurAccent from "../ui/BlurAccent";

// Split the testimonials into three rows for the marquee
const splitIntoRows: SplitIntoRowsFunction = (array, rows) => {
  const result = [];
  const itemsPerRow = Math.ceil(array.length / rows);
  
  for (let i = 0; i < rows; i++) {
    result.push(array.slice(i * itemsPerRow, (i + 1) * itemsPerRow));
  }
  
  return result;
};

const [firstRow, secondRow, thirdRow] = splitIntoRows<Testimonial>(TESTIMONIALS, 3);

// Helper function to parse review text and highlight parts wrapped in <highlight> tags
const HighlightedText: FC<HighlightedTextProps> = ({ text }) => {
  if (!text) return null;
  
  // Split the text by <highlight> and </highlight> tags
  const parts = text.split(/<highlight>|<\/highlight>/);
  
  return (
    <>
      {parts.map((part, index) => {
        // Even indices are regular text, odd indices are highlighted text
        if (index % 2 === 0) {
          return <span key={index} className="text-gray-950 dark:text-white">{part}</span>;
        } else {
          return <span key={index} className=" font-semibold text-blue-600 dark:text-blue-800">{part}</span>;
        }
      })}
    </>
  );
};

const TestimonialCard: FC<TestimonialCardProps> = ({
  userImage,
  name,
  username,
  review,
  companyName,
  companyLogo,
  rating,
}) => {
  return (
    <figure
      className={cn(
        "relative flex h-full w-80 flex-col cursor-pointer gap-3 overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:scale-105 hover:shadow-md",
        "border-gray-300 bg-gray-100 hover:bg-gray-50",
        "dark:border-gray-900 dark:bg-background dark:hover:bg-black",
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <img 
          className="h-10 w-10 rounded-full object-cover" 
          width="40" 
          height="40" 
          alt={name} 
          src={userImage} 
        />
        <div className="flex flex-col">
          <figcaption className="font-serif text-base font-medium text-gray-900 dark:text-white">
            {name}
          </figcaption>
          <p className="text-md font-medium text-gray-500 dark:text-gray-50">{username}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <img
          width={20}
          height={20} 
          src={companyLogo} 
          alt={companyName} 
          className="h-5 w-5 object-contain" 
        />
        <span className="text-md font-medium text-gray-900 dark:text-white">
          {companyName}
        </span>
        <div className="ml-auto flex">
          {[...Array(rating)].map((_, i) => (
            <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-green-600">
              <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
            </svg>
          ))}
        </div>
      </div>
      
      <blockquote className="font-serif text-md leading-relaxed">
        <HighlightedText text={review} />
      </blockquote>
    </figure>
  );
};

export function TestimonialsMarquee(): JSX.Element {
  return (
    <div className="w-full py-16">
      <div className="relative w-full -mt-12 overflow-hidden py-10">
        {/* First row */}
        <Marquee pauseOnHover className="py-4 [--duration:35s] [--gap:1rem]">
          {firstRow.map((testimonial) => (
            <TestimonialCard key={testimonial.username} {...testimonial} />
          ))}
        </Marquee>
        
        {/* Second row */}
        <Marquee pauseOnHover reverse className="py-4 [--duration:45s] [--gap:1rem]">
          {secondRow.map((testimonial) => (
            <TestimonialCard key={testimonial.username} {...testimonial} />
          ))}
        </Marquee>
        
        {/* Third row */}
        <Marquee pauseOnHover className="py-4 [--duration:40s] [--gap:1rem]">
          {thirdRow.map((testimonial) => (
            <TestimonialCard key={testimonial.username} {...testimonial} />
          ))}
        </Marquee>
        
        {/* Gradient overlays */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-white dark:from-black" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-white dark:from-black" />
        
        {/* Blur accents */}
        <BlurAccent position="top-left" />
        <BlurAccent position="bottom-right" />
      </div>
    </div>
  );
}