import {useState} from 'react'
import authService from '../appwrite/auth'
import {Link, useNavigate} from 'react-router-dom'
import {login} from '../store/authSlice'
import {Button, Input, Logo} from './index'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import toast from "react-hot-toast";
import profileService from "../appwrite/profileService";
import { getAppwriteErrorMessage } from "../utils/appwriteError";

function Signup() {
    const navigate = useNavigate()
    const [error, setError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const dispatch = useDispatch()
    const {
      register,
       handleSubmit,
      } = useForm()

    const create = async (data) => {
    if (isSubmitting) return;
    setError("");
    setIsSubmitting(true);

    try {
        await authService.createAccount(data);
        const { user: currentUser } = await authService.login(data);

        if (currentUser) {

                const existingProfile = await profileService.getProfile(currentUser.$id);

                if (!existingProfile) {
                    await profileService.createProfile({
                        userId: currentUser.$id,
                        name: currentUser.name,
                        bio: "",
                        avatar: "",
                    });
                }

                dispatch(login(currentUser));
                toast.success("Account created successfully! 🎉");
                navigate("/");
        }
    } catch (error) {
        console.error("Signup failed", error);
        const message = getAppwriteErrorMessage(error, "signup");
        setError(message);
        toast.error(message);
    } finally {
        setIsSubmitting(false);
    }
};

  return (
  <div className="relative isolate min-h-[80vh] overflow-hidden flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300 px-4 py-10"><div className="absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(circle_at_50%_0,rgba(129,140,248,.25),transparent_55%)]" />
      <div className={` mx-auto
    w-full
    max-w-md
    bg-white dark:bg-slate-900
    rounded-3xl
    shadow-2xl
    border
    border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-300/40 dark:shadow-none p-7 sm:p-10`}>
      <div className='mb-2 flex justify-center'>
      <span className="inline-block w-full max-w-[80px] mb-4">
          <Logo width= '100%' />
        </span>
      </div>
       <h2 className="text-center text-3xl font-bold text-slate-800 dark:text-white mt-4 transition-colors">
                  Create your BlogNest account
              </h2>
              <p className="mt-3 text-center text-slate-500 dark:text-slate-400 leading-6 transition-colors">
                  Already have an account?&nbsp;
                  <Link
  to="/login"
 className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-300"
>
  Sign In
</Link>
              </p>
              {error && <p className=" mt-6
      rounded-xl
      border
      border-red-300
      bg-red-50
      dark:bg-red-900/30
      dark:border-red-700
      p-3
      text-center
      text-red-600
      dark:text-red-300
    ">{error}</p>}

              <form onSubmit={handleSubmit(create)} className="mt-8">
                <div className="space-y-6">
                  <Input
                   label = "Full Name: "
                   placeholder ="Enter your full name"
                   {...register("name", {
                    required : "Name is required",
                    minLength: { value: 2, message: "Name must be at least 2 characters" },
                   })}
                  />
                    <Input
                     label = "Email: "
                     placeholder = "Enter your email"
                     type="email"
                     {...register("email", {
                      required: "Email is required",
                      validate: {
                     // This is the pattern which is used to validate the email using regular expression 
                  
                        matchPattern: (value) => /^([\w.\-_]+)?\w+@[\w-]+(\.\w+){1,}$/.test(value) || "Email address must be a valid email address",
                           }
                       })}
                      />

                      <Input
                      label = "Password"
                      type = "password"
                      placeholder= "Enter your password" 
                      {...register("password", {
                        required:"Password is required",
                        minLength: { value: 8, message: "Password must be at least 8 characters" },

                      })}
                      />

                      <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full"
                      >{isSubmitting ? "Creating account…" : "Create Account"}</Button>
                  
                </div>
              </form>
      </  div>
    </div>
  )
}

export default Signup
