export class Song {
    public Title: string;
    public Artist: string;
    public Id: string;

    constructor(Title: string, Artist: string, id:string = null) {
        this.Title = Title;
        this.Artist = Artist;
        this.Id = id;
    }

    public toString(): string {
        return this.Title + " - " + this.Artist;
    }

    public toSearchString(): string {
        return this.Title + " " + this.Artist;
    }
}
