#!/bin/bash

# Leer variables del archivo JSON
CONFIG_FILE="hsconfig.json"

# Función de expect para automatizar la autenticación
auth_with_expect() {
    local personal_access_key="$1"
    local account_name="$2"

    expect <<EOF
        spawn hs auth
        expect "Open hubspot.com to copy your personal access key?" { send "y\r" }
        expect "Enter your personal access key:" { send "$personal_access_key\r" }
        expect "Enter a unique name to reference this account in the CLI:" { send "$account_name\r" }
        expect "Set this account as the default?" { send "y\r" }
        expect eof
EOF
}

# Función de expect para agregar secretos
add_secret_with_expect() {
    local secret_name="$1"
    local secret_value="$2"

    expect <<EOF
        spawn hs secrets add $secret_name
        expect "Enter a value for your secret:" { send "$secret_value\r" }
        expect eof
EOF
}

# Itera sobre cada objeto en el archivo JSON
jq -c '.[]' "$CONFIG_FILE" | while IFS= read -r ACCOUNT; do

    # Extrae los valores individuales usando jq
    PORTAL_ID=$(echo "$ACCOUNT" | jq -r '.portalId')
    PERSONAL_ACCESS_KEY=$(echo "$ACCOUNT" | jq -r '.personalAccessKey')
    ACCOUNT_NAME=$(echo "$ACCOUNT" | jq -r '.name')
    USERNAME=$(echo "$ACCOUNT" | jq -r '.username')
    PASSWORD=$(echo "$ACCOUNT" | jq -r '.password')
    DID=$(echo "$ACCOUNT" | jq -r '.did')

    # Verifica que se hayan leído correctamente los valores
    echo "Configurando para el portal: $PORTAL_ID"

    # Autenticación usando la clave de acceso personal con expect
    auth_with_expect "$PERSONAL_ACCESS_KEY" "$ACCOUNT_NAME"

    # Configura los secretos
    add_secret_with_expect "USERNAME" "$USERNAME"
    add_secret_with_expect "PASSWORD" "$PASSWORD"
    add_secret_with_expect "DID" "$DID"

    # Cambia al directorio chattigo-integration
    cd chattigo-integration

    # Sube el proyecto
    hs project upload --portal "$PORTAL_ID" --forceCreate

    # Regresa al directorio anterior
    cd -
done

