import { DataTypes } from 'sequelize';
import sequelize from './pool.js'

const CHANGEPASSWORDS_TAB = sequelize.define('changePasswords', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    token: { // Токен восстановления пароля
        type: DataTypes.STRING,
    },
    userId: { // ID аккаунта
        type: DataTypes.INTEGER,
    },
    newPassword: { // Новый пароль аккаунта
        type: DataTypes.STRING,
    },
    expiresAt: { // Истечение действия токена восстановления пароля
        type: DataTypes.DATE,
    }
});

export default CHANGEPASSWORDS_TAB