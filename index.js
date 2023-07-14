const TelegramApi = require('node-telegram-bot-api')
const { gameOptions, againOptions } = require('./options')
const sequelize = require('./db')
const UserModel = require('./models')

const token = 'some_key'

const bot = new TelegramApi(token, { polling: true })

const chats = {}

const startGame = async (chatId) => {
    await bot.sendMessage(chatId, 'I remembered a number between 0 and 9. Try to guess it')
    const randomNumber = Math.floor(Math.random() * 10)
    chats[chatId] = randomNumber
    await bot.sendMessage(chatId, 'Lets go', gameOptions)
}

const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()
    } catch (e) {
        console.log(e)
    }
    
    bot.setMyCommands([
        { command: '/start', description: 'Welcome message' },
        { command: '/info', description: 'General Info' },
        { command: '/game', description: 'Start game' },
    ])

    bot.on('message', async msg => {
        const text = msg.text
        const chatId = msg.chat.id
        
        try {
            if (text === '/start') {
                await UserModel.create({chatId})
                return bot.sendMessage(chatId, `Welcome!!!`)
            }

            if (text === '/info') {
                const user = await UserModel.findOne({chatId})
                await bot.sendSticker(chatId, 'https://tlgrm.eu/_/stickers/711/2ce/7112ce51-3cc1-42ca-8de7-62e7525dc332/4.webp')
                return bot.sendMessage(chatId, `Your name ${msg.from.first_name} ${msg.from.last_name}, you have ${user.right} right answers and ${user.wrong} wrong answers`)
            }

            if (text === '/game') {
                startGame(chatId)
            }

            return bot.sendMessage(chatId, 'I do not understand you')
        } catch (e) {
            return bot.sendMessage(chatId, 'Something went wrong')
        }
    })

    bot.on('callback_query', async msg => {
        const data = msg.data
        const chatId = msg.message.chat.id

        if (data === '/again') {
            startGame(chatId)
        }
        const user = await UserModel.findOne({chatId})

        if (data.toString() === chats[chatId].toString()) {
            user.right += 1
             await bot.sendMessage(chatId, 'You have guessed!!! Congrats', againOptions)
        } else {
            user.wrong += 1
            await bot.sendMessage(chatId, `No. I remembered ${chats[chatId]}`, againOptions)
        }
        await user.save()
    })
}

start()
