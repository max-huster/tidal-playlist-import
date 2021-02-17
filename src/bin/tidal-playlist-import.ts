#!/usr/bin/env node
import {TidalImporter} from "../TidalImporter";
import * as program from "commander";
import {AccountStorage} from "./helper/AccountStorage";
import * as chalk from "chalk";
import * as ora from "ora";
import * as path from "path";
import {FileSource} from "../datasources/FileSource";
import {IDataSource} from "../datasources/IDataSource";
import {ProgressState} from "../ProgressState";
import inquirer = require('inquirer');
import {Spotify} from "../datasources/Spotify";

const info = require(path.resolve(path.join(__dirname, "../../package.json")));
let api: TidalImporter;
(async () => {
    const accountStorage = new AccountStorage("tidal-playlist-import");
    const spotifyStorage = new AccountStorage("tidal-playlist-import-spotify");
    const spotifyOAuthToken = await spotifyStorage.get("default")

    const services = {
        "file": new FileSource(),
        "spotify": new Spotify(spotifyOAuthToken),
    }
    const validServicesString = Object.keys(services).join(", ");

    async function login(accountToUse: { account: string; password: string }): Promise<boolean> {
        api = new TidalImporter({
            login: {
                username: accountToUse.account,
                password: accountToUse.password,
                quality: "LOSSLESS"
            },

        })
        const loginSpinner = ora('Testing TIDAL Login').start();
        try {
            await api.test();
            loginSpinner.succeed("TIDAL Login was successful!");
            return true;
        } catch (e) {
            loginSpinner.fail(`TIDAL Login was not successful: ${e.message}`);
            return false;
        }
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
        .action(async function (token: string, cmdObj) {
            await spotifyStorage.set("default", token);
            const api = new Spotify(token);
            await api.test();
            console.log(chalk.green("Token was set successfully!"))
        });

    program.command("accounts <action> [email] [password]")
        .description("Manage your TIDAL Logins. Actions: set, remove, list")
        .action(async function (action: string, email: string, password: string, cmdObj) {
            if (action === "set") {
                if ((!email || !password) && cmdObj.notInteractive) {
                    throw new Error(`--not-interactive is enabled and no email and or password is provided!`);
                }
                const result = await promptLogin(email);
                const success = await login(result);
                let save = success;
                if (!success && !cmdObj.notInteractive) {
                    const result = await inquirer.prompt([
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
                    await accountStorage.set(result.account, result.password);
                    console.log(chalk.green(`${result.account} saved!`));
                }

            } else if (action === "remove") {
                let usernameToRemove: string = email;
                const moreThanOne = (await accountStorage.count()) > 1;
                if (!email && moreThanOne) {
                    if (cmdObj.notInteractive) {
                        throw new Error(`Please provide the account you want to remove! "${program.argv[0]} accounts remove [email]"`)
                    } else {
                        const chosen = await promptChooseLogin(await accountStorage.list());
                        usernameToRemove = chosen.account;
                    }
                }

                const success = await accountStorage.remove(usernameToRemove);
                if (success) {
                    console.log(chalk.green(`${usernameToRemove} removed`));
                } else {
                    console.error(chalk.red(`could not remove ${usernameToRemove}`));
                }
            } else if (action === "list") {
                const accounts = (await accountStorage.list()).map(x => x.account).filter(x => x !== "default");
                for (const account of accounts) {
                    console.log(account)
                }
            }

        });
    program
        .command("import <service> <url>")
        .description("Import a playlist to your TIDAL account. Valid services are: " + validServicesString)
        .action(async (service: string, url: string, commandObj) => {
            try {

                const allAccounts = await accountStorage.list();
                let accountToUse: { account: string, password: string };
                const entries = allAccounts.length;
                if (entries === 0) {
                    throw new Error(`You have ${entries} TIDAL accounts saved. You can add one using the "account add" command`)
                }
                if (entries === 1) {
                    accountToUse = allAccounts[0];
                }
                if (entries > 1) {
                    if (commandObj.notInteractive) {
                        throw new Error(`There are ${entries} TIDAL accounts saved, please specify the account you want to use with the --account option`)
                    }
                    accountToUse = await promptChooseLogin(allAccounts)
                }
                const serviceId = Object.keys(services).map(x => x.toLowerCase()).find(x => x === service.toLowerCase().trim())
                if (!serviceId || !services[serviceId]) {
                    throw new Error(`Unknown service "${service}"! Valid options are: ${validServicesString}`)
                }

                if (!await login(accountToUse)) {
                    throw new Error("Tidal login was not successful!");
                }
                const importSpinner = ora("Initializing...").start();
                try {
                    const dataSource: IDataSource = services[serviceId];

                    await api.run(dataSource, url, (state, msg, song) => {
                        if (state === ProgressState.Searching || state === ProgressState.Loading) {
                            if (!importSpinner.isSpinning)
                                importSpinner.start();
                            importSpinner.text = msg;
                        }
                        if (state === ProgressState.Success) {
                            importSpinner.succeed(msg);
                        }
                        if (state === ProgressState.NotFound) {
                            importSpinner.fail(msg);
                        }
                    });
                } catch (e) {
                    importSpinner.fail("Error: " + e.message);
                }
            } catch (e) {
                console.error(chalk.red("Error: " + e.message));
            }
        });


    program.parse(process.argv);


    async function promptLogin(username: string): Promise<{ account: string, password: string }> {
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

    }

    async function promptChooseLogin(accounts: Array<{ account: string; password: string }>): Promise<{ account: string; password: string }> {
        const answers = await inquirer.prompt([
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
        }

    }
})();
