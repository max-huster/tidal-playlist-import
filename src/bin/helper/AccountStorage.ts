import keytar = require("keytar");

export class AccountStorage {
    private readonly serviceName: string;

    constructor(serviceName:string) {
        this.serviceName = serviceName;
    }

    public async set(username: string, password: string): Promise<void> {
        return await keytar.setPassword(this.serviceName, username, password);
    }
    public async get(username: string): Promise<string> {
        return await keytar.getPassword(this.serviceName, username);
    }
    public async remove(username: string): Promise<boolean> {
        return await keytar.deletePassword(this.serviceName, username);
    }

    public async list(): Promise<{ account: string; password: string }[]> {
        return await keytar.findCredentials(this.serviceName);
    }

    public async count(): Promise<number> {
        return (await this.list()).length;
    }

}
