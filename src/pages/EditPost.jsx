import {useEffect, useState} from 'react'
import { Container, PostForm } from '../components'
import appwriteService from "../appwrite/config"
import { useNavigate, useParams } from 'react-router-dom'
import toast from "react-hot-toast"
import { useSelector } from "react-redux"


function EditPost() {
    const [post, setPosts] = useState(null)
    
    // taking anything from the url we have to use useParams
    const {slug} = useParams()
    const navigate = useNavigate()
    const userData = useSelector((state) => state.auth.userData);

    useEffect(() =>{
        if(slug){
            appwriteService.getPost(slug).then((post) => {
                if(post && post.userId === userData?.$id){
                    setPosts(post)
                }else if (post) {
                    toast.error("You can only edit your own posts.");
                    navigate(`/post/${post.$id}`, { replace: true });
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
    }, [slug, navigate, userData])

  return post ? (
    <div className='page-shell'>
        <Container>
            <PostForm post={post} />
        </Container>
    </div>
  ) : null
    
}

export default EditPost
