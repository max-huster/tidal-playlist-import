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
exports.TidalImporter = void 0;
const tidalapi_ts_1 = require("tidalapi-ts");
const MusicSearcher_1 = require("./MusicSearcher");
const Song_1 = require("./model/Song");
const ProgressState_1 = require("./ProgressState");
/*

        /Club Mix/gi,
        /Extended Mix/gi
 */
class TidalImporter {
    constructor(options) {
        this.searcher = new MusicSearcher_1.MusicSearcher(this, options.preferredSongTags);
        this.api = new tidalapi_ts_1.TidalAPI(options.login);
    }
    test() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.api.login();
        });
    }
    search(query, limit = 20) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.tidalSearchResultToSongs(yield this.api.search({
                query,
                limit,
                types: 'ARTISTS,TRACKS'
            }));
        });
    }
    tidalSearchResultToSongs(searchResult) {
        const list = [];
        for (const track of searchResult.tracks.items) {
            let artistsString = track.artists.map(artist => artist.name).join(", ");
            // if more than one artist -> clean up the last ", "
            if (track.artists.length > 1)
                artistsString = artistsString.substr(0, artistsString.length - 2);
            // create new song object
            const s = new Song_1.Song(track.title, artistsString);
            s.Id = track.id.toString();
            list.push(s);
        }
        return list;
    }
    run(source, url, progressCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield source.fetch(url);
            const playlist = yield this.searcher.searchSongs(data, progressCallback);
            if (progressCallback) {
                progressCallback(ProgressState_1.ProgressState.Loading, `Searching for Playlist "${playlist.Title}"`, null);
            }
            const matches = yield this.api.findPlaylistsByName(playlist.Title);
            let playlistId;
            if (matches.length === 0) {
                if (progressCallback) {
                    progressCallback(ProgressState_1.ProgressState.Loading, `Creating Playlist "${playlist.Title}"`, null);
                }
                playlistId = (yield this.api.createPlaylist(playlist.Title, playlist.Description));
                if (progressCallback) {
                    progressCallback(ProgressState_1.ProgressState.Success, `Playlist "${playlist.Title}" created: https://listen.tidal.com/playlist/${playlistId}`, null);
                }
            }
            if (matches.length === 1) {
                playlistId = matches[0];
                if (progressCallback) {
                    progressCallback(ProgressState_1.ProgressState.Success, `Playlist "${playlist.Title}" found: https://listen.tidal.com/playlist/${playlistId}`, null);
                }
            }
            if (matches.length > 1) {
                throw new Error(`More than one (${matches.length}) Playlist named "${playlist.Title}" were found!`);
            }
            if (progressCallback) {
                progressCallback(ProgressState_1.ProgressState.Loading, `Adding ${playlist.Songs.length} Tracks to Playlist "${playlist.Title}"`, null);
            }
            yield this.api.addTracksToPlaylist(playlist.Songs.map(x => x.Id), playlistId);
            if (progressCallback) {
                progressCallback(ProgressState_1.ProgressState.Success, `Added ${playlist.Songs.length} Tracks to Playlist "${playlist.Title}"`, null);
            }
            return playlistId;
        });
    }
}
exports.TidalImporter = TidalImporter;
//# sourceMappingURL=TidalImporter.js.map