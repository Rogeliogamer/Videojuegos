import { PutCommand, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from './dynamo';
import { useState, useEffect } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import '@aws-amplify/ui-react/styles.css'; 
import './App.css';

// Definimos qué campos queremos en el registro
const formFields = {
  signUp: {
    given_name: {
      label: 'Nombre Real:',
      placeholder: 'Escribe tu nombre y apellido',
      isRequired: true,
      order: 1
    },
    username: { // Este es el campo que Cognito usa para el login (Email)
      label: 'Correo electrónico:',
      placeholder: 'ejemplo@correo.com',
      isRequired: true,
      order: 2
    },
    password: {
      label: 'Contraseña:',
      placeholder: 'Crea una contraseña segura',
      order: 3
    },
    confirm_password: {
      label: 'Confirmar Contraseña:',
      placeholder: 'Repite tu contraseña',
      order: 4
    },
    preferred_username: { // Este será tu Nickname oficial
      label: 'Nickname (Nombre de usuario):',
      placeholder: '¿Cómo quieres que te vean en el tablero?',
      isRequired: true,
      order: 5
    }
  },
};

// --- COMPONENTE 1: EL LOBBY (Sala de espera) ---
function LobbyPrincipal({ user, signOut }) {
  const navigate = useNavigate();

  return (
    <div className="lobby-container">
      {/* HEADER: Título a la izquierda, Usuario/Botón a la derecha */}
      <header className="lobby-header">
        <h1 className="lobby-title">100 MEXICANOS DIJERON</h1>

        <div className="user-panel">
          <span className="user-name">
            👤 {user?.userId?.preferred_username || user?.signInDetails?.loginId || 'Jugador'}
          </span>
          <button onClick={signOut} className="neon-btn logout-btn">
            Salir
          </button>
        </div>
      </header>

      {/* CONTENEDOR DE TARJETAS (Lado a lado) */}
      <div className="cards-container">

        {/* TARJETA IZQUIERDA: CREAR PARTIDA (Host) */}
        <div className="neon-card host-card">
          <h2 className="card-title">Modo Host</h2>
          <p className="card-desc">Crea una nueva sala y muestra el tablero principal en la pantalla grande.</p>
          <button onClick={() => navigate('/tablero')} className="neon-btn host-btn">
            Crear Partida
          </button>
        </div>

        {/* TARJETA DERECHA: UNIRSE A PARTIDA (Equipos) */}
        <div className="neon-card join-card">
          <h2 className="card-title">Unirse a Equipo</h2>
          <p className="card-desc">Ve a la zona de votación para ingresar el PIN de la sala y registrar a tu equipo.</p>
          <button onClick={() => navigate('/votacion')} className="neon-btn join-btn">
            Entrar a Votar
          </button>
        </div>

      </div>
    </div>
  );
}

// --- COMPONENTE 2: PANEL DEL HOST (Administrador) ---
function PantallaTablero() {
  const navigate = useNavigate();

  // Estados de la sala
  const [pin, setPin] = useState('----');
  const [equipos, setEquipos] = useState([]); // Aquí guardaremos los que se conecten

  // useEffect se ejecuta una sola vez al abrir esta pantalla
  useEffect(() => {
    const crearSala = async () => {
      // 1. Generamos el PIN aleatorio
      const pinAleatorio = Math.floor(1000 + Math.random() * 9000).toString();
      setPin(pinAleatorio);

      // 2. Preparamos la orden para guardar en la base de datos
      const comando = new PutCommand({
        TableName: "Partidas_100Mexicanos",
        Item: {
          pinSala: pinAleatorio, // Nuestra Clave Principal
          equipos: [],           // Empezamos sin equipos
          estado: "esperando"    // El juego aún no arranca
        }
      });

      // 3. Enviamos la orden a DynamoDB
      try {
        await docClient.send(comando);
        console.log("📡 Sala registrada en la Base de Datos con PIN:", pinAleatorio);
      } catch (error) {
        console.error("❌ Error al conectar con DynamoDB:", error);
      }
    };

    crearSala();
  }, []);

  // --- NUEVO: useEffect para Sondeo (Polling) ---
  // Este bloque se ejecutará automáticamente en cuanto se genere el PIN
  useEffect(() => {
    // Si el PIN aún no se genera, no hacemos nada
    if (pin === '----') return;

    // Función que va a DynamoDB a leer el estado actual de la sala
    const buscarEquipos = async () => {
      try {
        const comando = new GetCommand({
          TableName: "Partidas_100Mexicanos",
          Key: { pinSala: pin }
        });

        const respuesta = await docClient.send(comando);

        // Si la sala existe y la base de datos tiene equipos, actualizamos la pantalla
        if (respuesta.Item && respuesta.Item.equipos) {
          setEquipos(respuesta.Item.equipos);
        }
      } catch (error) {
        console.error("❌ Error en el radar de equipos:", error);
      }
    };

    // Configuramos un reloj (Intervalo) que ejecute "buscarEquipos" cada 2000 milisegundos (2 segundos)
    const radar = setInterval(buscarEquipos, 2000);
    // Limpieza de memoria: Si el Host sale de la pantalla, apagamos el radar para no saturar la PC
    return () => clearInterval(radar);

  }, [pin]); // El radar se enciende en cuanto la variable "pin" cambia

  return (
    <div className="host-container">
      {/* Barra de navegación superior */}
      <header className="host-nav">
        <button onClick={() => navigate('/')} className="volver-btn">
          ⬅ Volver al Lobby
        </button>
        <span className="host-badge">MODO ADMINISTRADOR</span>
      </header>

      {/* Sección principal: EL PIN */}
      <div className="pin-section">
        <h2 className="pin-subtitle">PIN DE LA SALA</h2>
        <h1 className="huge-neon-pin">{pin}</h1>
        <p className="pin-instructions">Ingresa a la página desde tu celular y usa este PIN para unirte al tablero.</p>
      </div>

      {/* Sección inferior: Equipos Conectados */}
      <div className="equipos-section">
        <h3 className="equipos-title">EQUIPOS CONECTADOS ({equipos.length})</h3>
        
        <div className="equipos-grid">
          {equipos.length === 0 ? (
            <div className="esperando-animacion">Esperando jugadores...</div>
          ) : (
            equipos.map((equipo, index) => (
              <div key={index} className="equipo-conectado" style={{ fontSize: '1.5rem', color: '#fff', textShadow: '0 0 10px #00f2ff' }}>
                {equipo}
              </div>
            ))
          )}
        </div>
      </div>

      {/* === AQUÍ RESTAURAMOS EL BOTÓN DE INICIO === */}
      <div className="start-section">
        <button 
          className={`neon-btn ${equipos.length > 0 ? 'start-btn' : 'start-btn-disabled'}`}
          disabled={equipos.length === 0}
        >
          ¡INICIAR TABLERO!
        </button>
      </div>
      
    </div>
  );
}

function PantallaVotacion() {
  const navigate = useNavigate();

  // Estados para el formulario de ingreso
  const [pinSala, setPinSala] = useState('');
  const [nombreEquipo, setNombreEquipo] = useState('');
  const [unido, setUnido] = useState(false); // Controla si ya entramos a la sala

  // Función que simula la conexión a AWS
  const handleUnirse = async (e) => {
    e.preventDefault(); // Evita que la página se recargue al enviar el formulario

    // 1. Validación básica de la interfaz
    if(pinSala.length !== 4 || nombreEquipo.trim() === '') {
      alert("Por favor, ingresa un PIN de 4 dígitos y el nombre de tu equipo.");
      return;
    }

    try {
      // 2. BUSCAR: ¿Existe este PIN en la base de datos?
      const comandoGet = new GetCommand({
        TableName: "Partidas_100Mexicanos",
        Key: { pinSala: pinSala }
      });

      const respuesta = await docClient.send(comandoGet);

      // Si no hay 'Item' en la respuesta, la sala no existe
      if (!respuesta.Item) {
        alert("❌ El PIN ingresado no existe o la sala ya se cerró.");
        return; // Detenemos la ejecución aquí
      }

      // 3. ACTUALIZAR: Si la sala existe, agregamos el equipo a la lista
      const comandoUpdate = new UpdateCommand({
        TableName: "Partidas_100Mexicanos",
        Key: { pinSala: pinSala },
        // Usamos una fórmula nativa de DynamoDB para agregar un elemento a un arreglo existente
        UpdateExpression: "SET equipos = list_append(equipos, :nuevoEquipo)",
        ExpressionAttributeValues: {
          ":nuevoEquipo": [nombreEquipo.trim().toUpperCase()] // Se envía como arreglo
        }
      });

      await docClient.send(comandoUpdate);

      // 4. Éxito: Cambiamos la pantalla del usuario
      setUnido(true);
      console.log(`✅ ¡Éxito! El equipo ${nombreEquipo} se unió a la sala ${pinSala}`);

    } catch (error) {
      console.error("❌ Error al comunicarse con DynamoDB:", error);
      alert("Error de conexión. Intenta de nuevo.");
    }
  };

  return (
    <div className="equipo-container">
      {/* Barra de navegación superior (Magenta) */}
      <header className="equipo-nav">
        <button onClick={() => navigate('/')} className="volver-btn-magenta">
          ⬅ Volver
        </button>
        <span className="equipo-badge">MODO EQUIPO</span>
      </header>

      {/* RENDERIZADO CONDICIONAL: Formulario vs Pantalla de Espera */}
      {!unido ? (
        <div className="join-form-section">
          <h2 className="magenta-title">UNIRSE A LA PARTIDA</h2>

          <form onSubmit={handleUnirse} className="join-form">
            <input
              type="number"
              placeholder="PIN DE LA SALA"
              value={pinSala}
              onChange={(e) => setPinSala(e.target.value)}
              maxLength={4}
              className="neon-input-magenta"
              required
            />
            <input
              type="text"
              placeholder="NOMBRE DEL EQUIPO (Ej. Los Compadres)"
              value={nombreEquipo}
              onChange={(e) => setNombreEquipo(e.target.value.toUpperCase())}
              maxLength={15}
              className="neon-input-magenta"
              required
            />
            <button type="submit" className="neon-btn join-submit-btn">
              ¡CONECTAR AL TABLERO!
            </button>
          </form>
        </div>
      ) : (
        <div className="waiting-screen">
          <h2 className="magenta-title">¡CONECTADO!</h2>
          <p className="team-name-display">{nombreEquipo}</p>
          <div className="esperando-animacion-magenta">
            Mire la pantalla principal... el Host iniciará la ronda pronto.
          </div>
        </div>
      )}
    </div>
  );
}

// --- COMPONENTE PRINCIPAL: APP ---
function App() {
  return (
    <div className="page-perimeter">
      <Authenticator loginMechanisms={['email']} formFields={formFields}>
        {({ signOut, user }) => (
          // El Router envuelve todo lo que está protegido por el Login
          <Router>
            <Routes>
              {/* Ruta principal: El Lobby */}
              <Route path="/" element={<LobbyPrincipal user={user} signOut={signOut} />} />
              {/* Ruta del Host */}
              <Route path="/tablero" element={<PantallaTablero />} />
              {/* Ruta de los Equipos */}
              <Route path="/votacion" element={<PantallaVotacion />} />
            </Routes>
          </Router>
        )}
      </Authenticator>
    </div>
  );
}

export default App;