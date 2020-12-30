import {TidalAPI} from "tidalapi-ts";
import {MusicSearcher} from "./MusicSearcher";
import {Song} from "./model/Song";
import {InitOptions} from "./model/InitOptions";
import {TidalSearchResult} from "tidalapi-ts/lib/model/TidalSearchResult";
import {IImporter} from "./IImporter";
import {Playlist} from "./model/Playlist";
import {ProgressCallback} from "./ProgressCallback";
import {IDataSource} from "./datasources/IDataSource";
import {ProgressState} from "./ProgressState";

/*

        /Club Mix/gi,
        /Extended Mix/gi
 */

export class TidalImporter implements IImporter {
    api: TidalAPI;
    searcher: MusicSearcher;

    constructor(options: InitOptions) {
        this.searcher = new MusicSearcher(this, options.preferredSongTags);
        this.api = new TidalAPI(options.login);
    }


    async test(): Promise<void> {
        await this.api.login();
    }

    async search(query: string, limit: number = 20): Promise<Song[]> {
        return this.tidalSearchResultToSongs(await this.api.search({
            query,
            limit,
            types: 'ARTISTS,TRACKS'
        }));
    }

    private tidalSearchResultToSongs(searchResult: TidalSearchResult): Song[] {
        const list: Song[] = [];
        for (const track of searchResult.tracks.items) {
            let artistsString = track.artists.map(artist => artist.name).join(", ");
            // if more than one artist -> clean up the last ", "
            if (track.artists.length > 1)
                artistsString = artistsString.substr(0, artistsString.length - 2);
            // create new song object
            const s = new Song(track.title, artistsString);
            s.Id = track.id.toString();
            list.push(s);
        }

        return list;
    }

    public async run(source: IDataSource, url: string, progressCallback: ProgressCallback): Promise<string> {
        const data = await source.fetch(url);
        const playlist = await this.searcher.searchSongs(data, progressCallback);
        if (progressCallback) {
            progressCallback(ProgressState.Loading, `Searching for Playlist "${playlist.Title}"`, null);
        }
        const matches = await this.api.findPlaylistsByName(playlist.Title);
        let playlistId: string;
        if (matches.length === 0) {
            if (progressCallback) {
                progressCallback(ProgressState.Loading, `Creating Playlist "${playlist.Title}"`, null);
            }

            playlistId = (await this.api.createPlaylist(playlist.Title, playlist.Description));
            if (progressCallback) {
                progressCallback(ProgressState.Success, `Playlist "${playlist.Title}" created: https://listen.tidal.com/playlist/${playlistId}`, null);
            }
        }
        if (matches.length === 1) {
            playlistId = matches[0];
            if (progressCallback) {
                progressCallback(ProgressState.Success, `Playlist "${playlist.Title}" found: https://listen.tidal.com/playlist/${playlistId}`, null);
            }
        }
        if (matches.length > 1) {
            throw new Error(`More than one (${matches.length}) Playlist named "${playlist.Title}" were found!`)
        }
        if (progressCallback) {
            progressCallback(ProgressState.Loading, `Adding ${playlist.Songs.length} Tracks to Playlist "${playlist.Title}"`, null);
        }
        await this.api.addTracksToPlaylist(playlist.Songs.map(x => x.Id), playlistId);
        if (progressCallback) {
            progressCallback(ProgressState.Success, `Added ${playlist.Songs.length} Tracks to Playlist "${playlist.Title}"`, null);
        }

        return playlistId;
    }
}
