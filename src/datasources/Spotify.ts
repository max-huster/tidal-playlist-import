import {IDataSource} from "./IDataSource";
import {Playlist} from "../model/Playlist";
import {Song} from "../model/Song";
import fetch = require("node-fetch");
import * as _ from "lodash";

export class Spotify implements IDataSource {
    private readonly oauthToken: string;

    constructor(oauthToken: string) {
        this.oauthToken = oauthToken;
    }

    readonly name: string = "Spotify";


    private async getFromSpotify(url): Promise<any> {
        const headers = {
            Authorization: "Bearer " + this.oauthToken
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const res = await fetch(url, {headers});
        return await res.json();
    }

    async fetch(url: string): Promise<Playlist> {
        const matches = /^https:\/\/open\.spotify\.com\/playlist\/([a-zA-Z0-9]{22})/g.exec(url);
        const playlistId: string = matches[1];
        if (!playlistId) {
            throw new Error("Invalid URL! Only Playlists are supported by now!");
        }
        const tracks = await this.GetTracks(playlistId);
        const info = await this.GetPlaylistInfo(playlistId);

        const playlist = new Playlist();
        playlist.Title = info.title;
        playlist.Description = info.description;

        playlist.Songs = tracks.map(x => new Song(x.track.name, x.track.artists.map(artist => artist.name).join(", "), x.track.id))
        return playlist;
    }

    private async GetTracks(playlistId: string): Promise<any[]> {
        let nextUrl: string = null;
        const results = [];
        do {

            let url = nextUrl;
            if (!url) {
                url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
            }
            const playlist = await this.getFromSpotify(url);
            // console.log(playlist);

            nextUrl = playlist.next;
            results.push(playlist.items);
        }
        while (nextUrl);
        return _.flatten(results);
    }

    async test(): Promise<void> {
        if (!this.oauthToken)
            throw new Error("No OAuthToken provided!");
        const me: any = await this.getMe();
        console.log(`Token is valid. Using account: ${me.display_name} (${me.email})`)
    }

    private async getMe(): Promise<unknown> {
        return await this.getFromSpotify("https://api.spotify.com/v1/me");
    }

    private async GetPlaylistInfo(playlistId: string): Promise<{ title: string, description: string }> {
        const result = await this.getFromSpotify(`https://api.spotify.com/v1/playlists/${playlistId}?fields=description,name`);
        return {
            title: result.name,
            description: result.description
        }

    }
}
