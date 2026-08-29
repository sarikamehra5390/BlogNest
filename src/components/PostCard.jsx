import React from "react";
import appwriteService from "../appwrite/config";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { calculateReadingTime } from "../utils/readingTime";

function PostCard({
  $id,
  title,
  content,
  featuredImage,
  category,
  tags,
}) {

  const imageUrl = appwriteService.getFilePreview(featuredImage);

  const readingTime = calculateReadingTime(content);

  return (
    <Link to={`/post/${$id}`} className="group">
      <motion.div
         initial={{ opacity: 0, y: 30 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.5 }}
         whileHover={{
      y: -10,
      scale: 1.02,
    }}
        className="
          w-full
          bg-white dark:bg-slate-900
          rounded-2xl
          overflow-hidden
          shadow-md
          hover:shadow-2xl
          hover:-translate-y-2
          transition-all
          duration-300
        "
      >
        {/* Image */}
        <div className="overflow-hidden h-56">
          <img
            src={imageUrl}
            alt={title}
            loading="lazy"
            className="
              w-full
              h-full
              object-cover
              transition-transform
              duration-500
              group-hover:scale-110
            "
          />
        </div>

        {/* Content */}
        <div className="p-5">

          {category && (
  <span
    className="
      inline-block
      mb-3
      px-3
      py-1
      rounded-full
      bg-blue-100
      text-blue-700
      dark:bg-blue-900/40
      dark:text-blue-300
      text-xs
      font-semibold
    "
  >
    {category}
  </span>
)}

          {/* Title */}
          <h2
            className="
              text-xl
              font-bold
              text-slate-800 dark:text-white
              mb-3
              line-clamp-2
            "
          >
            {title}
          </h2>

          {/*Reading time*/}
           
        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mb-3">

          <span>📖 {readingTime} min read</span>

            </div>


          {/* Description */}
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-6">
            Click here to read the complete article.
          </p>

          {tags && (
  <div className="flex flex-wrap gap-2 mt-4">
    {tags.split(",").map((tag) => (
      <span
        key={tag.trim()}
        className="
          px-2
          py-1
          text-xs
          rounded-full
          bg-slate-100
          dark:bg-slate-800
          text-slate-600
          dark:text-slate-300
        "
      >
        #{tag.trim()}
      </span>
    ))}
  </div>
)}

          {/* Read More */}
          <div className="mt-5 flex justify-end">
            <span
              className="
                text-blue-600
                font-semibold
                group-hover:translate-x-1
                transition-all
                duration-300
              "
            >
              Read More →
            </span>
          </div>

        </div>
      </motion.div>
    </Link>
  );
}

export default PostCard;