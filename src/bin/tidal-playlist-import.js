#!/usr/bin/env node
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
const TidalImporter_1 = require("../TidalImporter");
const program = require("commander");
const AccountStorage_1 = require("./helper/AccountStorage");
const chalk = require("chalk");
const ora = require("ora");
const path = require("path");
const FileSource_1 = require("../datasources/FileSource");
const ProgressState_1 = require("../ProgressState");
const inquirer = require("inquirer");
const Spotify_1 = require("../datasources/Spotify");
const info = require(path.resolve(path.join(__dirname, "../../package.json")));
let api;
(() => __awaiter(void 0, void 0, void 0, function* () {
    const accountStorage = new AccountStorage_1.AccountStorage("tidal-playlist-import");
    const spotifyStorage = new AccountStorage_1.AccountStorage("tidal-playlist-import-spotify");
    const spotifyOAuthToken = yield spotifyStorage.get("default");
    const services = {
        "file": new FileSource_1.FileSource(),
        "spotify": new Spotify_1.Spotify(spotifyOAuthToken),
    };
    const validServicesString = Object.keys(services).join(", ");
    function login(accountToUse) {
        return __awaiter(this, void 0, void 0, function* () {
            api = new TidalImporter_1.TidalImporter({
                login: {
                    username: accountToUse.account,
                    password: accountToUse.password,
                    quality: "LOSSLESS"
                },
            });
            const loginSpinner = ora('Testing TIDAL Login').start();
            try {
                yield api.test();
                loginSpinner.succeed("TIDAL Login was successful!");
                return true;
            }
            catch (e) {
                loginSpinner.fail(`TIDAL Login was not successful: ${e.message}`);
                return false;
            }
        });
    }
    program
        .name(info.name)
        .version(info.version, "-v, --version")
        .option("-n", "--not-interactive", "no prompts")
        .option("-a", "--account", "TIDAL Account to use")
        .option("-p", "--prefer-matches <regexpattern...>", "Specify regular expressions which are used to test against the song title. If it matches it's a preferred match.")
        .option("-d", "--dj", "Recommended for DJs, Prefers Extended- and Club-Mixes (when found in the Title) ");
    program.command("set-spotify-oauth-token <token>")
        .description("Sets the OAuth Token required for Import from Spotify. Obtain it here: https://developer.spotify.com/console/get-playlist/")
        .action(function (token, cmdObj) {
        return __awaiter(this, void 0, void 0, function* () {
            yield spotifyStorage.set("default", token);
            const api = new Spotify_1.Spotify(token);
            yield api.test();
            console.log(chalk.green("Token was set successfully!"));
        });
    });
    program.command("accounts <action> [email] [password]")
        .description("Manage your TIDAL Logins. Actions: set, remove, list")
        .action(function (action, email, password, cmdObj) {
        return __awaiter(this, void 0, void 0, function* () {
            if (action === "set") {
                if ((!email || !password) && cmdObj.notInteractive) {
                    throw new Error(`--not-interactive is enabled and no email and or password is provided!`);
                }
                const result = yield promptLogin(email);
                const success = yield login(result);
                let save = success;
                if (!success && !cmdObj.notInteractive) {
                    const result = yield inquirer.prompt([
                        {
                            name: "stillSave",
                            message: "Login was not successful, do you still want to save the password?",
                            type: "confirm"
                        }
                    ]);
                    if (result["stillSave"]) {
                        save = true;
                    }
                }
                if (save) {
                    yield accountStorage.set(result.account, result.password);
                    console.log(chalk.green(`${result.account} saved!`));
                }
            }
            else if (action === "remove") {
                let usernameToRemove = email;
                const moreThanOne = (yield accountStorage.count()) > 1;
                if (!email && moreThanOne) {
                    if (cmdObj.notInteractive) {
                        throw new Error(`Please provide the account you want to remove! "${program.argv[0]} accounts remove [email]"`);
                    }
                    else {
                        const chosen = yield promptChooseLogin(yield accountStorage.list());
                        usernameToRemove = chosen.account;
                    }
                }
                const success = yield accountStorage.remove(usernameToRemove);
                if (success) {
                    console.log(chalk.green(`${usernameToRemove} removed`));
                }
                else {
                    console.error(chalk.red(`could not remove ${usernameToRemove}`));
                }
            }
            else if (action === "list") {
                const accounts = (yield accountStorage.list()).map(x => x.account).filter(x => x.trim().toLowerCase() !== "default");
                for (const account of accounts) {
                    console.log(account);
                }
            }
        });
    });
    program
        .command("import <service> <url>")
        .description("Import a playlist to your TIDAL account. Valid services are: " + validServicesString)
        .action((service, url, commandObj) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const allAccounts = (yield accountStorage.list()).filter(x => x.account !== "default");
            let accountToUse;
            const entries = allAccounts.length;
            if (entries === 0) {
                throw new Error(`You have ${entries} TIDAL accounts saved. You can add one using the "account add" command`);
            }
            if (entries === 1) {
                accountToUse = allAccounts[0];
            }
            if (entries > 1) {
                if (commandObj.notInteractive) {
                    throw new Error(`There are ${entries} TIDAL accounts saved, please specify the account you want to use with the --account option`);
                }
                accountToUse = yield promptChooseLogin(allAccounts);
            }
            const serviceId = Object.keys(services).map(x => x.toLowerCase()).find(x => x === service.toLowerCase().trim());
            if (!serviceId || !services[serviceId]) {
                throw new Error(`Unknown service "${service}"! Valid options are: ${validServicesString}`);
            }
            if (!(yield login(accountToUse))) {
                throw new Error("Tidal login was not successful!");
            }
            const importSpinner = ora("Initializing...").start();
            try {
                const dataSource = services[serviceId];
                yield api.run(dataSource, url, (state, msg, song) => {
                    if (state === ProgressState_1.ProgressState.Searching || state === ProgressState_1.ProgressState.Loading) {
                        if (!importSpinner.isSpinning)
                            importSpinner.start();
                        importSpinner.text = msg;
                    }
                    if (state === ProgressState_1.ProgressState.Success) {
                        importSpinner.succeed(msg);
                    }
                    if (state === ProgressState_1.ProgressState.NotFound) {
                        importSpinner.fail(msg);
                    }
                });
            }
            catch (e) {
                importSpinner.fail("Error: " + e.message);
            }
        }
        catch (e) {
            console.error(chalk.red("Error: " + e.message));
        }
    }));
    program.parse(process.argv);
    function promptLogin(username) {
        return __awaiter(this, void 0, void 0, function* () {
            return inquirer.prompt([
                {
                    name: "account",
                    message: "Enter TIDAL Login (Email):",
                    type: "input",
                    default: username
                },
                {
                    name: "password",
                    message: "Enter TIDAL Password:",
                    type: "password"
                }
            ]);
        });
    }
    function promptChooseLogin(accounts) {
        return __awaiter(this, void 0, void 0, function* () {
            const answers = yield inquirer.prompt([
                {
                    name: "username",
                    message: "Select TIDAL Account to use:",
                    type: "list",
                    choices: accounts.map(x => x.account)
                }
            ]);
            return {
                account: answers["username"],
                password: accounts.find(x => x.account === answers["username"]).password
            };
        });
    }
}))();
//# sourceMappingURL=tidal-playlist-import.js.map