import {IDataSource} from "./IDataSource";
import {Playlist} from "../model/Playlist";
import {Song} from "../model/Song";
import * as path from "path";
import * as fs from "fs";

export class FileSource implements IDataSource {
    readonly name: string = "File";

    async fetch(url: string): Promise<Playlist> {
        const fullPath = path.resolve(url);
        if (!fs.existsSync(fullPath)) {
            throw new Error(`File ${fullPath} does not exists!`);
        }
        const stat = fs.statSync(fullPath);
        if (!stat.isFile()) {
            throw new Error(`${fullPath} is not a file!`);
        }
        const title = path.basename(fullPath, path.extname(fullPath));
        const playlist = new Playlist();
        playlist.Title = title;
        playlist.Description = `Imported from ${path.basename(fullPath)} at ${new Date().toLocaleString()}`;
        playlist.Songs = this.generateSongsFromFile(fullPath);
        return playlist;
    }

    private generateSongsFromFile(file: string): Song[] {
        const lines = fs.readFileSync(file, {encoding: "utf8", flag: "r"}).split(/\r?\n/);
        const songs: Song[] = [];
        for (let i = 0; i < lines.length; i++) {
            let searchString = lines[i];
            searchString = searchString.trim();
            if (searchString == "")
                continue;
            songs.push(new Song(searchString, ""));
        }
        return songs;
    }

}
