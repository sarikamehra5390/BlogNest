import React from 'react'
import { Container,PostForm } from '../components'

function AddPost() {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 transition-colors py-12">
        <Container>
            <PostForm />
        </Container>
    </div>
  )
}

export default AddPost