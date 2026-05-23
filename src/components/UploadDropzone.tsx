'use client';

import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from 'react';

export const SLOT_OPTIONS_ATTEMPT_1 = [
  '11 April Shift 1',
  '11 April Shift 2',
  '13 April Shift 1',
  '13 April Shift 2',
  '14 April Shift 1',
  '14 April Shift 2',
  '15 April Shift 1',
  '15 April Shift 2',
  '16 April Shift 1',
  '16 April Shift 2',
  '17 April Shift 1',
  '17 April Shift 2',
  '18 April Shift 1',
  '18 April Shift 2',
  '19 April Shift 1',
  '19 April Shift 2',
  '20 April Shift 1',
  '20 April Shift 2',
];

export const SLOT_OPTIONS_ATTEMPT_2 = [
  '12 May Shift 1',
  '12 May Shift 2',
  '13 May Shift 1',
  '13 May Shift 2',
  '14 May Shift 1',
  '14 May Shift 2',
  '15 May Shift 1',
  '15 May Shift 2',
  '18 May Shift 1',
  '18 May Shift 2',
  '19 May Shift 1',
  '19 May Shift 2',
  '20 May Shift 1',
];

interface UploadDropzoneProps {
  onFileContent: (content: string, filename: string, attempt: string, slot: string) => void;
  onFileSelectSilent?: (content: string, attempt: string, slot: string) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function hasValidExtension(file: File): boolean {
  const lower = file.name.toLowerCase();
  if (['.html', '.htm', '.mhtml', '.mht', '.xml'].some((ext) => lower.endsWith(ext))) return true;
  // Mobile browsers often hide extensions and use content providers. Check MIME types as fallback.
  if (file.type === 'text/html' || file.type === 'multipart/related' || file.type === 'message/rfc822') return true;
  // If there's no extension (common on Android Content URIs), allow it and let the parser decide
  if (!file.name.includes('.')) return true;
  return false;
}

export default function UploadDropzone({ onFileContent, onFileSelectSilent }: UploadDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState('Attempt 1');
  const [slot, setSlot] = useState('11 April Shift 1');
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    setError(null);
    if (!hasValidExtension(file)) {
      setError('Invalid file type. Please upload a .html, .htm, .mhtml, or .mht file.');
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);

    // Read and upload the file contents silently immediately in the background
    if (onFileSelectSilent) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content) {
          onFileSelectSilent(content, attempt, slot);
        }
      };
      reader.readAsText(file);
    }
  }, [onFileSelectSilent, attempt, slot]);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleCalculate = useCallback(() => {
    if (!selectedFile) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) onFileContent(content, selectedFile.name, attempt, slot);
    };
    reader.onerror = () => setError('Failed to read the file.');
    reader.readAsText(selectedFile);
  }, [selectedFile, onFileContent, attempt, slot]);

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Attempt & Shift Selector Menus */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="attempt-select" className="block text-left text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Attempt / Session
          </label>
          <select
            id="attempt-select"
            value={attempt}
            onChange={(e) => {
              const newAttempt = e.target.value;
              setAttempt(newAttempt);
              setSlot(newAttempt === 'Attempt 1' ? SLOT_OPTIONS_ATTEMPT_1[0] : SLOT_OPTIONS_ATTEMPT_2[0]);
            }}
            className="w-full py-3.5 px-4 rounded-xl border border-gray-200 text-[#0f172a] bg-white focus:outline-none focus:ring-2 focus:ring-[#4338ca]/20 focus:border-[#4338ca] text-sm font-semibold transition-all hover:bg-gray-50"
          >
            <option value="Attempt 1">Attempt 1 (April Session)</option>
            <option value="Attempt 2">Attempt 2 (May Session)</option>
          </select>
        </div>
        <div>
          <label htmlFor="slot-select" className="block text-left text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Exam Shift / Date
          </label>
          <select
            id="slot-select"
            value={slot}
            onChange={(e) => setSlot(e.target.value)}
            className="w-full py-3.5 px-4 rounded-xl border border-gray-200 text-[#0f172a] bg-white focus:outline-none focus:ring-2 focus:ring-[#4338ca]/20 focus:border-[#4338ca] text-sm font-semibold transition-all hover:bg-gray-50"
          >
            {attempt === 'Attempt 1' 
              ? SLOT_OPTIONS_ATTEMPT_1.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))
              : SLOT_OPTIONS_ATTEMPT_2.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))
            }
          </select>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !selectedFile && inputRef.current?.click()}
        className={`relative bg-white rounded-2xl border-2 border-dashed p-10 text-center transition-all cursor-pointer ${
          isDragOver
            ? 'border-[#4338ca] bg-[#eef2ff]'
            : error
              ? 'border-red-300 bg-red-50'
              : selectedFile
                ? 'border-green-300 bg-green-50 cursor-default'
                : 'border-gray-200 hover:border-[#4338ca] hover:bg-[#fafaff]'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".html,.htm,.mhtml,.mht"
          onChange={handleInputChange}
          className="hidden"
        />

        {!selectedFile ? (
          <>
            {/* Upload icon */}
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#eef2ff] flex items-center justify-center">
              <svg className="w-7 h-7 text-[#4338ca]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-[#0f172a] mb-1">
              Upload Response Sheet HTML
            </h3>
            <p className="text-sm text-gray-400 mb-5">
              Select or drag your .html file here
            </p>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#eef2ff] text-[#4338ca] text-sm font-semibold rounded-lg border border-[#c7d2fe] hover:bg-[#e0e7ff] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
              </svg>
              Select File
            </button>
          </>
        ) : (
          <div onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-[#0f172a] truncate max-w-[300px] mx-auto">{selectedFile.name}</p>
            <p className="text-xs text-gray-400 mt-1 mb-5">{formatFileSize(selectedFile.size)}</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => { setSelectedFile(null); if (inputRef.current) inputRef.current.value = ''; }}
                className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Remove
              </button>
              <button
                onClick={handleCalculate}
                className="px-6 py-2.5 bg-[#4338ca] text-white text-sm font-semibold rounded-lg hover:bg-[#3730a3] transition-colors"
              >
                Calculate Score
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-500 text-center">{error}</p>
      )}

      {/* Help link */}
      <div className="mt-6 text-center">
        <a href="/about" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#4338ca] transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
          </svg>
          How to get my response sheet?
        </a>
      </div>
    </div>
  );
}
