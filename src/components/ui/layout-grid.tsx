"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Card = {
  id: number;
  content: JSX.Element | React.ReactNode | string;
  className: string;
  thumbnail: string;
  archive?: any;
};

export const LayoutGrid = ({
  cards,
  onCardClick,
}: {
  cards: Card[];
  onCardClick?: (card: Card) => void;
}) => {
  const [selected, setSelected] = useState<Card | null>(null);
  const [lastSelected, setLastSelected] = useState<Card | null>(null);

  const handleClick = (card: Card) => {
    setLastSelected(selected);
    setSelected(card);

    if (onCardClick) {
      onCardClick(card);
    }
  };

  const handleOutsideClick = () => {
    setLastSelected(selected);
    setSelected(null);
  };

  return (
    <div className="w-full h-full px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 relative min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]">
      {cards.map((card, i) => (
        <div
          key={i}
          className={cn(
            card.className,
            "min-h-[180px] sm:min-h-[220px] lg:min-h-[250px]",
          )}
        >
          <motion.div
            onClick={() => handleClick(card)}
            className={cn(
              card.className,
              "relative overflow-hidden min-h-[180px] sm:min-h-[220px] lg:min-h-[250px] cursor-pointer",
              "rounded-lg sm:rounded-xl lg:rounded-2xl",
              "transition-all duration-300 hover:scale-[1.02] hover:shadow-xl",
              selected?.id === card.id
                ? "fixed inset-4 sm:inset-8 lg:inset-16 z-50 flex justify-center items-center"
                : lastSelected?.id === card.id
                  ? "z-40 bg-white h-full w-full"
                  : "bg-white h-full w-full shadow-md hover:shadow-lg",
            )}
            layoutId={`card-${card.id}`}
          >
            {selected?.id === card.id && <SelectedCard selected={selected} />}
            <ImageComponent card={card} />
          </motion.div>
        </div>
      ))}
      <motion.div
        onClick={handleOutsideClick}
        className={cn(
          "absolute h-full w-full left-0 top-0 bg-black opacity-0 z-10",
          selected?.id ? "pointer-events-auto" : "pointer-events-none",
        )}
        animate={{ opacity: selected?.id ? 0.3 : 0 }}
      />
    </div>
  );
};

const ImageComponent = ({ card }: { card: Card }) => {
  return (
    <motion.img
      layoutId={`image-${card.id}-image`}
      src={card.thumbnail}
      height="500"
      width="500"
      className={cn(
        "object-cover object-top absolute inset-0 h-full w-full transition duration-200",
      )}
      alt="thumbnail"
    />
  );
};

const SelectedCard = ({ selected }: { selected: Card | null }) => {
  return (
    <div className="bg-transparent h-full w-full flex flex-col justify-end rounded-lg shadow-2xl relative z-[60]">
      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 0.6,
        }}
        className="absolute inset-0 h-full w-full bg-black opacity-60 z-10"
      />
      <motion.div
        layoutId={`content-${selected?.id}`}
        initial={{
          opacity: 0,
          y: 100,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          y: 100,
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
        className="relative px-4 sm:px-6 lg:px-8 pb-3 sm:pb-4 lg:pb-6 z-[70]"
      >
        {selected?.content}
      </motion.div>
    </div>
  );
};
