import React, { forwardRef } from 'react';

interface CookedCertificateProps {
  applicationNumber: string;
  totalMarks: number;
  shift: string;
}

const CookedCertificate = forwardRef<HTMLDivElement, CookedCertificateProps>(({ applicationNumber, totalMarks, shift }, ref) => {
  return (
    // We position it absolute and way off-screen so it doesn't mess up the page layout
    <div className="absolute top-[-9999px] left-[-9999px]">
      <div 
        ref={ref} 
        id="cooked-certificate"
        className="w-[1080px] h-[1080px] bg-[#09090b] flex flex-col items-center justify-center relative overflow-hidden"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/40 via-[#09090b] to-[#09090b]"></div>
        
        {/* Border styling */}
        <div className="absolute inset-4 border-[12px] border-red-900/50 rounded-3xl"></div>
        <div className="absolute inset-8 border-2 border-red-600/30 rounded-2xl"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-16 w-full">
          <div className="flex items-center gap-4 mb-8">
            <span className="text-6xl">💀</span>
            <span className="text-6xl">💀</span>
            <span className="text-6xl">💀</span>
          </div>

          <h1 className="text-7xl font-black text-red-600 tracking-widest uppercase mb-4 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]">
            Officially Cooked
          </h1>
          <h2 className="text-2xl font-bold text-gray-400 uppercase tracking-[0.3em] mb-16">
            MHT CET 2026 Edition
          </h2>

          <p className="text-3xl text-gray-300 font-medium mb-6">
            This solemn document certifies that
          </p>
          
          <div className="bg-red-950/50 border border-red-900/50 px-12 py-4 rounded-xl mb-12">
            <p className="text-4xl font-mono font-bold text-red-400">
              {applicationNumber}
            </p>
          </div>

          <p className="text-3xl text-gray-300 font-medium mb-8">
            sat for the {shift} exam and scored a legendary
          </p>

          <div className="flex items-baseline gap-4 mb-16 drop-shadow-[0_0_30px_rgba(220,38,38,1)]">
            <span className="text-[140px] font-black text-red-500 leading-none">
              {totalMarks}
            </span>
            <span className="text-6xl font-bold text-red-800">
              / 200
            </span>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-red-800 to-transparent mb-12"></div>

          <p className="text-2xl text-red-400 font-bold mb-4 uppercase tracking-wider">
            System Recommendation:
          </p>
          <p className="text-3xl font-black text-white max-w-2xl leading-tight">
            START RESEARCHING MANAGEMENT QUOTA SEATS IMMEDIATELY.
          </p>
        </div>

        {/* Footer */}
        <div className="absolute bottom-16 w-full flex justify-between items-end px-20">
          <div className="text-left">
            <p className="text-red-500 font-bold text-xl mb-1">CETify Analysis Engine</p>
            <p className="text-gray-500 text-sm font-mono">{new Date().toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <div className="w-24 h-24 border-4 border-red-800 rounded-full flex items-center justify-center opacity-80 rotate-[-15deg] mb-2">
              <span className="text-red-600 font-black text-xl text-center leading-tight">VERIFIED<br/>COOKED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

CookedCertificate.displayName = 'CookedCertificate';
export default CookedCertificate;
