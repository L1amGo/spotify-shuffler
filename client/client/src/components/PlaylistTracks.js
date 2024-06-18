import { useState, useEffect } from 'react';
import { ListGroup, Button } from 'react-bootstrap';
import SpotifyWebApi from 'spotify-web-api-node';
import { addToQueue } from './SpotifyActions';

const spotifyApi = new SpotifyWebApi({
  clientId: "2136706f70154b709bd7e932406f1e74",
});

const PlaylistTracks = ({ accessToken, playlistId, goBack }) => {
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    if (!accessToken) return;
    spotifyApi.setAccessToken(accessToken);

    const fetchTracks = async () => {
      try {
        const tracksData = await spotifyApi.getPlaylistTracks(playlistId);
        setTracks(tracksData?.body?.items || []);
      } catch (error) {
        console.error('Error fetching tracks', error);
      }
    };

    fetchTracks();
  }, [accessToken, playlistId]);

  return (
    <div className="playlist-tracks my-2" style={{ overflowY: "auto" }}>
      <button onClick={goBack} className="btn btn-secondary mb-3">Back to Playlists</button>
      <h5>Playlist Tracks</h5>
      <ListGroup>
        {tracks.map(track => (
          <ListGroup.Item key={track.track.id} className="d-flex align-items-center">
            <img src={track.track.album.images[0]?.url || ''} alt={track.track.name || 'Track Art'} style={{ height: 64, width: 64 }} />
            <div className="ml-3">
              <div>{track.track.name || 'Unknown Track'}</div>
              <div className="text-muted">{track.track.artists[0]?.name || 'Unknown Artist'}</div>
            </div>
            <Button variant="outline-primary" className="ml-auto" onClick={() => addToQueue(track.track.uri)}>
              Add to Queue
            </Button>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

export default PlaylistTracks;
