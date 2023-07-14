const { Sequelize } = require('sequelize')

module.exports = new Sequelize(
    'telega_bot',
    'postgres',
    'admin',
    {
        host: 'localhost',
        port: '5432',
        dialect: 'postgres'
    },
)



