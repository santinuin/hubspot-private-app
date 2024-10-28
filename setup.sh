#!/bin/bash

# Leer variables del archivo JSON
CONFIG_FILE="hsconfig.json"
ACCOUNTS=$(jq -c '.[]' $CONFIG_FILE)

# Iterar sobre cada cuenta
for ACCOUNT in $ACCOUNTS; do
  PORTAL_ID=$(echo $ACCOUNT | jq -r '.portalId')
  ACCESS_TOKEN=$(echo $ACCOUNT | jq -r '.accessToken')
  PERSONAL_ACCESS_KEY=$(echo $ACCOUNT | jq -r '.personalAccessKey')
  USERNAME=$(echo $ACCOUNT | jq -r '.username')
  PASSWORD=$(echo $ACCOUNT | jq -r '.password')

  # Configurar el portal en HubSpot CLI
  hs auth personalaccesskey --portal=$PORTAL_ID --key=$PERSONAL_ACCESS_KEY

  # Configurar secretos necesarios
  hs secrets add --portal=$PORTAL_ID --name=USERNAME --value=$USERNAME
  hs secrets add --portal=$PORTAL_ID --name=PASSWORD --value=$PASSWORD

  # Subir el proyecto a HubSpot
  hs project upload --portal=$PORTAL_ID
done
