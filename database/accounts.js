import { DataTypes } from 'sequelize';
import sequelize from './pool.js'

const ACCOUNTS_TAB = sequelize.define('accounts', {
    id: { 
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: { // ФИО пользователя
        type: DataTypes.STRING
    },
    birthday: { // ДР пользователя в формате ДД.ММ.ГГГГ
        type: DataTypes.STRING
    },
    iin: { // ИИН пользователя 
        type: DataTypes.STRING
    },
    region: { // Almaty / Astana
        type: DataTypes.STRING
    },
    email: { // почта
        type: DataTypes.STRING
    },
    password: { // Хеш пароля
        type: DataTypes.STRING
    },
    contactKaspi: { // Телефон каспи в формате +0 0000000000
        type: DataTypes.STRING
    },
    contactWhatsapp: { // Телефон ватсапп в формате +0 0000000000
        type: DataTypes.STRING
    },
    idCardId: { // ID изображения удостоверения 
        type: DataTypes.STRING
    },
    personalQrId: { // ID персонального QR кода пользователя 
        type: DataTypes.STRING
    },
    registerAt: { // Дата регистрации
        type: DataTypes.DATE
    },
    idCardConfirm: { // Подтверждение удостоверения (CONFIRM / AWAITING / UNCERTAIN)
        type: DataTypes.STRING
    },
    supervisorId: { // ID выдавшего подтверждение на удостоверение 
        type: DataTypes.INTEGER
    }
});

export default ACCOUNTS_TAB