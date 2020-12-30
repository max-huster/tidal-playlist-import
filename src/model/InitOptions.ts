import {LoginInfo} from "tidalapi-ts/lib/model/LoginInfo";

export interface InitOptions {
    login: LoginInfo,
    preferredSongTags?: RegExp[]
}
