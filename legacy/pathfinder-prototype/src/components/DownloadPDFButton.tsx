import { useState, useRef, useEffect } from 'react';
import { Download, X, FileDown } from 'lucide-react';
import { Button } from './ui/button';

interface DownloadPDFButtonProps {
  className?: string;
}

export function DownloadPDFButton({ className = '' }: DownloadPDFButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Close popup when clicking outside or on overlay
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showSuccessPopup &&
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setShowSuccessPopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSuccessPopup]);

  const handleDownloadClick = () => {
    // Start loading state
    setIsLoading(true);

    // Simulate PDF generation (1 second delay)
    setTimeout(() => {
      setIsLoading(false);
      setShowSuccessPopup(true);
    }, 1000);
  };

  const handleFinalDownload = () => {
    // Simulate actual PDF download
    console.log('Downloading PDF...');
    
    // Close the popup
    setShowSuccessPopup(false);
    
    // In a real implementation, this would trigger the actual PDF download
    // For now, we'll just simulate it
  };

  const handleClosePopup = () => {
    setShowSuccessPopup(false);
  };

  return (
    <>
      {/* Download PDF Button */}
      <Button
        variant="outline"
        onClick={handleDownloadClick}
        disabled={isLoading}
        className={`gap-1 md:gap-2 border-[#333333] bg-transparent text-white hover:bg-white/5 text-xs md:text-sm flex-1 sm:flex-none transition-colors ${
          isLoading ? 'opacity-60 cursor-not-allowed' : ''
        } ${className}`}
        style={{ fontWeight: 500 }}
      >
        {isLoading ? (
          <>
            {/* Loading Spinner */}
            <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-gray-400 border-t-white rounded-full animate-spin" />
            <span className="hidden sm:inline">Preparing your PDF…</span>
            <span className="sm:hidden">Preparing…</span>
          </>
        ) : (
          <>
            <Download className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Download PDF</span>
            <span className="sm:hidden">PDF</span>
          </>
        )}
      </Button>

      {/* Dimmed Background Overlay */}
      {showSuccessPopup && (
        <div
          className="fixed inset-0 bg-black/45 z-40"
          style={{
            animation: 'fadeIn 200ms ease-out',
          }}
          onClick={handleClosePopup}
        />
      )}

      {/* PDF Ready Success Popup */}
      {showSuccessPopup && (
        <div
          ref={popupRef}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-[#232323] border border-[#2E2E2E] rounded-xl shadow-2xl z-50 overflow-hidden"
          style={{
            animation: 'scaleIn 250ms ease-out',
          }}
        >
          <div className="p-6">
            {/* Close Button */}
            <button
              onClick={handleClosePopup}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#2B2B2B] transition-colors group"
            >
              <X className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
            </button>

            {/* Icon */}
            <div className="w-16 h-16 bg-[#2B2B2B] border border-[#333333] rounded-xl flex items-center justify-center mx-auto mb-4">
              <FileDown className="w-8 h-8 text-green-400" />
            </div>

            {/* Title */}
            <h3 className="text-white text-center mb-2" style={{ fontWeight: 600 }}>
              Your PDF is Ready
            </h3>

            {/* Subtext */}
            <p className="text-[#BFBFBF] text-center text-sm mb-6" style={{ fontWeight: 500 }}>
              Click below to download your roadmap summary.
            </p>

            {/* Download Button */}
            <Button
              onClick={handleFinalDownload}
              className="w-full bg-white text-black hover:bg-[#f5f5f5] gap-2"
              style={{ fontWeight: 600 }}
            >
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>
    </>
  );
}
