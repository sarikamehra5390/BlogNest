// this layout is a mechansim that how to protect the pages and the route
// this is a container there is nothing much just it is used whether to show the value or not

import React , {useEffect, useState} from 'react'
import {useSelector} from 'react-redux'
import {useNavigate} from 'react-router-dom'


// Name of the file and the function can be different there is no problem in that 

// this protected is used that whether to render the info or not 

 export default function Protected({children, authentication = true}) {

    const navigate = useNavigate()
    const [loader, setLoader] = useState(true)
    const authStatus = useSelector(state => state.auth.status) 

    useEffect(() => {
    
        // true && (false !== true)--> true
        if (authentication && authStatus !== authentication) {
            navigate("/login")
        }else if(!authentication && authStatus !== authentication){
            navigate("/")
        }
        setLoader(false)

    }, [authStatus, navigate, authentication])

  return loader ? <h1>Loading....</h1> : <>{children}</>
}

