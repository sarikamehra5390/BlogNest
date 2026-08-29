import React, { useContext } from "react";
import SearchContext from "../context/SearchContext";
import { Search, X } from "lucide-react";

function SearchBar() {
  const { search, setSearch } = useContext(SearchContext);

  return (
    <div
      className="
      relative
      w-full
      max-w-lg
      "
    >
      {/* Search Icon */}
      <Search
        className="
        absolute
        left-4
        top-1/2
        -translate-y-1/2
        text-slate-400
        "
        size={20}
      />

      {/* Input */}
      <input
        type="text"
        placeholder="Search articles..."
        aria-label="Search articles"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="
        w-full
        pl-12
        pr-12
        py-3
        rounded-full
        border
        border-slate-300
        dark:border-slate-700
        bg-white
        dark:bg-slate-900
        text-slate-800
        dark:text-white
        placeholder:text-slate-400
        focus:outline-none
        focus:ring-4
        focus:ring-blue-100
        transition-all
        duration-300
        "
      />

      {/* Clear Button */}

      {search && (
        <button
          onClick={() => setSearch("")}
          aria-label="Clear search"
          className="
          absolute
          right-4
          top-1/2
          -translate-y-1/2
          text-slate-400
          hover:text-red-500
          transition
          "
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}

export default SearchBar;