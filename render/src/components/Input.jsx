import React, { useRef, useEffect } from "react";

import "../styles/Input.css"

const Input = ({
  label,
  value = "",
  onChange = () => {},
  placeholder = "",
  type = "text",
  className = "",
  icon: Icon,
  id,
  ...props
}) => {
  const inputRef = useRef();

  useEffect(() => {
    const handleFocus = () =>
      gsap.to(inputRef.current, {
        scale: 1.04,
        duration: 0.3,
        ease: "power2.out",
      });
    const handleBlur = () =>
      gsap.to(inputRef.current, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      });

    const inputEl = inputRef.current;
    inputEl.addEventListener("focus", handleFocus);
    inputEl.addEventListener("blur", handleBlur);

    return () => {
      inputEl.removeEventListener("focus", handleFocus);
      inputEl.removeEventListener("blur", handleBlur);
    };
  }, []);

  return (
    <div className="input-container">
      {label && (
        <label htmlFor={id} className="input-label">
          {Icon && <Icon className="input-icon" />}
          {label}
        </label>
      )}
      <input
        ref={inputRef}
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`input-field ${className}`}
        {...props}
      />
    </div>
  );
};

export default Input;
