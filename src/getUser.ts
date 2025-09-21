import { request } from './serverRequest.ts'
import { errorLogger } from './errorLogger.ts'
import Cookies from 'js-cookie'

import * as Types from '../module/types/types.ts'

type Props = {
    setErrorMessage: (message: string | null) => void
}

export const getUser = async({ setErrorMessage }: Props) => { 
    try {
        const cookie: string | undefined = Cookies.get("session")

        if(cookie) {
            const parsedSession: Types.Session = JSON.parse(cookie) 

            const res = await request({ 
                method: 'POST', 
                route: '/account/data/search', 
                loadQuery: { id: parsedSession.userId }, 
                loadData: {
                    sessionId: parsedSession.id,
                    sessionKey: parsedSession.key
                } 
            })

            if(res.status === 200) {
                const container = res.container as { data: Types.Account }
                
                return container.data
            } else errorLogger(setErrorMessage, res)
        }
    } catch (e: any) {
        const response = e.response
        errorLogger(setErrorMessage, { status: response.data.status, message: response.data.message })
    }
}