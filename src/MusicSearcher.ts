import {Song} from "./model/Song";
import {IImporter} from "./IImporter";
import {ProgressCallback} from "./ProgressCallback";
import {ProgressState} from "./ProgressState";
import {Playlist} from "./model/Playlist";

export class MusicSearcher {
    private readonly _importer: IImporter;
    private _addOnlyPreferred: boolean;

    constructor(importer: IImporter, preferredSongTags: RegExp[] = null, addOnlyPreferred: boolean = false) {
        this._importer = importer;
        this._preferredSongTags = preferredSongTags;
        this._addOnlyPreferred = addOnlyPreferred;
    }

    get importer(): IImporter {
        return this._importer;
    }

    private _preferredSongTags: RegExp[] = [];

    get preferredSongTags(): RegExp[] {
        return this._preferredSongTags;
    }

    set preferredSongTags(value: RegExp[]) {
        this._preferredSongTags = value;
    }

    public static cleanUpTitle(input: string): string {
        return input.replace(/[(\[].*/, "").trim();
    }

    public static cleanUpArtist(input: string): string {
        return input.replace(/(\sx\s|ft\.|feat\.|,\s|\s&\s|\[).*/, "").trim()
    }


    public async searchSongs(input: Playlist, progressCallback: ProgressCallback = null): Promise<Playlist> {
        let result = [];
        for (const song of input.Songs) {
            result = result.concat(await this.searchSong(song, progressCallback));
        }
        return {
            ...input,
            Songs: result
        };
    }
    public async searchSong(input: Song, progressCallback: ProgressCallback = null): Promise<Song[]> {
        let searchTerm = null;
        let level = 0;
        do {
            searchTerm = this.convertToSearchString(input, level++);
            if (searchTerm == null) {
                continue;
            }
            if (progressCallback) {
                progressCallback(ProgressState.Searching, `Searching for: "${searchTerm}"`, null);
            }
            const result: Song[] = await this._importer.search(searchTerm, 25);

            // any match?
            if (result.length === 0) {
                if (progressCallback) {
                    progressCallback(ProgressState.Searching, `No results for: "${searchTerm}"`, null);
                }
                continue;
            }
            const results: Song[] = [];

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
                                    progressCallback(ProgressState.Success, `Preferred match was found: "${searchTerm}"`, match);
                                }
                            }
                        }
                    }
                }
            }
            const skip = (preferredFound && this._addOnlyPreferred);
            if (!skip) {
                // still add the first match to the list
                const firstMatch: Song = result[0];

                if (results.indexOf(firstMatch) < 0) {
                    results.push(firstMatch);
                    if (progressCallback) {
                        progressCallback(ProgressState.Success, `Song was found: ${firstMatch.toString()}`, firstMatch);
                    }
                }
            }

            return results;
        } while (searchTerm != null);
        if (progressCallback) {
            progressCallback(ProgressState.NotFound, `No results for: ${input.toString()}!`, null);
        }
        return [];
    }

    private convertToSearchString(input: Song, level: number): string {
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
