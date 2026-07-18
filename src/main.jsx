import React from 'react'
import "@fontsource/inter";
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Provider } from 'react-redux'
import store from './store/store.js'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import  Home  from "./pages/Home.jsx"
import Signup from './pages/Signup.jsx'
import AllPost from './pages/AllPost'
import AddPost from './pages/AddPost'
import EditPost from './pages/EditPost'
import Post from './pages/Post'
import { AuthLayout , Login} from './components/index.js'
import ThemeProvider from "./context/ThemeProvider";
import { Toaster } from "react-hot-toast";
import SearchProvider from "./context/SearchProvider";


const router = createBrowserRouter([
  {
    path:'/',
    element:<App />,
    children:[
      {
        path:"/",
        element:<Home />,
      },
      {
        path:'/login',
        element:(
          <AuthLayout authentication={false}>
            <Login />
          </AuthLayout>
        )
      },
      {
        path:'/signup',
        element:(
          <AuthLayout authentication={false}>
            <Signup />
          </AuthLayout>
        )
      },
       {
        // as for reading the post we need authentication
        path:'/all-posts',
        element:(
          <AuthLayout authentication={true}>
            {" "}
            <AllPost />
          </AuthLayout>
        )
      },
       {
        path:'/add-post',
        element:(
          <AuthLayout authentication={true}>
            {" "}
            <AddPost/>
          </AuthLayout>
        )
      },
       {
        path:'/edit-post/:slug',
        element:(
          <AuthLayout authentication={true}>
            {" "}
            <EditPost />
          </AuthLayout>
        )
      },
       {
        path:'/post/:slug',
        element: <Post />
      },
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
 <React.StrictMode>
  <Provider store={store}>
    <ThemeProvider>
      <SearchProvider>
      <RouterProvider router={router}/>

      {/*In React, a toast is a small, non-blocking notification pop-up that provides brief feedback about actions, errors, or events without interrupting the user's workflow.  These messages typically disappear automatically after a set duration or can be dismissed manually, often appearing at the bottom or corner of the screen with various animation effects*/}

        <Toaster
      position="top-right"
      reverseOrder={false}
      toastOptions={{
        style: {
      borderRadius: "12px",
      background: "#1e293b",
      color: "#fff",
      padding: "16px",
    },
    success: {
      iconTheme: {
        primary: "#22c55e",
        secondary: "#fff",
      },
    },
    error: {
      iconTheme: {
        primary: "#ef4444",
        secondary: "#fff",
      },
    },
        duration: 3000,
      }}
    />
      </SearchProvider>
    </ThemeProvider>
  </Provider>
</React.StrictMode>,
)
