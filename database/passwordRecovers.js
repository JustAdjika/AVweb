import { DataTypes } from 'sequelize';
import sequelize from './pool.js'

const PASSWORDRECOVERS_TAB = sequelize.define('passwordRecovers', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    token: { // Токен восстановления пароля
        type: DataTypes.STRING,
    },
    userId: { // ID самого аккаунта
        type: DataTypes.INTEGER,
    },
    expiresAt: { // Дата истечения действия токена
        type: DataTypes.DATE,
    }
});

export default PASSWORDRECOVERS_TAB