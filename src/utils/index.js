function getJson(code, message, data) {
    return {
        code: code || 200,
        message: message || '',
        data: data || {}
    }
}

module.exports = {
    getJson
}