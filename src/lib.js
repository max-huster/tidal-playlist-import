"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Song = exports.Playlist = exports.FileSource = exports.TidalImporter = void 0;
// main file
var TidalImporter_1 = require("./TidalImporter");
Object.defineProperty(exports, "TidalImporter", { enumerable: true, get: function () { return TidalImporter_1.TidalImporter; } });
// data sources
var FileSource_1 = require("./datasources/FileSource");
Object.defineProperty(exports, "FileSource", { enumerable: true, get: function () { return FileSource_1.FileSource; } });
// model
var Playlist_1 = require("./model/Playlist");
Object.defineProperty(exports, "Playlist", { enumerable: true, get: function () { return Playlist_1.Playlist; } });
var Song_1 = require("./model/Song");
Object.defineProperty(exports, "Song", { enumerable: true, get: function () { return Song_1.Song; } });
//# sourceMappingURL=lib.js.map