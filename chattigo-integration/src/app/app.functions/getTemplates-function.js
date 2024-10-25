const axios = require('axios');
const jwt = require('jsonwebtoken');

exports.main = async (context = {}) => {
    try {
        //const { USERNAME, PASSWORD } = context.secrets;

        // Obtener el token de autenticación
        const loginResponse = await axios.post('https://condor-dev.chattigo.com/api-massive/message/login', {
            username: process.env.USERNAME,
            password: process.env.PASSWORD
        });

        const token = loginResponse.data.access_token;

        const decoded = jwt.decode(token);
        const idClient = decoded.idClient;

        const response = await axios.get(`https://condor-dev.chattigo.com/api-massive/message/templates/client_id/${idClient}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log("response: ", response.data);

        const templates = response.data.data.map(template => ({
            value: template.name,
            label: template.name
        }));

        return {templates};
    } catch (error) {
        console.error('Error fetching options:', error);
        return {templates: []};
    }
};
