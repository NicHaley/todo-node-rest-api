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
  console.log(123, accessToken)
  const options = {
    method: 'GET',
    uri: `${spotifyAPIBaseUri}/v1/me/player/recently-played`,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded'
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
      console.log(111);
      refreshAccessToken()
        .then(response => {
          const jsonResponse = JSON.parse(response);
          accessToken = jsonResponse["access_token"];

          getRecentlyPlayed().then(recentlyPlayedResponse => {
            // console.log(2222, recentlyPlayedResponse)
          }).catch(err => {
            console.log(333, err)
          })

            // .then(recentlyPlayedResponse => JSON.parse(recentlyPlayedResponse))
            // .then(recentlyPlayedResponseJSON => {
            //   res.send(recentlyPlayedResponseJSON);
            // })
            // .catch(() => {
            //   res.status(500).send("Failed to get recently played tracks");
            // });
        })
        .catch(err => {
          res.status(500).send("Failed to refresh Spotify token");
        });
    });
};
