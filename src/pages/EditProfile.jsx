import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import profileService from "../appwrite/profileService";
import appwriteService from "../appwrite/config";
import { Container, Input, Button } from "../components";

export default function EditProfile() {

    const navigate = useNavigate();

    const userData = useSelector((state) => state.auth.userData);

    const [profile, setProfile] = useState(null);

    const {
        register,
        handleSubmit,
        setValue
    } = useForm();

    useEffect(() => {
    if (userData) {
        loadProfile().catch(e => {
            if (import.meta.env.DEV) console.log(e);
        });
    }
}, [userData]);

const loadProfile = async () => {
    try {
        const data = await profileService.getProfile(userData.$id);

        if (data) {
            setProfile(data);

            setValue("name", data.name);
            setValue("bio", data.bio);
        }
    } catch (e) {
        if (import.meta.env.DEV) console.log(e);
        return null;
    }
};

const update = async (data) => {

    try {
        if (!profile) return toast.error('Profile not loaded');

        let avatar = profile.avatar;

        if (data.image[0]) {

            // delete old avatar if it exists 
            if(profile.avatar){
                await appwriteService.deleteFile(profile.avatar);
            }

            const file = await appwriteService.uploadFile(data.image[0]);

            avatar = file.$id;
        }

        await profileService.updateProfile(profile.$id, {
            name: data.name,
            bio: data.bio,
            avatar,
        });

        toast.success("Profile updated successfully!");

        navigate("/profile");

    } catch (error) {

        if (import.meta.env.DEV) { console.error(error); }

        toast.error("Unable to update profile.");

    }

};

return (

   <Container>

       <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8">

        <h1 className="text-3xl font-bold mb-8 dark:text-white">

           Edit Profile

           </h1>

        <form
           onSubmit={handleSubmit(update)}
           className="space-y-6"
        >

        <Input
          label="Full Name"
          {...register("name",{required:true})}
        />

         <Input
           label="Bio"
           placeholder="Tell everyone about yourself..."
           {...register("bio")}
         />

         <Input
            label="Profile Image"
            type="file"
            accept="image/*"
            {...register("image")}
          />

         <Button
          type="submit"
         className="w-full"
         >

            Save Changes

         </Button>

        </form>

    </div>

  </Container>

  );
}