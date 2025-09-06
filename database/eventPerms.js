import { DataTypes } from 'sequelize';
import sequelize from './pool.js'

const EVENTPERMS_TAB = sequelize.define('eventPerms', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: { // ID пользователя 
        type: DataTypes.INTEGER,
    },
    eventId: { // ID события
        type: DataTypes.INTEGER,
    },
    day: { // День события в формате ДД.ММ.ГГ
        type: DataTypes.STRING,
    },
    permission: { // Роль прав (CRD/HCRD)
        type: DataTypes.STRING,
    },
    preceptorId: { // ID выдавшего роль / MASTERKEY (если был использован)
        type: DataTypes.STRING,
    }
});

export default EVENTPERMS_TAB