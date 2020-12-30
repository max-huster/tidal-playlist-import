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
exports.FileSource = void 0;
const Playlist_1 = require("../model/Playlist");
const Song_1 = require("../model/Song");
const path = require("path");
const fs = require("fs");
class FileSource {
    constructor() {
        this.name = "File";
    }
    fetch(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const fullPath = path.resolve(url);
            if (!fs.existsSync(fullPath)) {
                throw new Error(`File ${fullPath} does not exists!`);
            }
            const stat = fs.statSync(fullPath);
            if (!stat.isFile()) {
                throw new Error(`${fullPath} is not a file!`);
            }
            const title = path.basename(fullPath, path.extname(fullPath));
            const playlist = new Playlist_1.Playlist();
            playlist.Title = title;
            playlist.Description = `Imported from ${path.basename(fullPath)} at ${new Date().toLocaleString()}`;
            playlist.Songs = this.generateSongsFromFile(fullPath);
            return playlist;
        });
    }
    generateSongsFromFile(file) {
        const lines = fs.readFileSync(file, { encoding: "utf8", flag: "r" }).split(/\r?\n/);
        const songs = [];
        for (let i = 0; i < lines.length; i++) {
            let searchString = lines[i];
            searchString = searchString.trim();
            if (searchString == "")
                continue;
            songs.push(new Song_1.Song(searchString, ""));
        }
        return songs;
    }
}
exports.FileSource = FileSource;
//# sourceMappingURL=FileSource.js.map