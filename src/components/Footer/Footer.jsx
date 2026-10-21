import { Link } from "react-router-dom";
import { Container } from "../index";

function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
      <Container>
        <div className="py-10 sm:py-12">

          {/* Brand & Description */}
          <div className="mb-10 flex flex-col items-center text-center">
            <Link to="/" aria-label="BlogNest home" className="inline-flex rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600">
              <h2 className="font-editorial text-[1.625rem] font-semibold tracking-tight text-slate-900 dark:text-white">
                BlogNest
              </h2>
            </Link>

            <p className="mt-3 text-slate-500 dark:text-slate-400">
              A home for ideas worth sharing.
            </p>

          </div>

          {/* Navigation */}
          <div className="flex flex-wrap justify-center gap-6 mb-10 text-sm font-medium">

            <Link
              to="/"
              className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Home
            </Link>

            <Link
              to="/all-posts"
              className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              All Posts
            </Link>

            <Link
              to="/add-post"
              className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Add Post
            </Link>

          </div>

          {/* Divider */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-6">

            <p className="text-center text-slate-500 dark:text-slate-400 text-sm">
              © 2026 BlogNest. All Rights Reserved.
            </p>

          </div>

        </div>
      </Container>
    </footer>
  );
}

export default Footer;
