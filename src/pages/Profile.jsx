import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Container } from "../components";
import profileService from "../appwrite/profileService";
import { useNavigate } from "react-router-dom";
import appwriteService from "../appwrite/config";


export default function Profile() {
    const userData = useSelector((state) => state.auth.userData);
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userData) {
            fetchProfile();
        } else {
            setLoading(false);
        }
    }, [userData]);

    const fetchProfile = async () => {
        try {
            const data = await profileService.getProfile(userData.$id);
            setProfile(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }
    if (!profile) {
    return (
        <Container>
            <div className="text-center py-20">
                <h2 className="text-3xl font-bold">
                    Profile not found
                </h2>
            </div>
        </Container>
    );
}

return (
    <div className="bg-slate-100 dark:bg-slate-950 min-h-screen py-10">
        <Container>

            <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8">

                <div className="flex flex-col items-center">

                  <img
                   src={
                    profile.avatar
                      ? appwriteService.getFilePreview(profile.avatar)
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        profile.name
                      )}&background=2563eb&color=fff`
                    }
                    alt={profile.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-600"
                  />

                    <h1 className="text-3xl font-bold mt-6 dark:text-white">
                        {profile.name}
                    </h1>

                    <p className="text-gray-500 mt-2">
                        {profile.bio || "No bio added yet."}
                    </p>

                    <p className="text-sm text-gray-400 mt-4">
                        Joined{" "}
                        {new Date(profile.$createdAt).toLocaleDateString()}
                    </p>

                    <button
                       onClick={() => navigate("/edit-profile")}
                       className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition"
                    >
                        Edit Profile
                    </button>

                </div>

            </div>

        </Container>
    </div>
);

    };