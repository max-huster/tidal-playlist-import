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
exports.MusicSearcher = void 0;
const ProgressState_1 = require("./ProgressState");
class MusicSearcher {
    constructor(importer, preferredSongTags = null, addOnlyPreferred = false) {
        this._preferredSongTags = [];
        this._importer = importer;
        this._preferredSongTags = preferredSongTags;
        this._addOnlyPreferred = addOnlyPreferred;
    }
    get importer() {
        return this._importer;
    }
    get preferredSongTags() {
        return this._preferredSongTags;
    }
    set preferredSongTags(value) {
        this._preferredSongTags = value;
    }
    static cleanUpTitle(input) {
        return input.replace(/[(\[].*/, "").trim();
    }
    static cleanUpArtist(input) {
        return input.replace(/(\sx\s|ft\.|feat\.|,\s|\s&\s|\[).*/, "").trim();
    }
    searchSongs(input, progressCallback = null) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = [];
            for (const song of input.Songs) {
                result = result.concat(yield this.searchSong(song, progressCallback));
            }
            return Object.assign(Object.assign({}, input), { Songs: result });
        });
    }
    searchSong(input, progressCallback = null) {
        return __awaiter(this, void 0, void 0, function* () {
            let searchTerm = null;
            let level = 0;
            do {
                searchTerm = this.convertToSearchString(input, level++);
                if (searchTerm == null) {
                    continue;
                }
                if (progressCallback) {
                    progressCallback(ProgressState_1.ProgressState.Searching, `Searching for: "${searchTerm}"`, null);
                }
                const result = yield this._importer.search(searchTerm, 25);
                // any match?
                if (result.length === 0) {
                    if (progressCallback) {
                        progressCallback(ProgressState_1.ProgressState.Searching, `No results for: "${searchTerm}"`, null);
                    }
                    continue;
                }
                const results = [];
                let preferredFound = false;
                for (const match of result) {
                    if (this._preferredSongTags && this._preferredSongTags.length > 0) {
                        for (const tag of this._preferredSongTags) {
                            if (tag.test(match.Title)) {
                                // preferred match was found
                                preferredFound = true;
                                if (results.indexOf(match) < 0) {
                                    results.push(match);
                                    if (progressCallback) {
                                        progressCallback(ProgressState_1.ProgressState.Success, `Preferred match was found: "${searchTerm}"`, match);
                                    }
                                }
                            }
                        }
                    }
                }
                const skip = (preferredFound && this._addOnlyPreferred);
                if (!skip) {
                    // still add the first match to the list
                    const firstMatch = result[0];
                    if (results.indexOf(firstMatch) < 0) {
                        results.push(firstMatch);
                        if (progressCallback) {
                            progressCallback(ProgressState_1.ProgressState.Success, `Song was found: ${firstMatch.toString()}`, firstMatch);
                        }
                    }
                }
                return results;
            } while (searchTerm != null);
            if (progressCallback) {
                progressCallback(ProgressState_1.ProgressState.NotFound, `No results for: ${input.toString()}!`, null);
            }
            return [];
        });
    }
    convertToSearchString(input, level) {
        switch (level) {
            case 0:
                // match exact title and artists
                return input.Artist + " " + input.Title;
            case 1:
                // match exact title and clean up artists
                return MusicSearcher.cleanUpArtist(input.Artist) + " " + input.Title;
            case 2:
                // clean up title and keep exact artists
                return input.Artist + " " + MusicSearcher.cleanUpTitle(input.Title);
            case 3:
                // clean both
                return MusicSearcher.cleanUpTitle(input.Title) + " " + MusicSearcher.cleanUpArtist(input.Artist);
        }
        return null;
    }
}
exports.MusicSearcher = MusicSearcher;
//# sourceMappingURL=MusicSearcher.js.map