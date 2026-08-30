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
    const [error, setError] = useState("");

    const fetchProfile = useCallback(async () => {
        if (!userData) {
            setLoading(false);
            return;
        }
        try {
            const data = await profileService.ensureProfile({
                userId: userData.$id,
                name: userData.name,
            });
            setProfile(data);
        } catch (error) {
            if (import.meta.env.DEV) { console.error(error); }
            setError("We couldn’t load your profile. Please try again shortly.");
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

    if (error || !profile) {
        return (
            <Container>
                <div className="text-center py-20">
                    <h2 className="text-3xl font-bold dark:text-white">
                        {error || "Profile not found"}
                    </h2>
                </div>
            </Container>
        );
    }


    return (
        <div className="page-shell">
            <Container>

                <div className="max-w-3xl mx-auto surface-card p-7 sm:p-10">

                    <div className="flex flex-col items-center">

                    <Link to={`/author/${profile?.userId}`}>
                        <img
                          src={
                            profile?.avatar
                            ? appwriteService.getFilePreview(profile.avatar)
                            : `https://ui-avatars.com/api/?name=${profile?.name}`
                          }
                           alt={profile?.name}
                            className="w-28 h-28 rounded-full object-cover mx-auto ring-4 ring-indigo-500/20 ring-offset-4 dark:ring-offset-slate-900 hover:scale-105 transition-transform cursor-pointer"
                          />
                    </Link>

                       <Link
                         to={`/author/${profile?.userId}`}
                         className="block text-center"
                        >
                         <h1 className="text-3xl font-bold tracking-tight mt-5 dark:text-white hover:text-indigo-600 transition-colors cursor-pointer">
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
                           className="mt-7 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm shadow-indigo-500/25 transition"
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
