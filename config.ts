export class Config {
    serverPort: number = 3000
    clientPort: number = 5173
    protocol: 'http' | 'https' = 'http'
    host: string = 'localhost'
    backupPath: `/${string}` = '/backup'
    cachePath: `/${string}` = '/temp'

    get serverDomain() {
        return `${this.protocol}://${this.host}:${this.serverPort}` 
    }
    get clientDomain() {
        return `${this.protocol}://${this.host}:${this.clientPort}` 
    }
}