import { Sequelize } from 'sequelize'

//                                 БД          Логин            Пароль
const sequelize = new Sequelize('avweb', 'root', 'wcl7i2sF_)IgH2mG', {
  host: 'localhost', // Имя хоста
  dialect: 'mysql', // Диалект
  logging: false, // отключаем логирование запросов в консоль
  port: 3325, // Порт БД
});

export default sequelize;