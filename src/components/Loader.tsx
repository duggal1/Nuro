import { Spinner } from "@/components/ui/spinner"

export function Loader() {
  return (
    <div className="flex items-center space-x-2">
      <Spinner />
    </div>
  )
}


  
  // Commet it as we only need the spinner (loader) for the whole app

// }

// export function RoundSpinnerDemo() {
//   return (
//     <div className="flex items-center space-x-2">
//       <RoundSpinner />
//     </div>
//   )
// }

// export function Dots_v1_Demo() {
//   return (
//     <div className="flex items-center space-x-2">
//       <Dots_v1 />
//     </div>
//   )
// }

// export function Dots_v2_Demo() {
//   return (
//     <div className="flex items-center space-x-2">
//       <Dots_v2 />
//     </div>
//   )
// }

// export function Dots_v3_Demo() {
//   return (
//     <div className="flex items-center space-x-2">
//       <Dots_v3 />
//     </div>
//   )
// }

// export function Dots_v4_Demo() {
//   return (
//     <div className="flex items-center space-x-2">
//       <Dots_v4 />
//     </div>
//   )
// }