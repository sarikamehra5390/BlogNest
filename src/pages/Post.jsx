import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import appwriteService from "../appwrite/config";
import { Button, Container } from "../components";
import parse from "html-react-parser";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

export default function Post() {
  const [post, setPost] = useState(null);

  const { slug } = useParams();
  const navigate = useNavigate();

  const userData = useSelector((state) => state.auth.userData);

  const isAuthor =
    post && userData ? post.userId === userData.$id : false;

  useEffect(() => {
    if (slug) {
      appwriteService.getPost(slug).then((post) => {
        if (post) {
          setPost(post);
        } else {
          navigate("/");
        }
      });
    } else {
      navigate("/");
    }
  }, [slug, navigate]);

  const deletePost = async () => {
    const status = await appwriteService.deletePost(post.$id);

    if (status) {
      await appwriteService.deleteFile(post.featuredImage);
      toast.success("Post deleted successfully 🗑️");
      navigate("/");
    }
  };

  return post ? (
    <div className="bg-slate-100 min-h-screen py-12">
      <Container>

        <div className="max-w-5xl mx-auto">

          {/* Cover Image */}

          <div className="overflow-hidden rounded-3xl shadow-xl mb-10">

            <img
              src={appwriteService.getFilePreview(post.featuredImage)}
              alt={post.title}
              className="w-full h-[450px] object-cover"
            />

          </div>

          {/* Title */}

          <h1 className="text-5xl font-bold text-slate-800 dark:text-white leading-tight mb-4">
            {post.title}
          </h1>

          {/* Meta */}

          <div className="flex items-center justify-between mb-10">

            <p className="text-slate-500 dark:text-slate-400 text-lg">
              Published Article
            </p>

            {isAuthor && (
              <div className="flex gap-3">

                <Link to={`/edit-post/${post.$id}`}>
                  <Button bgColor="bg-green-600">
                    Edit
                  </Button>
                </Link>

                <Button
                  bgColor="bg-red-600"
                  onClick={deletePost}
                >
                  Delete
                </Button>

              </div>
            )}

          </div>

          {/* Content */}

          <div
            className="
            bg-white
            dark:bg-slate-900
            rounded-3xl
            shadow-lg
            p-10
            leading-8
            text-lg
            text-slate-700
            dark:text-slate-300
            prose
            max-w-none
          "
          >
            {parse(post.content)}
          </div>

        </div>

      </Container>
    </div>
  ) : null;
}