import { DynamoDBClient, CreateTableCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

// 1. Configuramos el cliente apuntando al Docker local
const cliente = new DynamoDBClient({
  endpoint: "http://localhost:8000",
  region: "us-east-1",
  credentials: {
    accessKeyId: "local",
    secretAccessKey: "local"
  }
});

const docClient = DynamoDBDocumentClient.from(cliente);

// 2. Definimos la estructura de la tabla de preguntas
const parametrosTabla = {
    TableName: "Preguntas_100Mexicanos",
    KeySchema: [
    { AttributeName: "id", KeyType: "HASH" } // Clave principal
  ],
  AttributeDefinitions: [
    { AttributeName: "id", AttributeType: "S" } // S = String
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5
  }
};

// 3. Nuestro "Semillero" de preguntas de prueba
const preguntasPrueba = [
  {
    id: "1",
    pregunta: "¿Qué le pones a los tacos?",
    respuestas: [
      { texto: "SALSA", puntos: 40 },
      { texto: "LIMÓN", puntos: 30 },
      { texto: "CILANTRO Y CEBOLLA", puntos: 20 },
      { texto: "GUACAMOLE", puntos: 10 }
    ]
  },
  {
    id: "2",
    pregunta: "Menciona un animal que ladra",
    respuestas: [
      { texto: "PERRO", puntos: 85 },
      { texto: "LOBO", puntos: 10 },
      { texto: "FOCA", puntos: 5 }
    ]
  },
  {
    id: "3",
    pregunta: "Cosas que llevas a la playa",
    respuestas: [
      { texto: "TOALLA", puntos: 35 },
      { texto: "BLOQUEADOR", puntos: 30 },
      { texto: "TRAJE DE BAÑO", puntos: 25 },
      { texto: "LENTES DE SOL", puntos: 10 }
    ]
  }
];

// 4. Ejecutamos la creación e inyección
const inicializarBanco = async () => {
  try {
    console.log("⏳ 1. Creando la tabla de Preguntas...");
    await cliente.send(new CreateTableCommand(parametrosTabla));
    console.log("✅ Tabla 'Preguntas_100Mexicanos' creada con éxito.\n");
  } catch (error) {
    if (error.name === "ResourceInUseException") {
      console.log("⚠️ La tabla ya existe, omitiendo creación...\n");
    } else {
      console.error("❌ Error al crear tabla:", error.message);
      return;
    }
  }

  try {
    console.log("⏳ 2. Inyectando preguntas de prueba...");
    for (const item of preguntasPrueba) {
      await docClient.send(new PutCommand({
        TableName: "Preguntas_100Mexicanos",
        Item: item
      }));
      console.log(`  -> Pregunta insertada: ${item.pregunta}`);
    }
    console.log("\n✅ ¡Base de datos inicializada correctamente!");
  } catch (error) {
    console.error("❌ Error al inyectar preguntas:", error);
  }
};

inicializarBanco();