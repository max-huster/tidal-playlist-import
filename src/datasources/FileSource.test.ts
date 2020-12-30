import {describe, it, before} from "mocha";
import {expect} from "chai";
import {FileSource} from "./FileSource";
import {Song} from "../model/Song";


/**
 * Takes in a function and checks for error
 * @param {Function} method - The function to check
 * @param {any[]} params - The array of function parameters
 * @param {string} message - Optional message to match with error message
 */
const expectThrowsAsync = async (
    method: Function,
    params: any[],
    message?: string
) => {
    let err = null;
    try {
        await method(...params);
    } catch (error) {
        err = error;
    }
    if (message) {
        expect(err.message).to.be.equal(message);
    } else {
        expect(err).to.be.an("Error");
    }
};


describe('FileSource', function () {
    let fileSource: FileSource;
    before(() => {
        fileSource = new FileSource();
    });
    it('should throw due to not existent file', function () {
        expect(async function () {
            return await fileSource.fetch("abc")
        }).to.throw;
    });
    it('should throw because file is an dir', function () {
        expect(async function () {
            return await fileSource.fetch("test/not-a-file")
        }).to.throw;
    });
    it('should throw no error', async function () {
        const data = await fileSource.fetch("test/playlist-test.txt");
        expect(data.Title).to.eq("playlist-test");
        const expectedSongs = [new Song("Dr. Alban - Sing Hallelujah", ""), new Song("Numb - Linkin Park", "")];
        expect(data.Songs).to.deep.contain(expectedSongs[0]);
        expect(data.Songs).to.deep.contain(expectedSongs[1]);
    });
});
