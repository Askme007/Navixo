import { Button } from './ui/button';
import { X } from 'lucide-react';

interface SavedConfirmationPopupProps {
  onClose: () => void;
  onViewDashboard: () => void;
}

export function SavedConfirmationPopup({ onClose, onViewDashboard }: SavedConfirmationPopupProps) {
  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/45 z-40"
        onClick={onClose}
      />
      
      {/* Popup Panel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-[#232323] border border-[#2E2E2E] rounded-xl p-6 max-w-md w-full relative animate-in fade-in zoom-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          {/* Content */}
          <div className="space-y-4 pt-2">
            <div>
              <h3 className="text-white mb-2" style={{ fontWeight: 600 }}>
                Roadmap Saved
              </h3>
              <p className="text-[#b4b4b4] text-sm" style={{ fontWeight: 500 }}>
                You can access this roadmap anytime from your Dashboard.
              </p>
            </div>
            
            {/* View Dashboard Button */}
            <Button 
              onClick={onViewDashboard}
              className="w-full bg-white text-black hover:bg-[#f5f5f5] rounded-lg"
              style={{ fontWeight: 600 }}
            >
              View Dashboard
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
