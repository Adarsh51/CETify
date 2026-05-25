'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PercentilePredictor from '@/components/PercentilePredictor';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function PredictorContent() {
  const searchParams = useSearchParams();
  const marksParam = searchParams.get('marks');
  const shiftParam = searchParams.get('shift');

  const initialMarks = marksParam ? Number(marksParam) : undefined;
  const initialShift = shiftParam || undefined;

  return (
    <div className="py-12 px-4 sm:px-6 max-w-7xl mx-auto min-h-[70vh]">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          MHT CET <span className="text-[#4338ca]">Rank Predictor</span>
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
          Estimate your percentile and All India Rank based on official 2025 MHT CET normalization data.
        </p>
      </div>

      <PercentilePredictor 
        initialMarks={initialMarks} 
        initialShift={initialShift} 
      />
    </div>
  );
}

export default function PredictorPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Suspense fallback={<div className="flex justify-center items-center min-h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4338ca]"></div></div>}>
          <PredictorContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
