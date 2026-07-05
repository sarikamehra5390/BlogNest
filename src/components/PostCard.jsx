import React from "react";
import appwriteService from "../appwrite/config";
import { Link } from "react-router-dom";

function PostCard({
  $id,
  title,
  featuredImage,
}) {

  const imageUrl = appwriteService.getFilePreview(featuredImage);

  console.log("File ID:", featuredImage);
  console.log("Image URL:", imageUrl);

  return (
    <Link to={`/post/${$id}`}>
      <div className="w-full bg-gray-100 rounded-xl p-4">
        <div className="w-full flex justify-center mb-4">
          <img
            src={imageUrl}
            alt={title}
            className="rounded-xl"
            loading="lazy"
            onLoad={() => console.log("Image Loaded")}
            onError={(e) => {
              console.log("Image Failed");
              console.log(e);
            }}
          />
        </div>

        <h2 className="text-xl font-bold">{title}</h2>
      </div>
    </Link>
  );
}

export default PostCard;