import { useState, useEffect } from 'react';
import { Container, Form, Button, ListGroup, Row, Col } from 'react-bootstrap';
import useAuth from './useAuth';
import SpotifyWebApi from 'spotify-web-api-node';
import TrackSearchResult from './TrackSearchResult';
import Player from './Player';
import {
  setAccessToken,
  createTemporaryAlbum,
  addTrackToTemporaryAlbum,
  addTracksToTemporaryAlbum,
  shufflePlayback,
  getUserPlaylists,
  getUserSavedAlbums
} from './SpotifyActions';

const spotifyApi = new SpotifyWebApi({
  clientId: "2136706f70154b709bd7e932406f1e74",
});

const Dashboard = ({ code }) => {
  const accessToken = useAuth(code);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [playingTrack, setPlayingTrack] = useState('');
  const [playlists, setPlaylists] = useState([]);
  const [savedAlbums, setSavedAlbums] = useState([]);
  const [temporaryAlbum, setTemporaryAlbum] = useState(null);

  useEffect(() => {
    if (!accessToken) return;

    spotifyApi.setAccessToken(accessToken);
    setAccessToken(accessToken);

    const fetchData = async () => {
      try {
        const [playlistsData, savedAlbumsData] = await Promise.all([
          getUserPlaylists(accessToken),
          getUserSavedAlbums(accessToken)
        ]);
        setPlaylists(playlistsData);
        setSavedAlbums(savedAlbumsData);
      } catch (error) {
        console.error('Error fetching playlists and albums', error);
      }
    };

    fetchData();
  }, [accessToken]);

  function chooseTrack(track) {
    setPlayingTrack(track);
    setSearch('');
  }

  useEffect(() => {
    if (!search) return setSearchResults([]);
    if (!accessToken) return;

    let cancel = false;
    spotifyApi.searchTracks(search).then(res => {
      if (cancel) return;
      setSearchResults(res.body.tracks.items.map(track => ({
        title: track.name,
        artist: track.artists[0].name,
        album: track.album.images[0]?.url,
        uri: track.uri,
      })));

      return () => cancel = true;
    }).catch(error => {
      console.error('Error searching tracks:', error);
      setSearchResults([]);
    });
  }, [search, accessToken]);

  const handleAddToQueue = async (trackUri) => {
    try {
      if (!temporaryAlbum) {
        console.error('Temporary album not initialized');
        return;
      }

      await addTrackToTemporaryAlbum(temporaryAlbum.id, trackUri);
    } catch (error) {
      console.error('Error adding track to temporary album', error);
    }
  };

  const handleAddAlbumToQueue = async (albumId) => {
    try {
      const albumTracks = await spotifyApi.getAlbumTracks(albumId);
      const uris = albumTracks.body.items.map(item => item.uri);

      if (!temporaryAlbum) {
        const userId = (await spotifyApi.getMe()).body.id;
        const album = await createTemporaryAlbum(userId, 'Temporary Album');
        setTemporaryAlbum(album);
      }

      await addTracksToTemporaryAlbum(temporaryAlbum.id, uris);
    } catch (error) {
      console.error('Error adding album to temporary album', error);
    }
  };

  const handleAddPlaylistToQueue = async (playlistId) => {
    try {
      const playlistTracks = await spotifyApi.getPlaylistTracks(playlistId);
      const uris = playlistTracks.body.items.map(item => item.track.uri);

      if (!temporaryAlbum) {
        const userId = (await spotifyApi.getMe()).body.id;
        const album = await createTemporaryAlbum(userId, 'Temporary Album');
        setTemporaryAlbum(album);
      }

      await addTracksToTemporaryAlbum(temporaryAlbum.id, uris);
    } catch (error) {
      console.error('Error adding playlist to temporary album', error);
    }
  };

  const handleShuffle = async () => {
    try {
      if (!temporaryAlbum) {
        console.error('Temporary album not initialized');
        return;
      }

      await shufflePlayback();
      await spotifyApi.play({
        context_uri: temporaryAlbum.uri,
        offset: { position: 0 }
      });
    } catch (error) {
      console.error('Error starting playback from temporary album', error);
    }
  };

  return (
    <Container fluid className="d-flex flex-column py-2" style={{ height: "100vh" }}>
      <Form.Control
        type="search"
        placeholder="Search for a song"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-3"
      />
      <Row className="flex-grow-1 my-2">
        <Col md={6} style={{ overflowY: "auto" }}>
          <h5>Search Results</h5>
          {searchResults.map(track => (
            <TrackSearchResult
              track={track}
              key={track.uri}
              chooseTrack={chooseTrack}
              addToQueue={() => handleAddToQueue(track.uri)}
            />
          ))}
        </Col>
        <Col md={6} style={{ overflowY: "auto" }}>
          <h5>Your Playlists</h5>
          <ListGroup>
            {playlists.map(playlist => (
              <ListGroup.Item key={playlist.id}>
                <img src={playlist.imageUrl || ''} alt={playlist.name || 'Playlist Art'} style={{ height: 64, width: 64 }} />
                <div className="ml-3">
                  <div>{playlist.name}</div>
                  <Button variant="primary" onClick={() => handleAddPlaylistToQueue(playlist.id)}>Add to Queue</Button>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
          <h5 className="mt-4">Your Saved Albums</h5>
          <ListGroup>
            {savedAlbums.map(album => (
              <ListGroup.Item key={album.id}>
                <img src={album.imageUrl || ''} alt={album.name || 'Album Art'} style={{ height: 64, width: 64 }} />
                <div className="ml-3">
                  <div>{album.name}</div>
                  <Button variant="primary" onClick={() => handleAddAlbumToQueue(album.id)}>Add to Queue</Button>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
      </Row>
      <div className="mt-auto d-flex justify-content-around">
        <Button onClick={handleShuffle}>Shuffle and Play</Button>
      </div>
      <div className="mt-auto">
        <Player accessToken={accessToken} trackUri={playingTrack?.uri} />
      </div>
    </Container>
  );
};

export default Dashboard;
