import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";

const Button = ({
  children,
  onClick,
  className = "",
  icon: Icon,
  disabled = false,
  ariaLabel = "button",
  ...props
}) => {
  const buttonRef = useRef();

  useEffect(() => {
    const handleMouseEnter = () =>
      gsap.to(buttonRef.current, {
        scale: 1.05,
        duration: 0.2,
        ease: "power2.out",
      });
    const handleMouseLeave = () =>
      gsap.to(buttonRef.current, {
        scale: 1,
        duration: 0.2,
        ease: "power2.out",
      });

    const buttonEl = buttonRef.current;
    buttonEl.addEventListener("mouseenter", handleMouseEnter);
    buttonEl.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      buttonEl.removeEventListener("mouseenter", handleMouseEnter);
      buttonEl.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      className={`bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      disabled={disabled}
      aria-label={ariaLabel}
      {...props}
    >
      {Icon && <Icon size={20} />}
      {children}
    </button>
  );
};

export default Button;
