import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login as authLogin } from "../store/authSlice";
import { Button, Input, Logo } from "./index";
import { useDispatch } from "react-redux";
import authService from "../appwrite/auth";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { 
    register,
    handleSubmit,
    formState: {errors} 
   } = useForm();
  const [error, setError] = useState("");

  const login = async (data) => {
    // whenever you want to set the login the first thing to do is to empty out all the errors using setError(""). All the login form and register form should be made in the same way. as there are error but as soon as we are starting the submition the error should be clear out

    setError("");
    try {
      const session = await authService.login(data);
      if (session) {
        // userdata is always pull from the await function

        const userData = await authService.getCurrentUser();
        if (userData)
           dispatch(authLogin(userData));

        // link is not used here has link doesnot work automatically we have to click the link to go to some other page .
        // navigate is used here as navigate programmtically move to the page after the login for eg : home page

         toast.success(`Welcome back, ${userData.name}! 👋`, {
          duration: 3000,
        });

        navigate("/");
      }
    } catch (error) {
       setError(error.message);
       toast.error(error.message || "Login Failed");
    }
  };

  return (
   <div className="min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 transition-colors duration-300 px-4">
      <div className=" mx-auto
    w-full
    max-w-md
    bg-white/90
     dark:bg-slate-900/90
    backdrop-blur-md
    rounded-3xl
    shadow-2xl
    border
   border-slate-200 dark:border-slate-700
    p-10">
        <div className="mb-2 flex justify-center">
        <span className="inline-block w-full max-w-[80px] mb-4">
            <Logo width="100%" />
          </span>
        </div>
        <h2 className="text-center text-3xl font-bold text-slate-800 dark:text-white mt-4 transition-colors">
          Sign in to your account
        </h2>
        <p className="text-center text-slate-500 dark:text-slate-400 mt-2 mb-6">
  Welcome back! Continue writing and exploring amazing blogs.
</p>
        <p className="mt-3 text-center text-slate-500 dark:text-slate-400 leading-6 transition-colors">
          Don&apos;t have an account ?&nbsp;
         <Link
  to="/signup"
 className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-300"
>
  Sign Up
</Link>
        </p>
        {error && (
  <div
    className="
      mt-6
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
    "
  >
    {error}
  </div>
)}

        {/*Handle submit is an event.Whenever the form is submit it is through handleSubmit() method  */}

        <form onSubmit={handleSubmit(login)} className="mt-10">
          <div className="space-y-6">
            <Input
              label="Email: "
              placeholder="Enter your email"
              type="email"
              {...register("email", {
                required: true,
                validate: {
                  // This is the pattern which is used to validate the email using regular expression

                  matchPattern: (value) =>
                    /^([\w.\-_]+)?\w+@[\w-]+(\.\w+){1,}$/.test(value) ||
                    "Email address must be a valid email address",
                },
              })}
            />

            <Input
              label="Password: "
              type="password"
              placeholder="Enter the password"
              {...register("password", {
                required: true,
              })}
            />
            <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600">
              Sign in
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
