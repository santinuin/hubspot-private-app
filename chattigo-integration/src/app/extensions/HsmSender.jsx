import React, { useEffect, useState, useCallback } from "react";
import { Button, Text, Input, Flex, hubspot, Select } from "@hubspot/ui-extensions";

// Definir la extensión para ejecutarse dentro del CRM de Hubspot
hubspot.extend(({ context, runServerlessFunction, actions }) => (
    <Extension
        context={context}
        runServerless={runServerlessFunction}
        sendAlert={actions.addAlert}
    />
));

// Definir el componente Extension, tomando runServerless, context, y sendAlert como props
const Extension = ({ context, runServerless, sendAlert }) => {
    const [phoneNumbers, setPhoneNumbers] = useState("");
    const [templates, setTemplates] = useState([{ label: "Loading...", value: "" }]);
    const [selectedTemplate, setSelectedTemplate] = useState("");

    // Función para obtener las opciones de los templates
    const fetchOptions = useCallback(async () => {
        try {
            const response = await runServerless({ name: "getTemplates" });
            if (response.response.templates) {
                setTemplates(response.response.templates);
            } else {
                console.error("Invalid response format:", response);
                setTemplates([{ label: "Error fetching templates", value: "" }]);
            }
        } catch (error) {
            console.error("Error fetching templates:", error);
            setTemplates([{ label: "Error fetching templates", value: "" }]);
        }
    }, [runServerless]);

    useEffect(() => {
        fetchOptions();
    }, [fetchOptions]);

    // Función para enviar el HSM
    const sendHsm = useCallback(async () => {
        try {
            const template = templates.find(t => t.value === selectedTemplate).template;
            if (!template) {
                throw new Error("Template not found");
            }
            const { response } = await runServerless({
                name: "sendHsm",
                parameters: { phoneNumbers, template }
            });
            sendAlert({ message: "HSM enviado con éxito", type: "success" });
        } catch (error) {
            console.error("Error sending HSM:", error);
            sendAlert({ message: "Error enviando el mensaje HSM", type: "danger" });
        }
    }, [runServerless, phoneNumbers, selectedTemplate, sendAlert, templates]);

    return (
        <>
            <Text>
                <Text format={{ fontWeight: "bold" }}>
                    Integración con API Massive de Chattigo
                </Text>
                Seleccione un template y escriba los números de teléfono de los destinatarios (separados por coma) para enviar un HSM.
            </Text>
            <Flex direction="row" align="end" gap="small">
                <Select
                    name="templates"
                    label="Templates"
                    options={templates}
                    onChange={setSelectedTemplate}
                />
                <Input
                    name="destinataries"
                    label="Destinatarios"
                    onInput={(e) => setPhoneNumbers(e)}
                />
                <Button type="submit" onClick={sendHsm}>
                    Enviar
                </Button>
            </Flex>
        </>
    );
};

export default Extension;
