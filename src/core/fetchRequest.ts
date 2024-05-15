const fetchGetRequest = async (
    requestUrl: string
) => {
    return fetch(requestUrl, {
        method: 'GET',
    }).then(response => {
        if (!response.ok) {
            throw new Error()
        }
        return response.text()
    }).then(xmlText => {
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml')
        return xmlDoc
    })
}

export {
    fetchGetRequest,
}