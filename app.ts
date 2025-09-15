// DEPENDENCIES
import express from 'express'
import cors from 'cors'
import inquirer from 'inquirer'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'

// MODULES
import { Config } from './config.ts'

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

// CONFIG

let server: any = null

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
            "ЗАПРОС: ТЕСТ",
            "СЕРВЕР: СТАТУС",
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


        // Выключение
        case "СЕРВЕР: СТОП":
            if (server) {
                server.close(() => { console.log('\x1b[37m |!-------- СЕРВЕР: \x1b[31mОТКЛ \x1b[37m---------!| \x1b[0m'); showMenu() });
                server = null;
            } else {
                console.log("\x1b[37mСЕРВЕР: \x1b[31mОТКЛ \x1b[0m");
                showMenu()
            }
            break;

        // Отправка ключа
        case "ЗАПРОС: ТЕСТ":
            if (!server) {
                console.log("\x1b[37mСЕРВЕР: \x1b[31mОТКЛ \x1b[0m");
            } else {
                const res = await fetch("http://localhost:3000/special");
                console.log("Ответ сервера:", await res.text());
            }
            showMenu()
            break;

        case "СЕРВЕР: СТАТУС":
            console.log(`\x1b[37mСЕРВЕР: ${!server ? '\x1b[31mОТКЛ \x1b[0m' : '\x1b[32mРАБОТА \x1b[0m'}`);
            showMenu()
            break;

        case "МФИ: ЗАКРЫТ":
            process.exit();
    }
}


showMenu();



