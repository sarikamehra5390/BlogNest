import React from 'react'
import { useState } from 'react'
import {Link, useNavigate} from 'react-router-dom'
import {login as authLogin} from '../store/authSlice'
import {Button , Input , Logo} from './index'
import { useDispatch } from 'react-redux'
import authService from '../appwrite/auth'
import {useForm} from 'react-hook-form'


function Login() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const {register, handleSubmit} = useForm()
    const {error, setError} = useState("")

    const login = async(data) => {

        // whenever you want to set the login the first thing to do is to empty out all the errors using setError(""). All the login form and register form should be made in the same way. as there are error but as soon as we are starting the submition the error should be clear out

        setError("")
        try {
           const session = await  authService.login(data)
           if (session) {

            // userdata is always pull from the await function 

             const userData = await authService.getCurrentUser()
             if (userData) dispatch(authLogin(userData))

            // link is not used here has link doesnot work automatically we have to click the link to go to some other page . 
            // navigate is used here as navigate programmtically move to the page after the login for eg : home page 

             navigate("/")
           }
        } catch (error) {
           setError(error.message) 
        }
    }

  return (
    <div
    className='flex items-center justify-center w-full'>
        <div className='mx-auto w-full max-w-lg bg-gray-100 rounded-xl p-10 border border-black/10'>
        <div className='mb-2 flex justify-center'>
            <span className='inline-block w-full max-w-[100px]'>
                <Logo width="100%" />
            </span>
        </div>
        <h2 className='text-center text-2xl font-bold leading-tight'>
            Sign in to your account 
        </h2>
        <p className='mt-2 text-center text-base text-black/60'>
            Don&apos;t have an account ?&nbsp;
            <Link 
              to= '/signup'
              className='font-medium text-primary transition-all duration-200 hover:underline'
            />
            Sign Up 
        </p>
        {error &&  <p className='text-red-600 mt-8 text-center'>{error}</p>}
        
        {/*Handle submit is an event.Whenever the form is submit it is through handleSubmit() method  */}

        <form onSubmit={handleSubmit(login)} className='mt-8'>
            <div className='space-y-5'>
              <Input
               label = "Email: "
               placeholder = "Enter your email"
               type="email"
               {...register("email", {
                required: true,
                validate: {
                    // This is the pattern which is used to validate the email using regular expression 

                    matchPattern: (value) => /^([\w\.\-_]+)?\w+@[\w-_]+(\.\w+){1,}$/.test(value) || " Email address must not be valid address",
                }
               })}
              />

              <Input
               label = "Password: "
               type = "password"
               placeholder = "Enter the password"
               {...register("password", {
                   required: true,
               })}
              />
              <Button
              type="submit"
              className= "w-full"
              >Sign in</Button>
            </div>
        </form>
           
        </div>
    </div>
  )
}

export default Login