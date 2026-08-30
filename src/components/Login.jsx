import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { login as authLogin } from "../store/authSlice";
import { Button, Input, Logo } from "./index";
import { useDispatch } from "react-redux";
import authService from "../appwrite/auth";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { getAppwriteErrorMessage } from "../utils/appwriteError";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { 
    register,
    handleSubmit,
   } = useForm();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const login = async (data) => {
    if (isSubmitting) return;
    setError("");
    setIsSubmitting(true);
    try {
      const { user, reusedSession } = await authService.login(data);
      if (user) {
        dispatch(authLogin(user));
        toast.success(reusedSession ? `Welcome back, ${user.name}!` : `Welcome back, ${user.name}! 👋`, {
          duration: 3000,
        });
        navigate(location.state?.from || "/", { replace: true });
      }
    } catch (error) {
       console.error("Login failed", error);
       const message = getAppwriteErrorMessage(error, "login");
       setError(message);
       toast.error(message);
    } finally {
       setIsSubmitting(false);
    }
  };

  return (
   <div className="relative isolate min-h-[80vh] overflow-hidden flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300 px-4 py-10"><div className="absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(circle_at_50%_0,rgba(129,140,248,.25),transparent_55%)]" />
      <div className=" mx-auto
    w-full
    max-w-md
    bg-white dark:bg-slate-900
    rounded-3xl
    shadow-xl shadow-slate-300/40 dark:shadow-none
    border
   border-slate-200 dark:border-slate-700
    p-7 sm:p-10">
        <div className="mb-2 flex justify-center">
        <span className="inline-block w-full max-w-[80px] mb-4">
            <Logo width="100%" />
          </span>
        </div>
        <h2 className="text-center text-3xl font-bold text-slate-800 dark:text-white mt-4 transition-colors">
          Welcome back
        </h2>
        <p className="text-center text-slate-500 dark:text-slate-400 mt-2 mb-6">
  Sign in to continue reading, writing, and connecting with the community.
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

        <form onSubmit={handleSubmit(login)} className="mt-8">
          <div className="space-y-6">
            <Input
              label="Email: "
              placeholder="Enter your email"
              type="email"
              {...register("email", {
                required: "Email is required",
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
                required: "Password is required",
              })}
            />
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Signing in…" : "Sign in"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
