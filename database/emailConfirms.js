import { DataTypes } from 'sequelize';
import sequelize from './pool.js'

const EMAILCONFIRMS_TAB = sequelize.define('emailConfirms', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    token: { // Токен подтверждения почты
        type: DataTypes.STRING,
    },
    code: { // Код подтверждения в формате XXXXXX
        type: DataTypes.STRING,
    },
    expiresAt: { // Дата истечения срока действия токена
        type: DataTypes.DATE,
    },
    enteredData: { // Вводные данные при регистрации 
        type: DataTypes.JSON
    },
    isRegister: { // Регистрация или смена почты
        type: DataTypes.BOOLEAN
    }
});

export default EMAILCONFIRMS_TAB