import {Playlist} from "../model/Playlist";

export interface IDataSource {
    readonly name: string;

    fetch(url: string): Promise<Playlist>;

    test(): Promise<void>;
}
