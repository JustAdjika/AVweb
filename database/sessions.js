import { DataTypes } from 'sequelize';
import sequelize from './pool.js'

const SESSIONS_TAB = sequelize.define('sessions', {
    id: { 
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    key: { // Уникальный ключ сессии
        type: DataTypes.STRING
    },
    userId: { // id пользователя 
        type: DataTypes.INTEGER
    }
});

export default SESSIONS_TAB