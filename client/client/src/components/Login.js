import React from 'react'

import { Container } from'react-bootstrap'

const AUTH_URL = `https://accounts.spotify.com/authorize?
client_id=2136706f70154b709bd7e932406f1e74&response_type=code&
redirect_uri=http://localhost:3000&scope=streaming%20user-read-private
%20user-read-email%20user-library-read%20user-library-modify%20user-read-playback-state%20
user-modify-playback-state%20playlist-read-private%20playlist-read-collaborative%20
user-read-currently-playing%20playlist-modify-private%20playlist-modify-public`


const Login = () => {
  return (
    <Container 
        className ="d-flex justify-content-center align-items-center"
        style={{height: "100vh"}}
    >
        <a className= "btn btn-success btn-lg" href={AUTH_URL}>
            Login with Spotify
        </a>
    </Container>
  )
}

export default Login