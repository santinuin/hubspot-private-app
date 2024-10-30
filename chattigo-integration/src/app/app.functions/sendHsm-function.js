const axios = require('axios');

exports.main = async (context = {}) => {
    const { phoneNumbers, template } = context.parameters;

    console.log("Template:", template);

    // Obtener el token de autenticación
    const loginResponse = await axios.post('https://condor-dev.chattigo.com/api-massive/message/login', {
        username: process.env.USERNAME,
        password: process.env.PASSWORD
    });

    const token = loginResponse.data.access_token;

    // Procesar los destinos
    const destinations = phoneNumbers.split(',').map(number => ({
        destination: number.trim()
    }));

    // Crear el objeto inboundData
    const inboundData = JSON.stringify({
        did: "56935387065",
        type: "template",
        channel: "WHATSAPP",
        campaign: 2246,
        hsm: {
            destinations: destinations,
            template: template,
            languageCode: "es",
            botAttention: false
        }
    });
    console.log('inboundData:', inboundData);

    // Enviar la solicitud POST al endpoint
    try {
        const response = await axios.post('https://condor-dev.chattigo.com/api-massive/message/inbound', inboundData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        return { response: response.data };
    } catch (error) {
        console.error('Error sending inbound message:', error);
        return { response: 'Error sending inbound message' };
    }
};
