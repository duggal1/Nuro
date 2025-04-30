
import CommunitySection from '@/components/content-6'
import FAQsSection from '@/components/faqs-3'
import HeroSection from '@/components/hero-section'
import { HeroHeader } from '@/components/hero9-header'
import NuroClients from '@/components/integrations-1'
import IntegrationsBeam from '@/components/integrations-4'
import IntegrationsSection from '@/components/integrations-5'
import Threads from '@/components/motion/thread'
import { NuroCTADemo } from '@/components/NuroCTADemo'
import Testimonials from '@/components/Testimonies/Testimonies-page'
import { TryNuro } from '@/components/try-nuro/page'


const page = () => {
  return (
    <div className="relative">
     
    
       <HeroHeader/>
      <HeroSection/>
      <IntegrationsSection/>
      <CommunitySection/>
      <NuroClients/>
     
      <FAQsSection/>
      <IntegrationsBeam/>
      <TryNuro/>
      <Testimonials/>
     <NuroCTADemo/>
     <div className=" flex pr-16">
     <Threads/>
     </div>
  


   
    </div>
  )
}

export default page
