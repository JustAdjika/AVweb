import { api } from "../module/axiosConfig.ts";

import * as Types from '../../module/types/types.ts'

interface formattedQuery {
    [key: string]: string
}

export async function request(data: Types.serverRequest): Promise<Types.Response> {
    const query = data.loadQuery
    let params

    if(query) {
        Object.keys(query).forEach(key => {
            if(typeof query[key] !== 'string' && typeof query[key] !== 'number') throw new Error('serverRequest.ts error: В query можно указывать лишь string и number')
        
            query[key] = String(query[key])
        });

        params = new URLSearchParams(query as formattedQuery).toString()
    }

    let response

    switch(data.method) {
        case "GET":
            query ? 
                response = await api.get(`${data.route}?${params}`)
            : 
                response = await api.get(`${data.route}`)
            break;
        case "POST":
            query ? 
                response = await api.post(`${data.route}?${params}`, data.loadData)
            : 
                response = await api.post(`${data.route}`, data.loadData)
            break;
        case "DELETE":
            query ? 
                response = await api.delete(`${data.route}?${params}`, data.loadData)
            : 
                response = await api.delete(`${data.route}`, data.loadData)
            break;
        case "PATCH":
            query ? 
                response = await api.patch(`${data.route}?${params}`, data.loadData)
            : 
                response = await api.patch(`${data.route}`, data.loadData)
            break;
        case "PUT":
            query ? 
                response = await api.put(`${data.route}?${params}`, data.loadData)
            : 
                response = await api.put(`${data.route}`, data.loadData)
            break;
        case "OPTIONS":
            query ? 
                response = await api.options(`${data.route}?${params}`, data.loadData)
            : 
                response = await api.options(`${data.route}`, data.loadData)
            break;
        case "HEAD":
            query ? 
                response = await api.head(`${data.route}?${params}`, data.loadData)
            : 
                response = await api.head(`${data.route}`, data.loadData)
            break;
        default: response = {
            status: 500,
            message: 'serverRequest.ts: default exist'
        }
    }

    const responseData = response.data

    return responseData as Types.Response
}