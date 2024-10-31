const axios = require('axios');
const jwt = require('jsonwebtoken');

// Función para obtener el token de autenticación
async function getAuthToken() {
    try {
        const response = await axios.post('https://condor-dev.chattigo.com/api-massive/message/login', {
            username: process.env.USERNAME,
            password: process.env.PASSWORD
        });
        return response.data.access_token;
    } catch (error) {
        console.error('Error obteniendo el token de autenticación:', error);
        throw new Error('Error de autenticación');
    }
}

// Función para obtener las plantillas
async function fetchTemplates(token) {
    try {
        const decoded = jwt.decode(token);
        const idClient = decoded.idClient;

        const response = await axios.get(`https://condor-dev.chattigo.com/api-massive/message/templates/client_id/${idClient}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return response.data.data.map(template => ({
            value: template.name,
            label: template.name
        }));
    } catch (error) {
        console.error('Error obteniendo las plantillas:', error);
        throw new Error('Error obteniendo las plantillas');
    }
}

exports.main = async (context = {}) => {
    try {
        const token = await getAuthToken();
        const templates = await fetchTemplates(token);
        return { templates };
    } catch (error) {
        console.error('Error en la función principal:', error);
        return { templates: [] };
    }
};
