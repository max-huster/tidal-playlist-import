import {Song} from "./Song";

export class Playlist {
    public Title: string;
    public Description: string;
    public Songs: Song[];
    constructor(){
        this.Songs = [];
    }
}