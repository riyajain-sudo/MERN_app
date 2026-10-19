import { useState, useCallback, useRef, useEffect } from "react"

export const useHttpClient = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState()
    const activeHttpRequests = useRef([])
    const isMounted = useRef(true)

    const sendRequest = useCallback(async (url, method = 'GET', body = null, headers = {}) => {
        const httpAbortCtrl = new AbortController()
        activeHttpRequests.current.push(httpAbortCtrl)
        if (isMounted.current) setIsLoading(true)

        try {
            const response = await fetch(url, {
                method,
                body,
                headers,
                signal: httpAbortCtrl.signal
            })
            let responseData
            try {
                responseData = await response.json()
            } catch (parseError) {
                throw new Error('The server returned an invalid response')
            }
            if (!response.ok) {
                throw new Error(responseData.message || 'The request failed')
            }
            return responseData
        } catch (err) {
            if (isMounted.current) setError(err.message || 'The request failed')
            throw err
        } finally {
            activeHttpRequests.current = activeHttpRequests.current.filter(
                requestController => requestController !== httpAbortCtrl
            )
            if (isMounted.current) {
                setIsLoading(activeHttpRequests.current.length > 0)
            }
        }
    }, [])

    const clearError = useCallback(() => {
        setError(null)
    }, [])

    useEffect(() => {
        isMounted.current = true
        return () => {
            isMounted.current = false
            activeHttpRequests.current.forEach(abortCtrl => abortCtrl.abort())
            activeHttpRequests.current = []
        }
    }, [])

    return {isLoading, error, sendRequest, clearError}
}
