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
const serviceName = "tidal-playlist-import";
class AccountStorage {
    set(username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield keytar.setPassword(serviceName, username, password);
        });
    }
    remove(username) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield keytar.deletePassword(serviceName, username);
        });
    }
    list() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield keytar.findCredentials(serviceName);
        });
    }
    count() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.list()).length;
        });
    }
}
exports.AccountStorage = AccountStorage;
//
// async function checkAccounts() {
//     const accounts = await keytar.findCredentials(serviceName);
//     if (accounts.length === 0) {
//         console.log(`You have no TIDAL Account added yet. Please call "${process.argv[0]} accounts add" to add your TIDAL login."`)
//
//     }
// }
//
// (async () => {
//     const accounts = await keytar.findCredentials(serviceName);
//     let selectedAccount: LoginInfo;
//     if (accounts.length === 0) {
//         console.log("You have no TIDAL Account added yet.")
//         const login = await newLogin();
//         await keytar.setPassword(serviceName, login.username, login.password);
//         selectedAccount = login;
//     }
//     if (accounts.length === 1) {
//         selectedAccount = {
//             username: accounts[0].account,
//             password: accounts[0].password,
//             quality: "LOSSLESS"
//         }
//     }
//     if (accounts.length > 1) {
//         const login = await chooseLogin(accounts);
//         selectedAccount = login;
//     }
//
//     await TryLogin(selectedAccount);
//
// })();
//
// async function TryLogin(selectedAccount: LoginInfo) {
//     const spinner = ora(`Signing in to ${selectedAccount.username}`).start();
//     try {
//         api = new TidalImporter({
//             login: selectedAccount,
//             preferredSongTags:
//         })
//         await api.test();
//     } catch (e) {
//
//     } finally {
//
//     }
// }
//
//
// async function newLoginInteractive(username: string): Promise<LoginInfo> {
//     const answers = await inquirer.prompt([
//         {
//             name: "username",
//             message: "Enter TIDAL Login:",
//             type: "input",
//             default: username
//         },
//         {
//             name: "password",
//             message: "Enter TIDAL Password:",
//             type: "password"
//         }
//     ]);
//     return {
//         username: answers["username"],
//         password: answers["password"],
//         quality: "LOSSLESS"
//     }
// }
//# sourceMappingURL=AccountStorage.js.map