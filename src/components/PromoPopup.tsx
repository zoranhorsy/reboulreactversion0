'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion'
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
import { AnimatePresence } from 'framer-motion'
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle;
import { X } from 'lucide-react';

interface PromoPopupProps {
  title: string;
  message: string;
  buttonText: string;
  buttonLink: string;
}

export default function PromoPopup({ title, message, buttonText, buttonLink }: PromoPopupProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Vérifier si la pop-up a déjà été affichée
    const hasShownPopup = localStorage.getItem('hasShownPromoPopup');
    if (!hasShownPopup) {
      setIsOpen(true);
      localStorage.setItem('hasShownPromoPopup', 'true');
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-2xl font-bold mb-4 text-gray-800">{title}</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            
            <a
              href={buttonLink}
              className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              {buttonText}
            </a>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 