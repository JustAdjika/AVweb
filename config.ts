export class Config {
    port: number = 3000
    protocol: 'http' | 'https' = 'http'
    host: string = 'localhost'
    backupPath: `/${string}` = '/backup'
    cachePath: `/${string}` = '/temp'

    get urlHost() {
        return `${this.protocol}://${this.host}:${this.port}` 
    }
}