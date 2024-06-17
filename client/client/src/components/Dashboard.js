import {useState, useEffect} from 'react'
import { Container, Form} from 'react-bootstrap'
import useAuth from './useAuth'
import SpotifyWebApi from'spotify-web-api-node'
import TrackSearchResult from './TrackSearchResult'
import Player from './Player'

const spotifyApi = new SpotifyWebApi({
  clientId: "2136706f70154b709bd7e932406f1e74",
});

const Dashboard = ({code}) => {
    const accessToken = useAuth(code)
    const [search, setSearch] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [playingTrack, setPlayingTrack] = useState("")

    function chooseTrack(track) {
      setPlayingTrack(track)
      setSearch('')
    }

    useEffect(() => {
      if (!accessToken) return
      spotifyApi.setAccessToken(accessToken)
    }, [accessToken])

    useEffect(() => {
      if (!search) return setSearchResults([])
      if (!accessToken) return

      let cancel = false
      spotifyApi.searchTracks(search).then(res => {
        if (cancel) return
        setSearchResults(res.body.tracks.items.map(track => {
          const smallestAlbumImage = track.album.images.reduce((smallest, current) => {
            if (current.height < smallest.height) return current
            return smallest
          }, track.album.images[0])
          return {
            title: track.name,
            artist: track.artists[0].name,
            album: smallestAlbumImage.url,
            uri: track.uri,
          }
        }))

        return () => cancel = true

    })}, [search, accessToken])
    
  return (
    <Container className = "d-flex flex-column py 2" style={{
      height: "100vh",
    }}>
        <Form.Control type="search" placeholder="Search for an artist" value = {search} onChange = {e => setSearch(e.target.value)} />
        <div className ="flex-grow-1 my-2" style ={{ overflowY: "auto"}}>
        {searchResults.map(track => (
          <TrackSearchResult track = {track} key = {track.uri} chooseTrack = {chooseTrack}/>
        ))}
        </div>
        <div><Player accessToken={accessToken} trackUri = {playingTrack?.uri}/></div>
    </Container>
  )
}

export default Dashboard