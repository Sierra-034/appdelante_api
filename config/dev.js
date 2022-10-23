module.exports = {
    jwt: {
        secreto: process.env.SECRET_KEY,
        tiempoDeExpiracion: '24h',
    }
}