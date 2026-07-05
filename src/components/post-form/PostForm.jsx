//It is a reusable form component that is used for both creating a new post and editing an existing post.

import React, { useCallback } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, Select, RTE } from "../index";
import appwriteService from "../../appwrite/config";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";



// post will be available while editing.
// If post is undefined, we are creating a new post.

function PostForm({ post }) {
  // watch is used to continously monitor a field

  // Initialize react-hook-form.
// If editing, fill the form with existing post data.
// Otherwise keep fields empty.

  const { register, handleSubmit, watch, setValue, control, getValues } =
    useForm({
      defaultValues: {
        title: post?.title || "",
        slug: post?.slug || "",
        content: post?.content || "",
        status: post?.status || "active",
      },
    });


  // Used to redirect user after successful form submission.
  const navigate = useNavigate();

  // Get logged in user's data from Redux.
  const userData = useSelector((state) => state.auth.userData);

  // if the user has submited the form
  const submit = async (data) => {
     console.log("FORM DATA:", data);
     console.log("CONTENT:", data.content);
    console.log("TYPE:", typeof data.content);

    if (post) {

      // Upload new image only if user selected one.
      const file = data.image?.[0]
        ? await appwriteService.uploadFile(data.image[0])
        : null;

      // Old image no longer needed.delete it 
      if (file) {
        await appwriteService.deleteFile(post.featuredImage);
      }

      // Update the post in database.
      const dbPost = await appwriteService.updatePost(post.$id, {
        ...data,
        featuredImage: file ? file.$id : undefined
      })
        if(dbPost) {
          navigate(`/post/${dbPost.$id}`)
        }


    }else{
      // Upload featured image before creating post.
        const file = await appwriteService.uploadFile(data.image[0])

        if(file){
          const fileId = file.$id
          data.featuredImage = fileId
          const dbPost = await appwriteService.createPost({
            ...data,
            userId: userData.$id,
          })
          if(dbPost){
            navigate(`/post/${dbPost.$id}`)
          }
        }
    }
  };
 
  // Convert title into URL friendly slug.
  const slugTransForm = useCallback((value) => {
     if(value && typeof value === 'string')
      return value
         .trim()
         .toLowerCase()
         .replace(/[^\w\s]/gi, "")
         .replace(/\s+/g, "-")

         return ''
     
  }, [])

  // Automatically update slug whenever title changes.

  React.useEffect(() => {
    const subscription = watch((value, {name}) => {
      if(name === 'title'){
        setValue('slug', slugTransForm(value.title), {
          shouldValidate : true
        })
      }
    })

     return () => {
      subscription.unsubscribe()
    }
  },[watch, slugTransForm, setValue])


  return (
  <form onSubmit={handleSubmit(submit)} className="flex flex-wrap">
    <div className="w-2/3 px-2">
    <Input 
       label = "Title: "
       placeholder = "Title"
       className= "mb-4"
       {...register("title", {required : true})}
    />

     <Input 
       label = "slug: "
       placeholder = "slug"
       className= "mb-4"
       readOnly
       {...register("slug", {required : true})}
       onInput = {(e) => {
        setValue("slug", slugTransForm(e.currentTarget.value), {shouldValidate: true})
       }}
    />

    <RTE label= "content: " name="content" control={control} defaultValue={getValues("content")}/>

    </div>

    <div className="w-1/3 px-2">
      <Input
        label= "Featured Image: "
        type= "file"
        className= "mb-4"
        accept="image/png,image/jpeg,image/jpg,image/gif"
        {...register("image", {required:!post})}

      />

      {post && (
        <div className="w-full mb-4">
          <img
             src={appwriteService.getFilePreview(post.featuredImage)}
             alt={post.title}
             className="rounded-lg"
          />
        </div>
      )}

      <Select
        options={["active" , "inactive"]}
        label = "Status"
        className= "mb-4"
        {...register("status", {required: true})}
        />

        <Button type="submit" bgColor= {post ? "bg-green-500" : undefined} className="w-full">
          {post ? "Update" : "Submit"}
        </Button>
    </div>
  </form>
  )
}

export default PostForm;

// This is the summary of the whole postForm

// User Opens Form
//         │
//         ▼
// Initialize react-hook-form
//         │
//         ▼
// Editing?
//  ┌─────────────┐
//  │             │
// Yes           No
//  │             │
// Fill Fields   Empty Fields
//  │             │
//  └──────┬──────┘
//         ▼
// User Enters Title
//         │
//         ▼
// Generate Slug Automatically
//         │
//         ▼
// User Writes Content
//         │
//         ▼
// User Uploads Image
//         │
//         ▼
// Click Submit
//         │
//         ▼
// Validate Form
//         │
//         ▼
// Upload Image
//         │
//         ▼
// Create or Update Post
//         │
//         ▼
// Delete Old Image (if updating)
//         │
//         ▼
// Navigate to Post Page


// 1. Manages the form using react-hook-form.
// 2. Works for both Create and Edit operations.
// 3. Pre-fills existing post data while editing.
// 4. Automatically generates a URL-friendly slug from the title.
// 5. Watches the title field and updates the slug in real time.
// 6. Uploads the featured image to Appwrite Storage.
// 7. Creates a new post or updates an existing one in Appwrite.
// 8. Deletes the old image when a new one replaces it.
// 9. Associates the post with the currently logged-in user.
// 10. Redirects the user to the newly created or updated post after a successful