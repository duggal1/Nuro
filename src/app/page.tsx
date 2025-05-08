


import InteractiveHero from '@/components/blocks/hero-section'
import CommunitySections from '@/components/content-6'
import FAQsSection from '@/components/faqs-3'
import NuroClients from '@/components/integrations-1'
import IntegrationsBeam from '@/components/integrations-4'
import IntegrationsSection from '@/components/integrations-5'
import { NuroCTADemo } from '@/components/NuroCTADemo'
import Testimonials from '@/components/Testimonies/Testimonies-page'
import { TryNuro } from '@/components/try-nuro/page'


const page = () => {

  return (

     <div className="relative">
        
        <InteractiveHero/>
      <IntegrationsSection/>
      <CommunitySections/>   
      <NuroClients/>    
      <FAQsSection/>
      <IntegrationsBeam/>
      <TryNuro/>
      <Testimonials/>
     <NuroCTADemo/>


    </div>
  )
}

export default page
