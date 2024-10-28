exports.main = async (context = {}) => {
  const { text } = context.parameters;

  const response = `Destinatarios: ${text}`;

  return response;
};
