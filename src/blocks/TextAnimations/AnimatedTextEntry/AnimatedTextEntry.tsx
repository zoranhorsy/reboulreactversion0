import React, { useEffect, useRef } from "react";
import anime from "animejs";

interface AnimatedTextEntryProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  delay?: number; // ms avant de commencer l'anim
  duration?: number; // durée totale de l'anim
  fontSize?: string | number;
  fontFamily?: string;
}

const AnimatedTextEntry: React.FC<AnimatedTextEntryProps> = ({
  text,
  className = "",
  style = {},
  delay = 0,
  duration = 900,
  fontSize,
  fontFamily,
}) => {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const words = containerRef.current.querySelectorAll(".animated-word");
    anime.set(words, { opacity: 0, translateY: 24 });
    anime({
      targets: words,
      opacity: [0, 1],
      translateY: [24, 0],
      easing: "easeOutExpo",
      delay: anime.stagger(80, { start: delay }),
      duration,
    });
  }, [text, delay, duration]);

  // Split le texte en mots tout en gardant les espaces
  const wordsWithSpaces = text.split(/(\s+)/);

  return (
    <span
      ref={containerRef}
      className={className}
      style={{
        display: "inline-block",
        fontSize,
        fontFamily,
        whiteSpace: "normal",
        ...style,
      }}
    >
      {wordsWithSpaces.map((word, i) =>
        word.trim() === "" ? (
          <span key={i}>{word}</span>
        ) : (
          <span
            key={i}
            className="animated-word"
            style={{ display: "inline-block" }}
          >
            {word}
          </span>
        ),
      )}
    </span>
  );
};

export default AnimatedTextEntry; 