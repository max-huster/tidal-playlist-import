# tidal-playlist-import

## Installation
if you are using npm:
```
npm install tidal-playlist-import
```
or if you are using yarn instead:
```
yarn add tidal-playlist-import
```

## Commandline

### Getting started
First you need to install the package described above in section "Installation"

Then you can add your account via:
```shell
tidal-playlist-import accounts set
```
Here you can enter your TIDAL Login credentials. They are stored securely in your system's keychain using [keytar](https://www.npmjs.com/package/keytar).
```
? Enter TIDAL Login (Email): your@email.tld
? Enter TIDAL Password: [hidden]
√ Login was successful!
your@email.tld saved!
```
