import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import store from './store/store.js'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Edit, Home } from "./pages/Home.jsx"
import Signup from './pages/Signup'

import AllPost from './pages/AllPost'
import AddPost from './pages/AddPost'
import EditPost from './pages/EditPost'
import Post from './pages/Post'

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
    <Provider store = {store}>
    <RouterProvider router={router}/>
    </Provider>
  </React.StrictMode>,
)
