import {useDispatch} from 'react-redux'
import { useState, useEffect } from 'react'
import './App.css'
import authService from "./appwrite/auth"
import {login, logout} from "./store/authSlice"
import { Footer, Header } from './components'
import { Outlet } from 'react-router-dom'

function App() {
// Initially loading = true.
// This prevents the app from rendering until authentication is checked.

  const [loading, setLoading] = useState(true)

  //dispatch is the Redux function used to send actions to the store so that the state can be updated.
  
  const dispatch = useDispatch()

  // Runs only once when the app loads because of [].

  useEffect(() => {
    authService.getCurrentUser()
    .then((userData)=>{
      if(userData){
        dispatch(login({userData}))
      }else{
        dispatch(logout())
      }
    })
    .catch(() => {
      dispatch(logout())
    })
    .finally(() => setLoading(false))
  },[])
  
  return !loading ? (
    <div className='min-h-screen flex flex-wrap content-between bg-gray-400'>
      <div className='w-full block'>
        <Header />
        <main>
        {/* <Outlet /> */}
        </main>
        <Footer />
      </div>
    </div>
  ) : null
}

export default App
