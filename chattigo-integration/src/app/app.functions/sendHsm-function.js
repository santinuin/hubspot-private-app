const axios = require('axios');

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

// Función para enviar el mensaje HSM
async function sendHsmMessage(token, phoneNumbers, template) {
    const destinations = phoneNumbers.split(',').map(number => ({
        destination: number.trim()
    }));

    const inboundData = JSON.stringify({
        did: template.channelDid,
        type: "template",
        channel: template.channelType,
        campaign: template.campaignId,
        hsm: {
            destinations: destinations,
            template: template.name,
            languageCode: "es",
            botAttention: false
        }
    });

    try {
        const response = await axios.post('https://condor-dev.chattigo.com/api-massive/message/inbound', inboundData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error enviando el mensaje HSM:', error);
        throw new Error('Error enviando el mensaje HSM');
    }
}

exports.main = async (context = {}) => {
    try {
        const { phoneNumbers, template } = context.parameters;
        const token = await getAuthToken();
        const response = await sendHsmMessage(token, phoneNumbers, template);
        return { response };
    } catch (error) {
        console.error('Error en la función principal:', error);
        return { response: 'Error enviando el mensaje HSM' };
    }
};
