export class Config {
    port: number = 3000
    protocol: 'http' | 'https' = 'http'
    host: string = 'localhost'

    get urlHost() {
        return `${this.protocol}://${this.host}:${this.port}` 
    }
}