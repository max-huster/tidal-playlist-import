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
exports.AccountStorage = void 0;
const keytar = require("keytar");
class AccountStorage {
    constructor(serviceName) {
        this.serviceName = serviceName;
    }
    set(username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield keytar.setPassword(this.serviceName, username, password);
        });
    }
    get(username) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield keytar.getPassword(this.serviceName, username);
        });
    }
    remove(username) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield keytar.deletePassword(this.serviceName, username);
        });
    }
    list() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield keytar.findCredentials(this.serviceName);
        });
    }
    count() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.list()).length;
        });
    }
}
exports.AccountStorage = AccountStorage;
//# sourceMappingURL=AccountStorage.js.map