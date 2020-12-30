# tidal-playlist-import

[![Build Status](https://www.travis-ci.com/max-huster/tidal-playlist-import.svg?branch=master)](https://www.travis-ci.com/github/max-huster/tidal-playlist-import)
[![npm version](https://img.shields.io/npm/v/tidal-playlist-import.svg)](https://npmjs.org/package/tidalapi-ts)
[![npm downloads](https://img.shields.io/npm/dm/tidal-playlist-import.svg)](https://npmjs.org/package/tidal-playlist-import)
[![NPM](https://img.shields.io/npm/l/tidal-playlist-import.svg)](https://github.com/max-huster/tidal-playlist-import/blob/master/LICENSE)
[![David](https://img.shields.io/david/max-huster/tidal-playlist-import.svg)](https://david-dm.org/max-huster/tidal-playlist-import)
[![devDependencies Status](https://status.david-dm.org/gh/max-huster/tidal-playlist-import.svg?type=dev)](https://david-dm.org/max-huster/tidal-playlist-import?type=dev)

## Installation
if you are using npm:
```
npm install tidal-playlist-import
```
or if you are using yarn instead:
```
yarn add tidal-playlist-import
```

## Getting started with the Commandline
First you need to install the package described above in the section "Installation"

Then you can add your account via:
```
tidal-playlist-import accounts set
```
Here you can enter your TIDAL Login credentials. They are stored securely in your system's keychain using [keytar](https://www.npmjs.com/package/keytar).
```
? Enter TIDAL Login (Email): your@email.tld
? Enter TIDAL Password: [hidden]
√ Login was successful!
your@email.tld saved!
```

### Test it out!
```
tidal-playlist-import import file <yourfile.txt>
```

Example content of `yourfile.txt`
```
Numb - Linkin Park
Dr. Alban - Sing Hallelujah
```

## Commandline Options
```
Usage: tidal-playlist-import [options] [command]

Options:
  -v, --version                         output the version number
  -n                                    --not-interactive
  -a                                    --account
  -p                                    --prefer-matches <regexpattern...>
  -d                                    --dj
  -h, --help                            display help for command

Commands:
  accounts <action> [email] [password]  Manage your TIDAL Logins. Actions: set, remove, list
  import <service> <url>                Import a playlist to your TIDAL account. Valid services are: file
  help [command]                        display help for command
```
### Commandline Options Explained
- `-n` or `--not-interactive` Do not open any interactive dialogs
- `-d` or `--dj` Add Songs with Extended or Club mix automatically
- `-p` or `--prefer-matches` Use Regular Expressions to refine your search
