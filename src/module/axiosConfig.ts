import axios from 'axios'
import { Config } from '../../config.ts'

const config = new Config()

export const api = axios.create({ 
    baseURL: `${config.serverDomain}/api/developer`,
})

export const downloadApi = axios.create({
    baseURL: `${config.serverDomain}/api/developer`,
    responseType: "blob"
})