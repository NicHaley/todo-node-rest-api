"use strict";

const fetch = require('node-fetch');
const clientId = process.env['SPOTIFY_CLIENT_ID']
const clientSecret = process.env['SPOTIFY_CLIENT_SECRET']
const refreshToken = process.env['SPOTIFY_REFRESH_TOKEN']
let accessToken = '';

const spotifyAPIBaseUri = "https://api.spotify.com";
const spotifyAccountsBaseUri = "https://accounts.spotify.com";

const refreshAccessToken = () => {
  return fetch(`${spotifyAccountsBaseUri}/api/token`, {
    method: 'POST',
    body: `grant_type=refresh_token&refresh_token=${refreshToken}`,
    headers: {
      'Authorization': `Basic ${new Buffer(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

const getRecentlyPlayed = () => {
  return fetch(`${spotifyAPIBaseUri}/v1/me/player/recently-played`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}


exports.get_spotify = (req, res) => {
  getRecentlyPlayed()
    .then(recentlyPlayedResponse => {
      console.log(1111, recentlyPlayedResponse)
      if (recentlyPlayedResponse.status >= 400 && recentlyPlayedResponse.status < 600) {
        throw new Error("Bad response from server");
      }
      return recentlyPlayedResponse.json()
    })
    .then(recentlyPlayedResponseJSON => {
      res.send(recentlyPlayedResponseJSON);
    })
    .catch(() => {
      refreshAccessToken().then(response => {
        console.log(2222, response);
      })
        // .then(refreshResponse => response.json())
        // .then(refreshResponseJSON => {
        //   accessToken = refreshResponseJSON["access_token"];
        //   getRecentlyPlayed()
        //     .then(recentlyPlayedResponse => recentlyPlayedResponse.json())
        //     .then(recentlyPlayedResponseJSON => {
        //       res.send(recentlyPlayedResponseJSON);
        //     })
        //     .catch(() => {
        //       res.status(500).send("Failed to get recently played tracks");
        //     });
        // })
        // .catch(() => {
        //   res.status(500).send("Failed to refresh Spotify token");
        // });
    });
};
