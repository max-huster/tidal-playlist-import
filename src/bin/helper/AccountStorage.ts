import {LoginInfo} from "tidalapi-ts/lib/model/LoginInfo";
import {TidalImporter} from "../../TidalImporter";
import keytar = require("keytar");

const serviceName = "tidal-playlist-import";

export class AccountStorage {
    public async set(username, password): Promise<void> {
        return await keytar.setPassword(serviceName, username, password);
    }

    public async remove(username): Promise<boolean> {
        return await keytar.deletePassword(serviceName, username);
    }

    public async list(): Promise<{ account: string; password: string }[]> {
        return await keytar.findCredentials(serviceName);
    }

    public async count(): Promise<number> {
        return (await this.list()).length;
    }

}

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
