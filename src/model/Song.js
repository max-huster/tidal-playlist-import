"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Song = void 0;
class Song {
    constructor(Title, Artist, id = null) {
        this.Title = Title;
        this.Artist = Artist;
        this.Id = id;
    }
    toString() {
        return this.Title + " - " + this.Artist;
    }
    toSearchString() {
        return this.Title + " " + this.Artist;
    }
}
exports.Song = Song;
//# sourceMappingURL=Song.js.map