import * as Types from '../../module/types/types.ts'

export function errorLogger(setErrorMessage: (message: string | null) => void, responseData: Types.Response) {
    const message = `Ошибка ${responseData.status}: ${responseData.message}` 
    console.error(message)
    setErrorMessage(message)
    setTimeout(() => setErrorMessage(null), 3000)
}