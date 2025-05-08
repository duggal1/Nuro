import { cn } from '@/lib/utils'

export const CRISPRIntegrationIcon = ({ className }: { className?: string }) => {
    return (
        <div className={cn('size-5', className)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="url(#crispr-grad)" strokeWidth="1.75" strokeLinecap="round" />
                <path d="M7.5 12h9" stroke="#5096FF" strokeWidth="1.75" strokeLinecap="round" />
                <circle cx="9" cy="9" r="1.5" fill="#FF57D8" />
                <circle cx="15" cy="9" r="1.5" fill="#A855F7" />
                <circle cx="9" cy="15" r="1.5" fill="#7C3AED" />
                <circle cx="15" cy="15" r="1.5" fill="#DB2777" />
                <path d="M12 7v10" stroke="#5096FF" strokeWidth="1.75" strokeLinecap="round" />
                <defs>
                    <linearGradient id="crispr-grad" x1="3" y1="12" x2="21" y2="12" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#60A5FA" />
                        <stop offset="1" stopColor="#3B82F6" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    )
}

export const PyTorchGenomicsIcon = ({ className }: { className?: string }) => {
    return (
        <div className={cn('size-5', className)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                <path d="M12 5L19 9V15L12 19L5 15V9L12 5Z" fill="url(#pytorch-grad)" fillOpacity="0.1" stroke="url(#pytorch-stroke)" strokeWidth="1.75" />
                <circle cx="12" cy="12" r="2.5" fill="url(#pytorch-center)" />
                <path d="M12 5V9.5" stroke="#FF5757" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="0.5 0.5" />
                <path d="M12 14.5V19" stroke="#FF5757" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="0.5 0.5" />
                <path d="M5 9L9.5 12" stroke="#FF5757" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="0.5 0.5" />
                <path d="M14.5 12L19 15" stroke="#FF5757" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="0.5 0.5" />
                <path d="M19 9L14.5 12" stroke="#FF5757" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="0.5 0.5" />
                <path d="M9.5 12L5 15" stroke="#FF5757" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="0.5 0.5" />
                <defs>
                    <linearGradient id="pytorch-grad" x1="5" y1="5" x2="19" y2="19" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FCA5A5" />
                        <stop offset="1" stopColor="#EF4444" />
                    </linearGradient>
                    <linearGradient id="pytorch-stroke" x1="5" y1="5" x2="19" y2="19" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FF5757" />
                        <stop offset="1" stopColor="#DC2626" />
                    </linearGradient>
                    <radialGradient id="pytorch-center" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(12 12) rotate(90) scale(2.5)">
                        <stop stopColor="#FF5757" />
                        <stop offset="1" stopColor="#DC2626" />
                    </radialGradient>
                </defs>
            </svg>
        </div>
    )
}

export const BioDataPipelineIcon = ({ className }: { className?: string }) => {
    return (
        <div className={cn('size-5', className)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="5" width="18" height="2" rx="1" fill="url(#biodata-line1)" />
                <rect x="3" y="11" width="18" height="2" rx="1" fill="url(#biodata-line2)" />
                <rect x="3" y="17" width="18" height="2" rx="1" fill="url(#biodata-line3)" />
                <circle cx="8" cy="6" r="2.5" fill="url(#biodata-dot1)" />
                <circle cx="16" cy="12" r="2.5" fill="url(#biodata-dot2)" />
                <circle cx="10" cy="18" r="2.5" fill="url(#biodata-dot3)" />
                <path d="M8.5 8L15 10.5" stroke="url(#biodata-conn1)" strokeWidth="1.25" strokeLinecap="round" strokeDasharray="1 1.5" />
                <path d="M16 14.5L11 16.5" stroke="url(#biodata-conn2)" strokeWidth="1.25" strokeLinecap="round" strokeDasharray="1 1.5" />
                <defs>
                    <linearGradient id="biodata-line1" x1="3" y1="6" x2="21" y2="6" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#059669" />
                        <stop offset="1" stopColor="#10B981" />
                    </linearGradient>
                    <linearGradient id="biodata-line2" x1="3" y1="12" x2="21" y2="12" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#059669" />
                        <stop offset="1" stopColor="#10B981" />
                    </linearGradient>
                    <linearGradient id="biodata-line3" x1="3" y1="18" x2="21" y2="18" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#059669" />
                        <stop offset="1" stopColor="#10B981" />
                    </linearGradient>
                    <radialGradient id="biodata-dot1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(8 6) rotate(90) scale(2.5)">
                        <stop stopColor="#34D399" />
                        <stop offset="1" stopColor="#059669" />
                    </radialGradient>
                    <radialGradient id="biodata-dot2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(16 12) rotate(90) scale(2.5)">
                        <stop stopColor="#34D399" />
                        <stop offset="1" stopColor="#059669" />
                    </radialGradient>
                    <radialGradient id="biodata-dot3" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(10 18) rotate(90) scale(2.5)">
                        <stop stopColor="#34D399" />
                        <stop offset="1" stopColor="#059669" />
                    </radialGradient>
                    <linearGradient id="biodata-conn1" x1="8.5" y1="8" x2="15" y2="10.5" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#34D399" />
                        <stop offset="1" stopColor="#059669" />
                    </linearGradient>
                    <linearGradient id="biodata-conn2" x1="16" y1="14.5" x2="11" y2="16.5" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#34D399" />
                        <stop offset="1" stopColor="#059669" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    )
}

export const GeneExpressionIDEIcon = ({ className }: { className?: string }) => {
    return (
        <div className={cn('size-5', className)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="16" rx="3" fill="url(#ide-bg)" fillOpacity="0.08" />
                <rect x="3" y="4" width="18" height="16" rx="3" stroke="url(#ide-border)" strokeWidth="1.5" />
                <path d="M3 8h18" stroke="url(#ide-line)" strokeWidth="1.5" />
                <path d="M7 13l2 2-2 2" stroke="url(#ide-code)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13 16h4" stroke="url(#ide-code)" strokeWidth="1.75" strokeLinecap="round" />
                <circle cx="5" cy="6" r="1" fill="#F43F5E" />
                <circle cx="8" cy="6" r="1" fill="#F59E0B" />
                <circle cx="11" cy="6" r="1" fill="#10B981" />
                <defs>
                    <linearGradient id="ide-bg" x1="3" y1="4" x2="21" y2="20" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#C084FC" />
                        <stop offset="1" stopColor="#8B5CF6" />
                    </linearGradient>
                    <linearGradient id="ide-border" x1="3" y1="4" x2="21" y2="20" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#A855F7" />
                        <stop offset="1" stopColor="#7C3AED" />
                    </linearGradient>
                    <linearGradient id="ide-line" x1="3" y1="8" x2="21" y2="8" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#A855F7" />
                        <stop offset="1" stopColor="#7C3AED" />
                    </linearGradient>
                    <linearGradient id="ide-code" x1="7" y1="13" x2="17" y2="16" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#C084FC" />
                        <stop offset="1" stopColor="#8B5CF6" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    )
}

export const ResearchKnowledgeBaseIcon = ({ className }: { className?: string }) => {
    return (
        <div className={cn('size-5', className)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="3" width="16" height="18" rx="3" fill="url(#knowledge-bg)" fillOpacity="0.08" />
                <rect x="4" y="3" width="16" height="18" rx="3" stroke="url(#knowledge-border)" strokeWidth="1.5" />
                <path d="M8 7h8" stroke="url(#knowledge-line1)" strokeWidth="1.75" strokeLinecap="round" />
                <path d="M8 11h8" stroke="url(#knowledge-line2)" strokeWidth="1.75" strokeLinecap="round" />
                <path d="M8 15h4" stroke="url(#knowledge-line3)" strokeWidth="1.75" strokeLinecap="round" />
                <circle cx="17" cy="17" r="3" fill="url(#knowledge-clock-bg)" fillOpacity="0.15" stroke="url(#knowledge-clock)" strokeWidth="1.5" />
                <path d="M17 15.5v1.5l1 1" stroke="url(#knowledge-hand)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                    <linearGradient id="knowledge-bg" x1="4" y1="3" x2="20" y2="21" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#38BDF8" />
                        <stop offset="1" stopColor="#0284C7" />
                    </linearGradient>
                    <linearGradient id="knowledge-border" x1="4" y1="3" x2="20" y2="21" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#38BDF8" />
                        <stop offset="1" stopColor="#0284C7" />
                    </linearGradient>
                    <linearGradient id="knowledge-line1" x1="8" y1="7" x2="16" y2="7" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#38BDF8" />
                        <stop offset="1" stopColor="#0EA5E9" />
                    </linearGradient>
                    <linearGradient id="knowledge-line2" x1="8" y1="11" x2="16" y2="11" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#38BDF8" />
                        <stop offset="1" stopColor="#0EA5E9" />
                    </linearGradient>
                    <linearGradient id="knowledge-line3" x1="8" y1="15" x2="12" y2="15" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#38BDF8" />
                        <stop offset="1" stopColor="#0EA5E9" />
                    </linearGradient>
                    <linearGradient id="knowledge-clock" x1="14" y1="14" x2="20" y2="20" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#38BDF8" />
                        <stop offset="1" stopColor="#0284C7" />
                    </linearGradient>
                    <linearGradient id="knowledge-clock-bg" x1="14" y1="14" x2="20" y2="20" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#38BDF8" />
                        <stop offset="1" stopColor="#0284C7" />
                    </linearGradient>
                    <linearGradient id="knowledge-hand" x1="17" y1="15.5" x2="18" y2="17.5" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#38BDF8" />
                        <stop offset="1" stopColor="#0284C7" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    )
}

export const SequencePredictionIcon = ({ className }: { className?: string }) => {
    return (
        <div className={cn('size-5', className)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" fill="url(#sequence-circle)" fillOpacity="0.08" stroke="url(#sequence-circle-stroke)" strokeWidth="1.5" strokeDasharray="2 2" />
                <path d="M3 12h3l3-6 4 12 3-6h5" stroke="url(#sequence-line)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="17" cy="7" r="2.5" fill="url(#sequence-dot)" />
                <circle cx="17" cy="7" r="1" fill="#FFF" fillOpacity="0.6" />
                <defs>
                    <linearGradient id="sequence-circle" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#818CF8" />
                        <stop offset="1" stopColor="#4F46E5" />
                    </linearGradient>
                    <linearGradient id="sequence-circle-stroke" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#818CF8" />
                        <stop offset="1" stopColor="#4F46E5" />
                    </linearGradient>
                    <linearGradient id="sequence-line" x1="3" y1="12" x2="21" y2="12" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#818CF8" />
                        <stop offset="1" stopColor="#4F46E5" />
                    </linearGradient>
                    <radialGradient id="sequence-dot" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(17 7) rotate(90) scale(2.5)">
                        <stop stopColor="#FDBA74" />
                        <stop offset="1" stopColor="#EA580C" />
                    </radialGradient>
                </defs>
            </svg>
        </div>
    )
}