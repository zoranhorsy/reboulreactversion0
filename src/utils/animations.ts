import anime from "animejs";

export const fadeInSlideFromLeft = (target: string, delay: number = 0) => {
  return anime({
    targets: target,
    opacity: [0, 1],
    translateX: ["-50px", "0px"],
    easing: "easeOutQuad",
    duration: 800,
    delay: delay,
  });
};

export const zoomIn = (target: string, delay: number = 0) => {
  return anime({
    targets: target,
    scale: [0.9, 1],
    opacity: [0, 1],
    easing: "easeOutQuad",
    duration: 800,
    delay: delay,
  });
};

export const bounceEffect = (target: string) => {
  return anime({
    targets: target,
    scale: [1, 1.1, 1],
    duration: 300,
    easing: "easeInOutQuad",
  });
};

export const staggerFadeIn = (target: string, staggerDelay: number = 100) => {
  return anime({
    targets: target,
    opacity: [0, 1],
    translateY: ["20px", "0px"],
    easing: "easeOutQuad",
    duration: 500,
    delay: anime.stagger(staggerDelay),
  });
};
