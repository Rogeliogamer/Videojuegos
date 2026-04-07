import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// 1. Configuramos el cliente base apuntando a nuestro Docker
const client = new DynamoDBClient({
  endpoint: "http://localhost:5173/dynamo-proxy",
  region: "us-east-1",
  credentials: {
    accessKeyId: "local",
    secretAccessKey: "local"
  }
});

// 2. Exportamos un "Document Client" (Más fácil de usar)
export const docClient = DynamoDBDocumentClient.from(client);