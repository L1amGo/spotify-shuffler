const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const spotifyWebApi = require('spotify-web-api-node');

const app = express();
app.use(cors());
app.use(bodyParser.json());

# Client Secret @ https://developer.spotify.com/dashboard/2136706f70154b709bd7e932406f1e74/settings

app.post('/refresh', (req, res) => {
    const refreshToken = req.body.refreshToken;
    const spotifyApi = new spotifyWebApi({
        redirectUri: 'http://localhost:3000',
        clientId: '2136706f70154b709bd7e932406f1e74',
        clientSecret: '',
        refreshToken
    })
    spotifyApi.refreshAccessToken().then(
        (data) => {
          console.log(data.body)
        }).catch(() => {
            res.sendStatus(400)
        })
})

app.post('/login', (req, res) => {
    const code = req.body.code;
    const spotifyApi = new spotifyWebApi({
        redirectUri: 'http://localhost:3000',
        clientId: '2136706f70154b709bd7e932406f1e74',
        clientSecret: ''
    })

    spotifyApi.authorizationCodeGrant(code).then(data => {
        const accessToken = data.body.access_token;
        const refreshToken = data.body.refresh_token;
        res.json({
            accessToken,
            refreshToken,
            expiresIn: data.body.expires_in,
        })
    })
    .catch((err) => {
        console.log(err)
        res.sendStatus(400)
    })
})

app.listen(3001, () => {
    console.log('Listening on port 3001')
})
