import {describe, it, before} from "mocha";
import {Spotify} from "./Spotify";

const oAuthToken = process.env.SPOTIFYOAUTHTOKEN;

describe('Spotify', function () {

    let spotify: Spotify;
    before(function () {
        spotify = new Spotify(oAuthToken);
    })
    it('should run test()', async function () {
        await spotify.test();
    });
    it('should get Playlist', async function () {
        const playlist = await spotify.fetch("https://open.spotify.com/playlist/1TMcTavc7NLhINUNtoN8Pr");
        console.log(playlist);
    });
});
