import React, {useEffect, useState} from 'react'
import { Container, PostForm } from '../components'
import appwriteService from "../appwrite/config"
import { useNavigate, useParams } from 'react-router-dom'
import toast from "react-hot-toast"


function EditPost() {
    const [post, setPosts] = useState(null)
    
    // taking anything from the url we have to use useParams
    const {slug} = useParams()
    const navigate = useNavigate()

    useEffect(() =>{
        if(slug){
            appwriteService.getPost(slug).then((post) => {
                if(post){
                    setPosts(post)
                }else{
                    navigate('/')
                }
            }).catch(error => {
                toast.error('Failed to load post');
                navigate('/');
            })
        }else{
            navigate('/')
        }
    }, [slug, navigate])

  return post ? (
    <div className='py-8'>
        <Container>
            <PostForm post={post} />
        </Container>
    </div>
  ) : null
    
}

export default EditPost