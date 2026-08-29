import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { Container, BadgesList } from "../components";
import profileService from "../appwrite/profileService";
import { useNavigate, Link } from "react-router-dom";
import appwriteService from "../appwrite/config";


export default function Profile() {
    const userData = useSelector((state) => state.auth.userData);
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = useCallback(async () => {
        if (!userData) {
            setLoading(false);
            return;
        }
        try {
            const data = await profileService.getProfile(userData.$id);
            setProfile(data);
        } catch (error) {
            if (import.meta.env.DEV) { console.error(error); }
        } finally {
            setLoading(false);
        }
    }, [userData]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    if (loading) {
        return (
            <Container>
                <div className="text-center py-20">
                    <div className="text-gray-500 dark:text-gray-400">
                        Loading Profile...
                    </div>
                </div>
            </Container>
        );
    }

    if (!profile) {
        return (
            <Container>
                <div className="text-center py-20">
                    <h2 className="text-3xl font-bold dark:text-white">
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

                    <Link to={`/author/${profile?.userId}`}>
                        <img
                          src={
                            profile?.avatar
                            ? appwriteService.getFilePreview(profile.avatar)
                            : `https://ui-avatars.com/api/?name=${profile?.name}`
                          }
                           alt={profile?.name}
                            className="w-28 h-28 rounded-full object-cover mx-auto border-4 border-blue-500 hover:scale-105 transition-transform cursor-pointer"
                          />
                    </Link>

                       <Link
                         to={`/author/${profile?.userId}`}
                         className="block text-center"
                        >
                         <h1 className="text-3xl font-bold mt-4 dark:text-white hover:text-blue-600 transition-colors cursor-pointer">
                           {profile?.name}
                         </h1>
                        </Link>

                        <p className="text-gray-500 dark:text-gray-400 mt-2">
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

                <BadgesList />

            </Container>
        </div>
    );
}