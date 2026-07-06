import { useEffect, useState } from "react";
import ThemeContext from "./ThemeContext";

export default function ThemeProvider({ children }) {

    const [dark,setDark]=useState(false);

    useEffect(()=>{

        if(dark){

            document.documentElement.classList.add("dark");

        }else{

            document.documentElement.classList.remove("dark");

        }

    },[dark])

    return(

        <ThemeContext.Provider value={{dark,setDark}}>

            {children}

        </ThemeContext.Provider>

    )

}