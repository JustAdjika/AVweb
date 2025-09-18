// DEPENDENCIES
import express from 'express'
import cors from 'cors'
import inquirer from 'inquirer'
import dotenv from 'dotenv'
import cron from 'node-cron'
import crypto from 'crypto'
import axios from 'axios'

// MODULES
import { Config } from './config.ts'
import { GetDateInfo } from './module/formattingDate.ts'
import * as Types from './module/types/types.ts'

// DATABASE
import sequelize from './database/pool.js'
import ACCOUNTS_TAB from './database/accounts.js'
import BLACKLISTS_TAB from './database/blacklists.js'
import CHANGEPASSWORDS_TAB from './database/changePasswords.js'
import EMAILCONFIRMS_TAB from './database/emailConfirms.js'
import EQUIPMENTS_TAB from './database/equipments.js'
import EVENTPERMS_TAB from './database/eventPerms.js'
import EVENTS_TAB from './database/events.js'
import MASTERKEYS_TAB from './database/masterKeys.js'
import PASSWORDRECOVERS_TAB from './database/passwordRecovers.js'
import PERMS_TAB from './database/perms.js'
import POSITIONS_TAB from './database/positions.js'
import REQUESTBLACKLISTS_TAB from './database/requestBlacklists.js'
import REQUESTS_TAB from './database/requests.js'
import VOLUNTEERS_TAB from './database/volunteers.js'
import AVSTAFFS_TAB from './database/avstaffs.js'
import SESSIONS_TAB from './database/sessions.js'
import GROUPLINKS_TAB from './database/groupLinks.js'

// ROUTERS
import accountRouter from './router/accountRouter.ts'
import formsRouter from './router/formsRouter.ts'
import eventRouter from './router/eventRouter.ts'
import eventRequestRouter from './router/eventRequestRouter.ts'
import volunteerRouter from './router/volunteerRouter.ts'
import positionRouter from './router/positionRouter.ts'
import equipmentRouter from './router/equipmentRouter.ts'
import measuresRouter from './router/measuresRouter.ts' 
import permsRouter from './router/permsRouter.ts'

// CONFIG

let server: any = null
let task: any = null

function generateKey(): string {
    return crypto.randomBytes(64).toString('hex')
}

async function saveKey() {
    const key = generateKey()
    const expiresAt = new Date(Date.now() + 6*60*60*1000)

    const lastKey = await MASTERKEYS_TAB.findOne({ order: [['createdAt', 'DESC']] })

    if(lastKey) {
        const lastKeyModel: Types.MasterKey = lastKey.get({ plain: true })
        const now = new Date()

        if(lastKeyModel.expiresAt > now) await lastKey.destroy()
    }

    await MASTERKEYS_TAB.create({ 
        key,
        expiresAt
    })

    console.log(`[${GetDateInfo().all}] Node-cron process: Сгенерирован новый MASTERKEY`)
}

async function showMenu() {
    console.log("TTY:", process.stdin.isTTY ? '\x1b[32mРАБОТА\x1b[0m' : '\x1b[31mОШИБКА \x1b[0m');
    const answer = await inquirer.prompt([
        {
        type: "list",
        name: "action",
        message: "Выберите действие:",
        choices: [
            "СЕРВЕР: ЗАПУСК",
            "СЕРВЕР: СТОП",
            "СЕРВЕР: СТАТУС",
            "СЕРВЕР: ПЕРЕЗАПУСК",
            "КЛЮЧ: ЗАПРОС",
            "КЛЮЧ: ОЧИСТИТЬ",
            "МФИ: ЗАКРЫТЬ"
        ],
        },
    ]);

    switch (answer.action) {

        // Запуск
        case "СЕРВЕР: ЗАПУСК":
            if (server) {
                console.log("\x1b[33mВНИМАНИЕ! СЕРВЕР УЖЕ В \x1b[32mРАБОТЕ\x1b[0m");
                showMenu()
            } else {
                const config = new Config()
                const app = express()

                app.use(cors())
                app.use(express.json())

                const startServer = async () => {
                    try {
                        console.log('\x1b[37m================\x1b[0m')
                        console.log(' ')
                        
                        console.log('\x1b[33mСоздание таблиц\x1b[0m')
                        
                        await sequelize.sync({ alter: true })
                        
                        console.log('\x1b[33mТаблицы успешно созданы!\x1b[0m')
                        dotenv.config()

                        server = app.listen(config.serverPort, '0.0.0.0', () => {
                            app.use('/api/developer/account', accountRouter)
                            app.use('/api/developer/forms', formsRouter)
                            app.use('/api/developer/event', eventRouter)
                            app.use('/api/developer/event/request', eventRequestRouter)
                            app.use('/api/developer/event/volunteer', volunteerRouter)
                            app.use('/api/developer/event/position', positionRouter)
                            app.use('/api/developer/event/equipment', equipmentRouter)
                            app.use('/api/developer/measure', measuresRouter)
                            app.use('/api/developer/perms', permsRouter)

                            task = cron.schedule("0 */6 * * *", saveKey)

                            saveKey()

                            console.log('\x1b[37m |!-------- СЕРВЕР: \x1b[32mРАБОТА \x1b[37m-------!| \x1b[0m');
                            showMenu();
                        });
                    } catch (e:any) {
                        console.log('\x1b[37m |!-------- СЕРВЕР: \x1b[31mОТКЛ \x1b[37m---------!| \x1b[0m');
                        console.error(`\x1b[37mОшибка сервера: \x1b[31m${e.message}\x1b[0m`)
                        showMenu()
                    }
                }

                startServer()
        }
        break;

        
        // Перезапуск
        case "СЕРВЕР: ПЕРЕЗАПУСК":
            console.log("\x1b[33mПерезапуск сервера\x1b[0m");

            server = null

            const config = new Config()
            const app = express()

            app.use(cors())
            app.use(express.json())

            const startServer = async () => {
                try {
                    console.log('\x1b[37m================\x1b[0m')
                    console.log(' ')
                    
                    console.log('\x1b[33mСоздание таблиц\x1b[0m')
                    
                    await sequelize.sync({ alter: true })
                    
                    console.log('\x1b[33mТаблицы успешно созданы!\x1b[0m')
                    dotenv.config()

                    server = app.listen(config.serverPort, '0.0.0.0', () => {
                        app.use('/api/developer/account', accountRouter)
                        app.use('/api/developer/forms', formsRouter)
                        app.use('/api/developer/event', eventRouter)
                        app.use('/api/developer/event/request', eventRequestRouter)
                        app.use('/api/developer/event/volunteer', volunteerRouter)
                        app.use('/api/developer/event/position', positionRouter)
                        app.use('/api/developer/event/equipment', equipmentRouter)
                        app.use('/api/developer/measure', measuresRouter)
                        app.use('/api/developer/perms', permsRouter)

                        task = cron.schedule("0 */6 * * *", saveKey)

                        saveKey()

                        console.log('\x1b[37m |!-------- СЕРВЕР: \x1b[32mРАБОТА \x1b[37m-------!| \x1b[0m');
                        showMenu();
                    });
                } catch (e:any) {
                    console.log('\x1b[37m |!-------- СЕРВЕР: \x1b[31mОТКЛ \x1b[37m---------!| \x1b[0m');
                    console.error(`\x1b[37mОшибка сервера: \x1b[31m${e.message}\x1b[0m`)
                    showMenu()
                }
            }

            startServer()
        break;


        // Выключение
        case "СЕРВЕР: СТОП":
            if (server) {
                server.close(() => { console.log('\x1b[37m |!-------- СЕРВЕР: \x1b[31mОТКЛ \x1b[37m---------!| \x1b[0m'); showMenu() });
                server = null;
                task.destroy()
            } else {
                console.log("\x1b[37mСЕРВЕР: \x1b[31mОТКЛ \x1b[0m");
                showMenu()
            }
            break;

        // Отправка ключа
        case "КЛЮЧ: ЗАПРОС":
            if (!server) {
                console.log("\x1b[37mСЕРВЕР: \x1b[31mОТКЛ \x1b[0m");
            } else {
                const config = new Config()
                axios.get(`${config.serverDomain}/api/developer/perms/masterKey?password=${process.env.GET_MASTERKEY_PASSWORD}`)
            }
            showMenu()
            break;

        // Очистка списка клюей
        case "КЛЮЧ: ОЧИСТИТЬ":
            if (!server) {
                console.log("\x1b[37mСЕРВЕР: \x1b[31mОТКЛ \x1b[0m");
            } else {
                const config = new Config()
                axios.delete(`${config.serverDomain}/api/developer/perms/masterKey/clear?password=${process.env.GET_MASTERKEY_PASSWORD}`)
            }
            showMenu()
            break;

        // Статус сервера
        case "СЕРВЕР: СТАТУС":
            console.log(`\x1b[37mСЕРВЕР: ${!server ? '\x1b[31mОТКЛ \x1b[0m' : '\x1b[32mРАБОТА \x1b[0m'}`);
            showMenu()
            break;

        // Закрыть меню
        case "МФИ: ЗАКРЫТ":
            server = null;
            task.destroy()
            process.exit();
    }
}


showMenu();



