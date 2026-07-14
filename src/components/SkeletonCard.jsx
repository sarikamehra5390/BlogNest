import React from "react";

function SkeletonCard() {
  return (
    <div
      className="
      bg-white
      dark:bg-slate-900
      rounded-3xl
      overflow-hidden
      shadow-lg
      border
      border-slate-200
      dark:border-slate-800
      "
    >
      {/* Image */}
      <div className="h-56 w-full shimmer"></div>

      <div className="p-6">

        {/* Title */}
        <div className="h-7 w-3/4 rounded-lg shimmer mb-6"></div>

        {/* Description */}
        <div className="space-y-3">

          <div className="h-4 rounded shimmer"></div>

          <div className="h-4 w-5/6 rounded shimmer"></div>

          <div className="h-4 w-2/3 rounded shimmer"></div>

        </div>

        {/* Read More */}
        <div className="flex justify-end mt-8">
          <div className="h-5 w-28 rounded shimmer"></div>
        </div>

      </div>
    </div>
  );
}

export default SkeletonCard;