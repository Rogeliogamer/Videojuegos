import { DynamoDBClient, CreateTableCommand } from "@aws-sdk/client-dynamodb";

// 1. Configuramos el cliente para que apunte a tu Docker local
const cliente = new DynamoDBClient({
  endpoint: "http://localhost:8000",
  region: "us-east-1", // Región simulada
  credentials: {
    accessKeyId: "local", // En local, las credenciales pueden ser falsas
    secretAccessKey: "local"
  }
});

// 2. Definimos la estructura de la tabla
const parametros = {
  TableName: "Partidas_100Mexicanos",
  KeySchema: [
    { AttributeName: "pinSala", KeyType: "HASH" } // HASH = Clave Principal
  ],
  AttributeDefinitions: [
    { AttributeName: "pinSala", AttributeType: "S" } // S = String (Texto)
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5
  }
};

// 3. Ejecutamos la orden
const crearTabla = async () => {
  try {
    const data = await cliente.send(new CreateTableCommand(parametros));
    console.log("✅ ¡Éxito! Tabla creada:", data.TableDescription.TableName);
    console.log("Estado:", data.TableDescription.TableStatus);
  } catch (error) {
    console.error("❌ Error al crear la tabla (¿Quizás ya existe?):", error.message);
  }
};

crearTabla();