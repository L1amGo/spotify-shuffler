import { useState, useEffect } from 'react';
import { ListGroup, Button } from 'react-bootstrap';
import SpotifyWebApi from 'spotify-web-api-node';
import { addPlaylistToQueue } from './SpotifyActions';

const spotifyApi = new SpotifyWebApi({
  clientId: "2136706f70154b709bd7e932406f1e74",
});

const Playlists = ({ accessToken, selectPlaylist }) => {
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    if (!accessToken) return;
    spotifyApi.setAccessToken(accessToken);

    const fetchPlaylists = async () => {
      try {
        const playlistsData = await spotifyApi.getUserPlaylists();
        setPlaylists(playlistsData?.body?.items || []);
      } catch (error) {
        console.error('Error fetching playlists', error);
      }
    };

    fetchPlaylists();
  }, [accessToken]);

  return (
    <div className="playlists my-2" style={{ overflowY: "auto" }}>
      <h5>Your Playlists</h5>
      <ListGroup>
        {playlists.map(playlist => (
          <ListGroup.Item key={playlist.id} className="d-flex align-items-center">
            <img src={playlist.images[0]?.url || ''} alt={playlist.name || 'Playlist Art'} style={{ height: 64, width: 64 }} />
            <div className="ml-3">
              <div>{playlist.name || 'Unknown Playlist'}</div>
              <div className="text-muted">{playlist.tracks.total || 0} songs</div>
            </div>
            <Button variant="outline-primary" className="ml-auto" onClick={() => addPlaylistToQueue(playlist.id)}>
              Add to Queue
            </Button>
            <Button variant="link" className="ml-2" onClick={() => selectPlaylist(playlist.id)}>
              View
            </Button>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

export default Playlists;
