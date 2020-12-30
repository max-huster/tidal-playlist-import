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
const chai_1 = require("chai");
const FileSource_1 = require("./FileSource");
const Song_1 = require("../model/Song");
/**
 * Takes in a function and checks for error
 * @param {Function} method - The function to check
 * @param {any[]} params - The array of function parameters
 * @param {string} message - Optional message to match with error message
 */
const expectThrowsAsync = (method, params, message) => __awaiter(void 0, void 0, void 0, function* () {
    let err = null;
    try {
        yield method(...params);
    }
    catch (error) {
        err = error;
    }
    if (message) {
        chai_1.expect(err.message).to.be.equal(message);
    }
    else {
        chai_1.expect(err).to.be.an("Error");
    }
});
mocha_1.describe('FileSource', function () {
    let fileSource;
    mocha_1.before(() => {
        fileSource = new FileSource_1.FileSource();
    });
    mocha_1.it('should throw due to not existent file', function () {
        chai_1.expect(function () {
            return __awaiter(this, void 0, void 0, function* () {
                return yield fileSource.fetch("abc");
            });
        }).to.throw;
    });
    mocha_1.it('should throw because file is an dir', function () {
        chai_1.expect(function () {
            return __awaiter(this, void 0, void 0, function* () {
                return yield fileSource.fetch("test/not-a-file");
            });
        }).to.throw;
    });
    mocha_1.it('should throw no error', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield fileSource.fetch("test/playlist-test.txt");
            chai_1.expect(data.Title).to.eq("playlist-test");
            const expectedSongs = [new Song_1.Song("Dr. Alban - Sing Hallelujah", ""), new Song_1.Song("Numb - Linkin Park", "")];
            chai_1.expect(data.Songs).to.deep.contain(expectedSongs[0]);
            chai_1.expect(data.Songs).to.deep.contain(expectedSongs[1]);
        });
    });
});
//# sourceMappingURL=FileSource.test.js.map