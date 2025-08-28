import React from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ImagePreviewModalProps {
  images: string[];
  open: boolean;
  onClose: () => void;
  currentIndex: number;
  setCurrentIndex: (index: number | ((prev: number) => number)) => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  images = [],
  open,
  onClose,
  currentIndex,
  setCurrentIndex,
}) => {
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleClose = () => {
    onClose?.();
    setCurrentIndex(0);
  };

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, currentIndex, images.length]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-7xl h-[90vh] p-0 bg-black border-none">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Close Button */}
          <DialogClose className="absolute top-4 right-4 z-50 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <Button variant="ghost" size="icon" className="h-8 w-8 p-0 text-white hover:bg-white">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-40 h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all"
                onClick={handlePrev}
              >
                <ChevronLeft className="h-8 w-8" />
                <span className="sr-only">Previous image</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-40 h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all"
                onClick={handleNext}
              >
                <ChevronRight className="h-8 w-8" />
                <span className="sr-only">Next image</span>
              </Button>
            </>
          )}

          {/* Image */}
          {images[currentIndex] && (
            <img
              src={images[currentIndex]}
              alt={`Preview ${currentIndex + 1}`}
              className="max-h-[85vh] max-w-[90vw] object-contain select-none pointer-events-none"
              draggable={false}
            />
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 px-3 py-1.5 bg-black/70 rounded-full text-white text-sm font-medium backdrop-blur-sm">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImagePreviewModal;
