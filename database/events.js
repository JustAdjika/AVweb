import { DataTypes } from 'sequelize';
import sequelize from './pool.js'

const EVENTS_TAB = sequelize.define('events', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: { // Название события
        type: DataTypes.STRING,
    },
    info: { // Стандартная общая информация события
        type: DataTypes.JSON,
    },
    uniqueInfo: { // Уникальная информация для определенного события
        type: DataTypes.JSON,
    },
    guilds: { // Учавствующие организации волонтеров
        type: DataTypes.JSON,
    },
    days: { // Дни регистраций
        type: DataTypes.JSON,
    },
    isRegisterOpen: { // Открыта ли регистрация
        type: DataTypes.BOOLEAN,
    }
});

export default EVENTS_TAB