import React, {useEffect, useState} from "react";
import {
    Button,
    Text,
    Input,
    Flex,
    hubspot, Select,
} from "@hubspot/ui-extensions";

// Define the extension to be run within the Hubspot CRM
hubspot.extend(({context, runServerlessFunction, actions}) => (
    <Extension
        context={context}
        runServerless={runServerlessFunction}
        sendAlert={actions.addAlert}
    />
));

// Define the Extension component, taking in runServerless, context, & sendAlert as props
const Extension = ({context, runServerless, sendAlert}) => {
    const [text, setText] = useState("");
    const [templates, setTemplates] = useState([{label: "Loading...", value: ""}]);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const response = await runServerless({ name: "getTemplates" });
                if (response.response.templates) {
                    setTemplates(response.response.templates);
                } else {
                    console.error("Invalid response format:", response);
                    setTemplates([{label: "Error fetching templates", value: ""}]);
                }
            } catch (error) {
                console.error("Error fetching templates:", error);
                setTemplates([]);
            }
        };
        fetchOptions();
    }, [runServerless]);

    // Call serverless function to execute with parameters.
    // The `myFunc` function name is configured inside `serverless.json`
    const handleClick = async () => {
        const {response} = await runServerless({name: "sendTemplate", parameters: {text: text}});
        sendAlert({message: response});
    };

    return (
        <>
            <Text>
                <Text format={{fontWeight: "bold"}}>
                    Integración con Chattigo. Envio de mensajes.
                </Text>
                Esta es una prueba de integración con el CRM de HubSpot.
            </Text>
            <Flex direction="row" align="end" gap="small">
                <Select
                    name="templates"
                    label="Templates"
                    options={templates}
                />
                <Input name="text" label="Destinatarios" onInput={(t) => setText(t)}/>
                <Button type="submit" onClick={handleClick}>
                    Enviar
                </Button>
            </Flex>
        </>
    );
};
