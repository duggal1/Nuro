import AnimationContainer from "../Contanier";
import { BlurredStagger } from "../ui/blurred-stagger-text";
import { TestimonialsMarquee } from "./Testimonies";

export default function Testimonials() {
  return (
    <main className="min-h-screen w-full">
          <AnimationContainer animation="slide-up" delay={0.3} duration={0.8}>
      <section className="py-20">
        <div className="mx-auto px-4 text-center">
         
            <BlurredStagger 
            text=" What Our Customers Say 😍  " 
            className="font-serif text-6xl font-bold leading-none tracking-tight text-gray-950 dark:text-white"
          />
          <p className="mx-auto mt-6 max-w-2xl font-medium text-xl leading-snug tracking-tight text-gray-500 dark:text-gray-400">
            Axion is revolutionizing enterprise sales with advanced AI that seamlessly replaces entire teams, automating workflows, optimizing outreach, and closing deals with unmatched efficiency.
          </p>
        </div>
      </section>
      
      <div className="w-full overflow-hidden">
        <TestimonialsMarquee />
      </div>
      </AnimationContainer>
    </main>
  );
}