"use strict";

var request = require("request");

const clientId = process.env['SPOTIFY_CLIENT_ID']
const clientSecret = process.env['SPOTIFY_CLIENT_SECRET']
const refreshToken = process.env['SPOTIFY_REFRESH_TOKEN']
let accessToken = '';

const spotifyAPIBaseUri = "https://api.spotify.com";
const spotifyAccountsBaseUri = "https://accounts.spotify.com";

exports.get_spotify = (req, res) => {
  getRecentlyPlayed()
    .then(recentlyPlayedResponse => recentlyPlayedResponse.json())
    .then(recentlyPlayedResponseJSON => {
      res.send(recentlyPlayedResponseJSON);
    })
    .catch(() => {
      refreshAccessToken()
        .then(refreshResponse => response.json())
        .then(refreshResponseJSON => {
          accessToken = refreshResponseJSON["access_token"];
          getRecentlyPlayed()
            .then(recentlyPlayedResponse => recentlyPlayedResponse.json())
            .then(recentlyPlayedResponseJSON => {
              res.send(recentlyPlayedResponseJSON);
            })
            .catch(() => {
              res.status(500).send("Failed to get recently played tracks");
            });
        })
        .catch(() => {
          res.status(500).send("Failed to refresh Spotify token");
        });
    });
};

const refreshAccessToken = () => {
  const options = {
    url: `${spotifyAccountsBaseUri}/api/token`,
    method: 'POST',
    body: `grant_type=refresh&refresh_token=${refreshToken}`,
    headers: {
      'Authorization': `Basic ${new Buffer(`${clientId}:${clientSecret}`).toString('base64')}`
    }
  };

  return request(options);
}

const getRecentlyPlayed = () => {
  const options = {
    url: `${spotifyAPIBaseUri}/v1/me/player/recently-played`,
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  };

  return request(options);
};
