// /* eslint-disable @typescript-eslint/no-unused-vars */
// "use client"

// import { AIInputWithFile } from "@/components/ui/ai-input-with-file"
// import { useState } from "react"; 

// export default function FileUpoad() { 
//   // Optional: State to store the selected files if needed outside the handler
//   const [currentFiles, setCurrentFiles] = useState<File[]>([]);

//   // Renamed handler and updated signature
//   const handleFileChange = (files: File[]) => {
//     console.log('Files changed:');
//     setCurrentFiles(files); 

//     if (files.length > 0) {
//         files.forEach(file => {
//             console.log(`- ${file.name} (${file.size} bytes, type: ${file.type})`);
//         });
//     } else {
//         console.log('No files selected.');
//     }
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
//         <AIInputWithFile
//           onFilesChange={handleFileChange}
//           className="w-full max-w-3xl"
//           accept="image/*,application/pdf,.docx,.txt" 
//           maxFileSize={10} 
//           maxFiles={6} 
//         />

       
//     </div>
//   );
// }