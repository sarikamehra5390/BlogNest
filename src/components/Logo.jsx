
import { useContext } from "react";
import ThemeContext from "../context/ThemeContext";

function Logo({ width = "100px", variant = "navbar", className = "" }) {
  const { dark = false } = useContext(ThemeContext) || {};
  const src = variant === "auth"
    ? (dark ? "/images/blognest-logo-dark-auth.png" : "/images/blognest-logo-auth.png")
    : (dark ? "/images/blognest-logo-dark.png" : "/images/blognest-logo.png");

  return (
    <img
      src={src}
      alt="BlogNest — Write, Share, Inspire"
      width={2752}
      height={1536}
      style={{ width, height: "auto" }}
      className={`block shrink-0 object-contain ${className}`}
      decoding="async"
    />
  );
}

export default Logo;
