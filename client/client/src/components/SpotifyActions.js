import axios from 'axios';
import SpotifyWebApi from 'spotify-web-api-node';

const BASE_URL = 'https://api.spotify.com/v1';

const spotifyApi = new SpotifyWebApi({
  clientId: "2136706f70154b709bd7e932406f1e74",
});

export const setAccessToken = (accessToken) => {
  spotifyApi.setAccessToken(accessToken);
};


export const getUserPlaylists = async (accessToken) => {
  try {
    const response = await axios.get(`${BASE_URL}/me/playlists`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    return response.data.items.map(playlist => ({
      id: playlist.id,
      name: playlist.name,
      uri: playlist.uri,
      imageUrl: playlist.images[0]?.url || '',
    }));
  } catch (error) {
    console.error('Error fetching playlists', error);
    throw error;
  }
};

export const getUserSavedAlbums = async (accessToken) => {
  try {
    const response = await axios.get(`${BASE_URL}/me/albums`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    return response.data.items.map(item => ({
      id: item.album.id,
      name: item.album.name,
      uri: item.album.uri,
      imageUrl: item.album.images[0]?.url || '',
    }));
  } catch (error) {
    console.error('Error fetching saved albums', error);
    throw error;
  }
};

export const createTemporaryAlbum = async (userId, albumName) => {
  try {
    const response = await spotifyApi.createPlaylist(userId, {
      name: albumName,
      public: false
    });
    return response.body;
  } catch (error) {
    console.error('Error creating temporary album', error.response.data);
    throw error;
  }
};

export const addTrackToTemporaryAlbum = async (playlistId, trackUri) => {
  try {
    await spotifyApi.addTracksToPlaylist(playlistId, [trackUri]);
  } catch (error) {
    console.error('Error adding track to temporary album', error);
    throw error;
  }
};

export const addTracksToTemporaryAlbum = async (playlistId, trackUris) => {
  try {
    await spotifyApi.addTracksToPlaylist(playlistId, trackUris);
  } catch (error) {
    console.error('Error adding tracks to temporary album', error);
    throw error;
  }
};

export const unfollowAlbum = async (playlistId) => {
  try {
    await spotifyApi.unfollowPlaylist(playlistId);
  } catch (error) {
    console.error('Error unfollowing temporary album', error);
    throw error;
  }
};

export const addToQueue = async (uri) => {
  try {
    await spotifyApi.addToQueue(uri);
    console.log('Added to queue:', uri);
  } catch (error) {
    console.error('Error adding to queue', error);
    throw error; // Propagate the error up for better error handling in UI
  }
};

export const addPlaylistToQueue = async (playlistId) => {
  try {
    const playlistTracks = await spotifyApi.getPlaylistTracks(playlistId);
    const uris = playlistTracks?.body?.items?.map(item => item.track.uri) || [];
    for (const uri of uris) {
      await addToQueue(uri);
    }
    console.log('Added playlist to queue:', playlistId);
  } catch (error) {
    console.error('Error adding playlist to queue', error);
    throw error; // Propagate the error up for better error handling in UI
  }
};

export const addAlbumToQueue = async (albumId) => {
  try {
    const albumTracks = await spotifyApi.getAlbumTracks(albumId);
    const uris = albumTracks?.body?.items?.map(item => item.uri) || [];
    for (const uri of uris) {
      await addToQueue(uri);
    }
    console.log('Added album to queue:', albumId);
  } catch (error) {
    console.error('Error adding album to queue', error);
    throw error; // Propagate the error up for better error handling in UI
  }
};

export const getPlaybackQueue = async (accessToken) => {
  try {
    const response = await axios.get(`${BASE_URL}/me/player/queue`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (response.status === 200 && Array.isArray(response.data.queue)) {
      return response.data.queue.map(item => ({
        title: item.name || 'Unknown Title',
        artist: item.artists.map(artist => artist.name).join(', ') || 'Unknown Artist',
        album: item.album.images[0]?.url || '',
        uri: item.uri,
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error fetching playback queue', error);
    throw error;
  }
};



export const shufflePlayback = async () => {
  try {
    await spotifyApi.setShuffle(true);
    console.log('Shuffle enabled');
  } catch (error) {
    console.error('Error enabling shuffle', error);
    throw error; // Propagate the error up for better error handling in UI
  }
};
