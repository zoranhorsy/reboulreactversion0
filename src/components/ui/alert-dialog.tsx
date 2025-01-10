import React from 'react';

interface AlertDialogContentProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  children: React.ReactNode;
}

const AlertDialogContent: React.FC<AlertDialogContentProps> = ({ isOpen, setIsOpen, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
      onClick={() => setIsOpen(false)}
      aria-label="Alert Dialog Overlay"
    >
      <div className="flex h-full w-full items-center justify-center">
        <div className="relative w-full max-w-md p-4 bg-white rounded-lg shadow-lg">
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            onClick={() => setIsOpen(false)}
          >
            &times;
          </button>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AlertDialogContent;

