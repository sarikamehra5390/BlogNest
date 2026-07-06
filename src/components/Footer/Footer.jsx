import React from "react";
import { Link } from "react-router-dom";
import { Container } from "../index";

function Footer() {
  return (
    <footer className="bg-slate-900 text-white mt-16">
      <Container>
        <div className="py-12">

          {/* Logo & Description */}
          <div className="text-center mb-10">

            <h2 className="text-3xl font-bold">
              BlogNest
            </h2>

            <p className="text-slate-400 mt-3">
              Share Ideas • Learn • Inspire
            </p>

          </div>

          {/* Navigation */}
          <div className="flex flex-wrap justify-center gap-8 mb-10">

            <Link
              to="/"
              className="text-slate-300 hover:text-blue-400 transition-colors"
            >
              Home
            </Link>

            <Link
              to="/all-posts"
              className="text-slate-300 hover:text-blue-400 transition-colors"
            >
              All Posts
            </Link>

            <Link
              to="/add-post"
              className="text-slate-300 hover:text-blue-400 transition-colors"
            >
              Add Post
            </Link>

          </div>

          {/* Divider */}
          <div className="border-t border-slate-700 pt-6">

            <p className="text-center text-slate-400 text-sm">
              © 2026 BlogNest. All Rights Reserved.
            </p>

          </div>

        </div>
      </Container>
    </footer>
  );
}

export default Footer;