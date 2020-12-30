import {MusicSearcher} from "./MusicSearcher";
import {Song} from "./model/Song";

export interface IImporter {
    searcher: MusicSearcher;

    test(): Promise<void>;

    search(query: string, limit: number): Promise<Song[]>;
}
