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
async function sendHsmMessage(token, phoneNumbers, template, variableValues) {
    const destinations = phoneNumbers.split(',').map(number => ({
        destination: number.trim(),
        parameters: variableValues ? Object.values(variableValues) : []
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

    console.log('Inbound data:', inboundData);

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
        const { phoneNumbers, template, variableValues } = context.parameters;
        const token = await getAuthToken();
        const response = await sendHsmMessage(token, phoneNumbers, template, variableValues);
        return { response };
    } catch (error) {
        console.error('Error en la función principal:', error);
        return { response: 'Error enviando el mensaje HSM' };
    }
};
