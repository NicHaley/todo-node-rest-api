"use strict";

const request = require('request');
const rp = require('request-promise');

const fetch = require('node-fetch');
const clientId = process.env['SPOTIFY_CLIENT_ID']
const clientSecret = process.env['SPOTIFY_CLIENT_SECRET']
const refreshToken = process.env['SPOTIFY_REFRESH_TOKEN']
let accessToken = '';

const spotifyAPIBaseUri = "https://api.spotify.com";
const spotifyAccountsBaseUri = "https://accounts.spotify.com";

const refreshAccessToken = () => {
  const options = {
    method: 'POST',
    uri: `${spotifyAccountsBaseUri}/api/token`,
    body: `grant_type=refresh_token&refresh_token=${refreshToken}`,
    headers: {
      'Authorization': `Basic ${new Buffer(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }
  return rp(options);
}

const getRecentlyPlayed = () => {
  const options = {
    method: 'GET',
    uri: `${spotifyAPIBaseUri}/v1/me/player/currently-playing`,
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }
  return rp(options);
}


exports.get_spotify = (req, res) => {
  getRecentlyPlayed()
    .then(recentlyPlayedResponse => {
      if (recentlyPlayedResponse.status >= 400 && recentlyPlayedResponse.status < 600) {
        throw new Error("Bad response from server");
      }
      return recentlyPlayedResponse.json()
    })
    .then(recentlyPlayedResponseJSON => {
      res.send(recentlyPlayedResponseJSON);
    })
    .catch(() => {
      refreshAccessToken()
        .then(response => {
          const jsonResponse = JSON.parse(response);
          accessToken = jsonResponse["access_token"];

          getRecentlyPlayed()
            .then(recentlyPlayedResponse => {
              const recentlyPlayedResponseJSON = JSON.parse(recentlyPlayedResponse);
              res.send(recentlyPlayedResponseJSON);
            })
            .catch(() => {
              res.status(500).send("Failed to get currently playing");
            });
        })
        .catch(err => {
          res.status(500).send("Failed to refresh Spotify token");
        });
    });
};
