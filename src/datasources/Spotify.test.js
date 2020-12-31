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
const mocha_1 = require("mocha");
const Spotify_1 = require("./Spotify");
const oAuthToken = process.env.SPOTIFYOAUTHTOKEN;
mocha_1.describe('Spotify', function () {
    let spotify;
    mocha_1.before(function () {
        spotify = new Spotify_1.Spotify(oAuthToken);
    });
    mocha_1.it('should run test()', function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield spotify.test();
        });
    });
    mocha_1.it('should get Playlist', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const playlist = yield spotify.fetch("https://open.spotify.com/playlist/1TMcTavc7NLhINUNtoN8Pr");
            console.log(playlist);
        });
    });
});
//# sourceMappingURL=Spotify.test.js.map