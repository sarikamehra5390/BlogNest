
import React from "react";
import logo from "../assets/BLOGNEST_logo.png";

function Logo({ width = "100px" }) {
  return (
    <img
      src={logo}
      alt="BlogNest Logo"
      style={{ width }}
    />
  );
}

export default Logo;