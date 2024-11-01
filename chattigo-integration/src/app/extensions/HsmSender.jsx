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
    const [templateVariables, setTemplateVariables] = useState([]);
    const [variableValues, setVariableValues] = useState({});

    // Función para obtener las opciones de los templates
    const fetchOptions = useCallback(async () => {
        try {
            const response = await runServerless({ name: "getTemplates" });
            if (response.response.templates) {
                setTemplates(response.response.templates);
            } else {
                console.error("Respuesta inválida:", response);
                setTemplates([{ label: "Error al obtener los templates", value: "" }]);
            }
        } catch (error) {
            console.error("Error al obtener los templates:", error);
            setTemplates([{ label: "Error al obtener los templates", value: "" }]);
        }
    }, [runServerless]);

    useEffect(() => {
        fetchOptions();
    }, [fetchOptions]);

    // Función para detectar variables en el template seleccionado
    const detectTemplateVariables = (template) => {
        const variablePattern = /\{\{(\d+)\}\}/g;
        const variables = [];
        let match;
        while ((match = variablePattern.exec(template)) !== null) {
            variables.push(match[1]);
        }
        return variables;
    };

    // Manejar el cambio de template seleccionado
    const handleTemplateChange = (value) => {
        const selected = templates.find(t => t.value === value);
        setSelectedTemplate(selected);
        console.log(selected);
        if (selected) {
            const variables = detectTemplateVariables(selected.template.template);
            setTemplateVariables(variables);
            setVariableValues(variables.reduce((acc, variable) => {
                acc[variable] = "";
                return acc;
            }, {}));
        } else {
            setTemplateVariables([]);
            setVariableValues({});
        }
    };

    // Manejar el cambio de valor de las variables
    const handleVariableChange = (variable, value) => {
        setVariableValues(prevValues => ({
            ...prevValues,
            [variable]: value
        }));
    };

// Función para enviar el HSM
    const sendHsm = useCallback(async () => {
        try {
            const template = templates.find(t => t.value === selectedTemplate.value).template;
            if (!template) {
                throw new Error("Template no encontrado");
            }
            const { response } = await runServerless({
                name: "sendHsm",
                parameters: { phoneNumbers, template, variableValues }
            });
            sendAlert({ message: "HSM enviado con éxito", type: "success" });
        } catch (error) {
            console.error("Error enviando el mensaje HSM:", error);
            sendAlert({ message: "Error enviando el mensaje HSM", type: "danger" });
        }
    }, [runServerless, phoneNumbers, selectedTemplate, sendAlert, templates, variableValues]);

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
                    onChange={(value) => handleTemplateChange(value)}
                />
                <Input
                    name="destinataries"
                    label="Destinatarios"
                    onInput={(e) => setPhoneNumbers(e)}
                />
                {templateVariables.map(variable => (
                    <Input
                        key={variable}
                        name={`variable-${variable}`}
                        label={`Variable ${variable}`}
                        onInput={(e) => handleVariableChange(variable, e)}
                    />
                ))}
                <Button type="submit" onClick={sendHsm}>
                    Enviar
                </Button>
            </Flex>
        </>
    );
};

export default Extension;
