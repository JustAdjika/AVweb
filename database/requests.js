import { DataTypes } from 'sequelize';
import sequelize from './pool.js'

const REQUESTS_TAB = sequelize.define('requests', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: { // ID пользователя 
        type: DataTypes.INTEGER,
    },
    guild: { // Организация волонтеров
        type: DataTypes.STRING,
    },
    eventId: { // ID события
        type: DataTypes.INTEGER,
    },
    days: { // Дни на которые зарегистрировался пользователь
        type: DataTypes.JSON,
    },
    status: { // Статус заявки (AWAITING, ACCEPT, DENIED)
        type: DataTypes.STRING,
    }
});

export default REQUESTS_TAB