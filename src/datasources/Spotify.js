"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Spotify = void 0;
const Playlist_1 = require("../model/Playlist");
const Song_1 = require("../model/Song");
const fetch = require("node-fetch");
const _ = require("lodash");
class Spotify {
    constructor(oauthToken) {
        this.name = "Spotify";
        this.oauthToken = oauthToken;
    }
    getFromSpotify(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const headers = {
                Authorization: "Bearer " + this.oauthToken
            };
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const res = yield fetch(url, { headers });
            const jsonResponse = yield res.json();
            if (jsonResponse.error) {
                throw new Error(jsonResponse.error.message);
            }
            return jsonResponse;
        });
    }
    fetch(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const matches = /^https:\/\/open\.spotify\.com\/playlist\/([a-zA-Z0-9]{22})/g.exec(url);
            if (!matches || !matches[1]) {
                throw new Error("Invalid URL! Only Playlists are supported by now!");
            }
            const playlistId = matches[1];
            const tracks = yield this.GetTracks(playlistId);
            const info = yield this.GetPlaylistInfo(playlistId);
            const playlist = new Playlist_1.Playlist();
            playlist.Title = info.title;
            playlist.Description = info.description;
            playlist.Songs = tracks.filter(x => x.track).map(x => new Song_1.Song(x.track.name, x.track.artists.map(artist => artist === null || artist === void 0 ? void 0 : artist.name).join(", "), x.track.id));
            return playlist;
        });
    }
    GetTracks(playlistId) {
        return __awaiter(this, void 0, void 0, function* () {
            let nextUrl = null;
            const results = [];
            do {
                let url = nextUrl;
                if (!url) {
                    url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
                }
                const playlist = yield this.getFromSpotify(url);
                // console.log(playlist);
                nextUrl = playlist.next;
                results.push(playlist.items);
            } while (nextUrl);
            return _.flatten(results);
        });
    }
    test() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.oauthToken)
                throw new Error("No OAuthToken provided!");
            const me = yield this.getMe();
            console.log(`Token is valid. Using account: ${me.display_name} (${me.email})`);
        });
    }
    getMe() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getFromSpotify("https://api.spotify.com/v1/me");
        });
    }
    GetPlaylistInfo(playlistId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.getFromSpotify(`https://api.spotify.com/v1/playlists/${playlistId}?fields=description,name`);
            return {
                title: result.name,
                description: result.description
            };
        });
    }
}
exports.Spotify = Spotify;
//# sourceMappingURL=Spotify.js.map