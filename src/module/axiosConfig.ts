import axios from 'axios'
import { Config } from '../../config.ts'

const config = new Config()

const api = axios.create({ 
    baseURL: `${config.serverDomain}/api/developer`
})

export default api