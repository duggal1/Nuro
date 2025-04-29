'use client'

import { SplineScene } from "@/components/ui/splite";
import { Card } from "@/components/ui/card"

 
export function SplineSceneBasic() {
  return (
    <Card className="w-full h-[500px] relative overflow-hidden">
    
      
      <div className="flex h-full">
        {/* Left content */}
      

        {/* Right content */}
        <div className="flex-1 relative">
          <SplineScene 
            scene="https://prod.spline.design/nBYavpOmhyKyZ-Zn/scene.splinecode"
            className="w-full h-full z-0"
          />
        </div>
      </div>
    </Card>
  )
}