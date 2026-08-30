import { useCallback, useEffect, useState } from "react";
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
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        setValue
    } = useForm();

const loadProfile = useCallback(async () => {
    if (!userData?.$id) return;
    try {
        const data = await profileService.ensureProfile({
            userId: userData.$id,
            name: userData.name,
        });

        if (data) {
            setProfile(data);

            setValue("name", data.name);
            setValue("bio", data.bio);
        }
    } catch (e) {
        if (import.meta.env.DEV) console.log(e);
        return null;
    }
}, [setValue, userData?.$id]);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

const update = async (data) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
        if (!profile) return toast.error('Profile not loaded');
        if (profile.userId !== userData?.$id) {
            toast.error("You can only update your own profile.");
            return;
        }

        let avatar = profile.avatar;
        let uploadedAvatarId = null;

        if (data.image?.[0]) {
            const file = await appwriteService.uploadFile(data.image[0]);
            if (!file) throw new Error("Avatar upload failed");
            avatar = file.$id;
            uploadedAvatarId = file.$id;
        }

        const updatedProfile = await profileService.updateProfile(profile.$id, {
            name: data.name,
            bio: data.bio,
            avatar,
        });
        if (!updatedProfile) {
            if (uploadedAvatarId) await appwriteService.deleteFile(uploadedAvatarId);
            throw new Error("Profile update was not saved");
        }

        if (uploadedAvatarId && profile.avatar) await appwriteService.deleteFile(profile.avatar);

        toast.success("Profile updated successfully!");

        navigate("/profile");

    } catch (error) {

        if (import.meta.env.DEV) { console.error(error); }

        toast.error("Unable to update profile.");
    } finally {
        setIsSubmitting(false);
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
          disabled={isSubmitting}
         className="w-full"
         >
            {isSubmitting ? "Saving…" : "Save Changes"}

         </Button>

        </form>

    </div>

  </Container>

  );
}
