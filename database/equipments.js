import { DataTypes } from 'sequelize';
import sequelize from './pool.js'

const EQUIPMENTS_TAB = sequelize.define('equipments', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    token: { // Токен QR кода пользователя
        type: DataTypes.STRING,
    },
    qrId: {
        type: DataTypes.STRING,
    },
    userId: { // ID получившего экип
        type: DataTypes.INTEGER,
    },
    providerId: { // ID выдавшего координатора
        type: DataTypes.INTEGER,
    },
    eventId: { // ID события, при котором его выдали
        type: DataTypes.INTEGER,
    },
    day: { // День в который выдали экипировку в формате ДД.ММ.ГГ
        type: DataTypes.STRING,
    },
    expiresAt: { // Дата истечения действия QR кода пользователя 
        type: DataTypes.DATE,
    },
    status: { // Статус экипировки (REQUEST - Активный QR код/ GET - Выдана экип / RETURN - Возвращена экип)
        type: DataTypes.STRING,
    }
});

export default EQUIPMENTS_TAB