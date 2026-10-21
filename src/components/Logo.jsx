
function Logo({ width = "100px", iconOnly = false, className = "" }) {
  return (
    <img
      src={iconOnly ? "/favicon.png" : "/images/blognest-logo.png"}
      alt="BlogNest — Write, Share, Inspire"
      width={iconOnly ? 790 : 2752}
      height={iconOnly ? 790 : 1536}
      style={{ width, height: "auto" }}
      className={`block shrink-0 object-contain ${className}`}
      decoding="async"
    />
  );
}

export default Logo;
