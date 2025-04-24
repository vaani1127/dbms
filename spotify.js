import fetch from 'node-fetch';

let accessToken = process.env.SPOTIFY_ACCESS_TOKEN || 'BQAc-KfRxcUIljIwjdHJrffITHkHhSTEz_6_iK-sX7-8uldIMO4PQJN0OS9h09funGeVQNqHzOi3i0tum3cz4lp9h-7UQktTwUB5GhzojPyfSK6piLtFnax_dNjtJgW8ZMOXkXIndWgpw1jcqU_w71AVk2itXGR3ASNUXOb3GWPlEq3_W81LL1pTL0kKNqjAVSpJdTgdEPOOYUnoFAumCk2lFeWYMhZPUjCePjMKRJgE56VVN_8eFpw-OEJxiFiu-xdAI6ErHK7ClG7TrlG2BqLyXfBLeTUbWQemkvptM-0EIpdXCz9PXQY3JNNCsavG';

// Set Spotify API access token
export function setAccessToken(token) {
  accessToken = token;
}

// Search for a track by name
export async function searchTrack(trackName) {
  if (!accessToken) throw new Error('Spotify access token not set');

  const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(trackName)}&type=track&limit=1`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error('Spotify API error: ' + response.statusText);
  }

  const data = await response.json();
  if (data.tracks.items.length === 0) {
    return null;
  }
  return data.tracks.items[0];
}

// Get track details by Spotify track ID
export async function getTrack(trackId) {
  if (!accessToken) throw new Error('Spotify access token not set');

  const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error('Spotify API error: ' + response.statusText);
  }

  const data = await response.json();
  return data;
}

// Play a track (requires Spotify Connect device ID and user authorization)
// This is a placeholder function; actual playback control requires frontend integration with Spotify Web Playback SDK
export async function playTrack(deviceId, trackUri) {
  if (!accessToken) throw new Error('Spotify access token not set');

  const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ uris: [trackUri] })
  });

  if (!response.ok) {
    throw new Error('Spotify API error: ' + response.statusText);
  }

  return true;
}
