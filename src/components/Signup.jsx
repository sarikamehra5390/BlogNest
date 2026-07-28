import React, {useState} from 'react'
import authService from '../appwrite/auth'
import {Link, useNavigate} from 'react-router-dom'
import {login} from '../store/authSlice'
import {Button, Input, Logo} from './index'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import toast from "react-hot-toast";
import profileService from "../appwrite/profileService";

function Signup() {
    const navigate = useNavigate()
    const [error, setError] = useState("")
    const dispatch = useDispatch()
    const {
      register,
       handleSubmit,
      } = useForm()

    const create = async (data) => {
    setError("");

    try {
        const account = await authService.createAccount(data);

        if (account) {
            const currentUser = await authService.getCurrentUser();

            if (currentUser) {

                // Check if profile already exists
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
        }
    } catch (error) {
        setError(error.message);
        toast.error(error.message);
    }
};

  return (
  <div className="min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 transition-colors duration-300 px-4">
      <div className={` mx-auto
    w-full
    max-w-md
    bg-white/90 dark:bg-slate-900/90
    backdrop-blur-md
    rounded-3xl
    shadow-2xl
    border
    bg-white/90 dark:bg-slate-900/90
    p-10`}>
      <div className='mb-2 flex justify-center'>
      <span className="inline-block w-full max-w-[80px] mb-4">
          <Logo width= '100%' />
        </span>
      </div>
       <h2 className="text-center text-3xl font-bold text-slate-800 dark:text-white mt-4 transition-colors">
                  Sign up to create account
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

              <form onSubmit={handleSubmit(create)}>
                <div className="space-y-6">
                  <Input
                   label = "Full Name: "
                   placeholder ="Enter your full name"
                   {...register("name", {
                    required : true,
                   })}
                  />
                    <Input
                     label = "Email: "
                     placeholder = "Enter your email"
                     type="email"
                     {...register("email", {
                      required: true,
                      validate: {
                     // This is the pattern which is used to validate the email using regular expression 
                  
                        matchPattern: (value) => /^([\w\.\-_]+)?\w+@[\w-_]+(\.\w+){1,}$/.test(value) || "Email address must be a valid email address",
                           }
                       })}
                      />

                      <Input
                      label = "Password"
                      type = "password"
                      placeholder= "Enter your password" 
                      {...register("password", {
                        required:true,

                      })}
                      />

                      <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
                      >Create Account</Button>
                  
                </div>
              </form>
      </  div>
    </div>
  )
}

export default Signup