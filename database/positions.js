import { DataTypes } from 'sequelize';
import sequelize from './pool.js'

const POSITIONS_TAB = sequelize.define('positions', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    publicId: { // Публичный идентификатор позиции в формате POS#0-0000-0 (id события-дата ДДММ-id позиции)
        type: DataTypes.STRING,
    },
    name: { // Название позиции
        type: DataTypes.STRING,
    },
    NameNumber: { // Номер одноименной позиции
        type: DataTypes.INTEGER,
    },
    location: { // Описание локации
        type: DataTypes.STRING,
    },
    userId: { // id назначенного пользователя
        type: DataTypes.INTEGER,
    },
    eventId: { // id события
        type: DataTypes.INTEGER,
    },
    day: { // день события в формате ДД.ММ.ГГ
        type: DataTypes.STRING,
    },
    mapLocId: { // идентификатор в формате XXXXXX для позиции на схеме 
        type: DataTypes.STRING,
    },
});

export default POSITIONS_TAB