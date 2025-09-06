import { DataTypes } from 'sequelize';
import sequelize from './pool.js'

const VOLUNTEERS_TAB = sequelize.define('volunteers', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: { // id назначенного пользователя
        type: DataTypes.INTEGER,
    },
    guild: { // Организация волонтера (AV / JAS / AJ)
        type: DataTypes.STRING,
    },
    visit: { // Явился или нет
        type: DataTypes.BOOLEAN,
    },
    late: { // Опоздал или нет
        type: DataTypes.BOOLEAN,
    },
    eventId: { // id события
        type: DataTypes.INTEGER,
    },
    day: { // день события в формате ДД.ММ.ГГ
        type: DataTypes.STRING,
    },
    warning: { // Есть ли предупреждение
        type: DataTypes.BOOLEAN,
    },
    inStaffRoom: { // В штабе или нет
        type: DataTypes.BOOLEAN,
    }
});

export default VOLUNTEERS_TAB