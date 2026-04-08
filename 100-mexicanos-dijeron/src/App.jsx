import { PutCommand, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from './dynamo';
import { useState, useEffect } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
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
          <button onClick={() => navigate('/config-ronda')} className="neon-btn host-btn">
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

import { BANCO_PREGUNTAS } from './preguntas';

function PantallaConfiguracion() {
  const navigate = useNavigate();

  // Estados para pregunta personalizada
  const [customPregunta, setCustomPregunta] = useState('');
  const [customRespuestas, setCustomRespuestas] = useState([
    { texto: '', puntos: 0 }, { texto: '', puntos: 0 },
    { texto: '', puntos: 0 }, { texto: '', puntos: 0 }, { texto: '', puntos: 0 }
  ]);

  // Función para manejar cambios en los inputs de respuestas
  const handleRespuestaChange = (index, campo, valor) => {
    const nuevas = [...customRespuestas];
    nuevas[index][campo] = campo === 'puntos' ? parseInt(valor) : valor.toUpperCase();
    setCustomRespuestas(nuevas);
  };

  // Función final para confirmar y avanzar al PIN
  const seleccionarRonda = (preguntaFinal) => {
    // Pasamos los datos de la pregunta a la siguiente pantalla a través del estado de la ruta
    navigate('/tablero', { state: { ronda: preguntaFinal } });
  };

  return (
    // 1. Agregamos "sin-scroll" y forzamos el inicio desde arriba (flex-start)
    <div className="host-container sin-scroll" style={{ overflowY: 'auto', maxHeight: '85vh', justifyContent: 'flex-start', paddingTop: '1rem' }}>
      <h2 className="magenta-title" style={{ marginBottom: '1rem' }}>CONFIGURAR RONDA</h2>
      
      <div className="config-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        {/* LADO IZQUIERDO: BANCO DE PREGUNTAS */}
        <section className="banco-section">
          <h3 style={{ color: '#00f2ff', marginTop: 0 }}>Banco de Preguntas</h3>
          <div className="banco-scroll" style={{ maxHeight: '55vh', overflowY: 'auto' }}>
            {BANCO_PREGUNTAS.map(p => (
              <div key={p.id} className="pregunta-item" onClick={() => seleccionarRonda(p)}
                   style={{ border: '1px solid #ff00ff', padding: '10px', marginBottom: '8px', cursor: 'pointer' }}>
                <p style={{ margin: 0 }}>{p.pregunta}</p>
              </div>
            ))}
          </div>
        </section>

        {/* LADO DERECHO: CREAR PROPIA */}
        <section className="crear-section">
          <h3 style={{ color: '#ff00ff', marginTop: 0 }}>Crear Pregunta Personalizada</h3>
          <input 
            type="text" placeholder="¿Cuál es la pregunta?" 
            className="neon-input-magenta" style={{ fontSize: '1rem', width: '100%', boxSizing: 'border-box' }}
            onChange={(e) => setCustomPregunta(e.target.value)}
          />
          
          {/* 2. Compactamos los márgenes y paddings para ganar espacio */}
          <div className="respuestas-inputs" style={{ marginTop: '0.8rem' }}>
            {customRespuestas.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                <input 
                  type="text" placeholder={`Respuesta ${i+1}`} 
                  className="neon-input-magenta" style={{ flex: 3, padding: '0.4rem', fontSize: '0.9rem' }} 
                  onChange={(e) => handleRespuestaChange(i, 'texto', e.target.value)} 
                />
                <input 
                  type="number" placeholder="Pts" 
                  className="neon-input-magenta" style={{ flex: 1, padding: '0.4rem', fontSize: '0.9rem', textAlign: 'center' }} 
                  onChange={(e) => handleRespuestaChange(i, 'puntos', e.target.value)} 
                />
              </div>
            ))}
          </div>

          <button 
            className="neon-btn start-btn" 
            style={{ marginTop: '0.5rem', width: '100%', padding: '0.8rem' }}
            onClick={() => seleccionarRonda({ pregunta: customPregunta, respuestas: customRespuestas })}
          >
            USAR ESTA PREGUNTA
          </button>
        </section>
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

  const location = useLocation(); // Importar useLocation de react-router-dom
  const { ronda } = location.state || {}; // Obtenemos la pregunta elegida

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
          estado: "esperando",    // El juego aún no arranca
          rondaActiva: ronda // <--- AQUÍ GUARDAMOS LA PREGUNTA SELECCIONADA
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

  // --- NUEVA FUNCIÓN: Gatillo para iniciar el juego ---
  const iniciarJuego = async () => {
    try {
      // 1. Le decimos a DynamoDB que cambie el estado de la sala
      const comandoUpdate = new UpdateCommand({
        TableName: "Partidas_100Mexicanos",
        Key: { pinSala: pin },
        UpdateExpression: "SET estado = :nuevoEstado",
        ExpressionAttributeValues: {
          ":nuevoEstado": "jugando" // ¡Semáforo en verde!
        }
      });

      await docClient.send(comandoUpdate);

      // 2. El Host salta a su pantalla de juego
      navigate('/juego-host', { state: { pinSala: pin } });
    } catch (error) {
      console.error("❌ Error al iniciar la partida:", error);
      alert("Hubo un error al arrancar. Revisa tu conexión a la base de datos.");
    }
  };

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
          onClick={iniciarJuego} /* CONECTAMOS EL GATILLO AQUÍ */
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

  // --- NUEVO: useEffect para vigilar el arranque del juego ---
  useEffect(() => {
    // Si el equipo aún no ingresa su PIN, apagamos el radar
    if (!unido) return;

    const vigilarEstado = async () => {
      try {
        const comando = new GetCommand({
          TableName: "Partidas_100Mexicanos",
          Key: { pinSala: pinSala }
        });

        const respuesta = await docClient.send(comando);

        // Si la base de datos dice que el semáforo está en verde...
        if (respuesta.Item && respuesta.Item.estado === "jugando") {
          console.log("¡El Host arrancó la partida! Saltando...");
          // SALTO CON DATOS: Llevamos el PIN y el Nombre a la zona de respuestas
          navigate('/juego-equipo', { state: { pinSala: pinSala, nombreEquipo: nombreEquipo } });
        }
      } catch (error) {
        console.error("❌ Error vigilando el estado:", error);
      }
    };

    // Consultamos la base de datos cada 2 segundos
    const radarJuego = setInterval(vigilarEstado, 2000);

    // Limpieza de memoria
    return () => clearInterval(radarJuego);
  }, [unido, pinSala, navigate]);

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

// --- COMPONENTE 4: TABLERO ACTIVO (Host) ---
function PantallaJuegoHost() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pinSala } = location.state || {}; // Recibimos el PIN

  const [ronda, setRonda] = useState(null);
  const [reveladas, setReveladas] = useState([false, false, false, false, false]);
  const [strikes, setStrikes] = useState(0);

  // ==========================================
  // ZONA DE HOOKS (Todos deben ir arriba)
  // ==========================================

  // 1. CARGAR TABLERO INICIAL
  useEffect(() => {
    if (!pinSala) {
      navigate('/');
      return;
    }
    const cargarTablero = async () => {
      try {
        const comando = new GetCommand({ TableName: "Partidas_100Mexicanos", Key: { pinSala: pinSala } });
        const respuesta = await docClient.send(comando);
        if (respuesta.Item && respuesta.Item.rondaActiva) {
          setRonda(respuesta.Item.rondaActiva);
        }
      } catch (error) {
        console.error("❌ Error cargando el tablero:", error);
      }
    };
    cargarTablero();
  }, [pinSala, navigate]);

  // 2. MOTOR DE JUEGO (Radar de Validación Automática)
  useEffect(() => {
    if (!ronda || !pinSala) return;

    const motorDeJuego = async () => {
      try {
        const comandoLectura = new GetCommand({ TableName: "Partidas_100Mexicanos", Key: { pinSala: pinSala } });
        const respuestaDB = await docClient.send(comandoLectura);

        if (respuestaDB.Item && respuestaDB.Item.intentoAdivinar) {
          const intento = respuestaDB.Item.intentoAdivinar;
          console.log("📡 Respuesta detectada:", intento);

          let aciertoIndex = -1;
          ronda.respuestas.forEach((resp, index) => {
            if (resp.texto && resp.texto.trim().toUpperCase() === intento) {
              aciertoIndex = index;
            }
          });

          if (aciertoIndex !== -1) {
            setReveladas(prev => {
              const nuevas = [...prev];
              nuevas[aciertoIndex] = true;
              return nuevas;
            });
          } else {
            setStrikes(prev => prev < 3 ? prev + 1 : prev);
          }

          const comandoLimpieza = new UpdateCommand({
            TableName: "Partidas_100Mexicanos",
            Key: { pinSala: pinSala },
            UpdateExpression: "REMOVE intentoAdivinar"
          });
          await docClient.send(comandoLimpieza);
        }
      } catch (error) {
        console.error("❌ Error en el motor de juego:", error);
      }
    };

    const radar = setInterval(motorDeJuego, 1500);
    return () => clearInterval(radar);
  }, [pinSala, ronda]);

  // 3. SINCRONIZADOR (Espejo hacia los celulares)
  useEffect(() => {
    if (!pinSala) return;
    const compartirTablero = async () => {
      try {
        const comando = new UpdateCommand({
          TableName: "Partidas_100Mexicanos",
          Key: { pinSala: pinSala },
          UpdateExpression: "SET tablero = :tab",
          ExpressionAttributeValues: {
            ":tab": { reveladas: reveladas, strikes: strikes }
          }
        });
        await docClient.send(comando);
      } catch (error) {
        console.error("Error sincronizando tablero:", error);
      }
    };
    compartirTablero();
  }, [reveladas, strikes, pinSala]);


  // ==========================================
  // ZONA DE FUNCIONES Y RENDERIZADO
  // ==========================================

  const voltearCasilla = (index) => {
    const nuevas = [...reveladas];
    nuevas[index] = true;
    setReveladas(nuevas);
  };

  const agregarStrike = () => {
    if (strikes < 3) setStrikes(strikes + 1);
  };

  // EL RETURN CONDICIONAL (Debe ir después de todos los useEffect)
  if (!ronda) return <h2 className="magenta-title text-center" style={{marginTop: '20vh'}}>Cargando Tablero...</h2>;

  return (
    <div className="host-container sin-scroll" style={{ height: '85vh', justifyContent: 'space-between', paddingTop: '1rem', paddingBottom: '1rem' }}>
      
      <div style={{ textAlign: 'center', padding: '0 1rem' }}>
        <h2 style={{ color: '#fff', fontSize: 'clamp(1.5rem, 4vh, 2.5rem)', textShadow: '0 0 15px #00f2ff', margin: 0, lineHeight: '1.2' }}>
          {ronda.pregunta}
        </h2>
      </div>

      <div className="tablero-grid" style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(0.5rem, 1.5vh, 1rem)', maxWidth: '800px', margin: '0 auto', width: '100%', padding: '0 1rem' }}>
        {ronda.respuestas.map((resp, index) => {
          if (!resp.texto) return null; 

          return (
            <div 
              key={index} 
              className={`casilla-respuesta ${reveladas[index] ? 'revelada' : 'oculta'}`}
              onClick={() => voltearCasilla(index)}
            >
              <div className="casilla-frente">
                <span className="casilla-numero">{index + 1}</span>
              </div>
              <div className="casilla-dorso" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '0 2rem' }}>
                <span className="respuesta-texto">{resp.texto}</span>
                <span className="respuesta-puntos">{resp.puntos}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', cursor: 'pointer' }} onClick={agregarStrike}>
          {[1, 2, 3].map((num) => (
            <div key={num} className={`strike-box ${num <= strikes ? 'strike-activo' : ''}`}>
              X
            </div>
          ))}
        </div>
        <button className="volver-btn" onClick={() => setStrikes(0)}>Limpiar X</button>
      </div>

    </div>
  );
}

// --- COMPONENTE 5: ZONA DE RESPUESTAS (Equipo) ---
function PantallaJuegoEquipo() {
  const location = useLocation();
  const { pinSala, nombreEquipo } = location.state || {};

  const [ronda, setRonda] = useState(null);
  const [tablero, setTablero] = useState({ reveladas: [], strikes: 0 });
  const [respuesta, setRespuesta] = useState('');
  const [enviado, setEnviado] = useState(false);

  // RADAR DEL JUGADOR: Lee la ronda y el estado del tablero cada 1.5 segundos
  useEffect(() => {
    if (!pinSala) return;
    const radar = setInterval(async () => {
      try {
        const comando = new GetCommand({ TableName: "Partidas_100Mexicanos", Key: { pinSala: pinSala }});
        const res = await docClient.send(comando);
        if (res.Item) {
          if (res.Item.rondaActiva) setRonda(res.Item.rondaActiva);
          if (res.Item.tablero) setTablero(res.Item.tablero); // Descargamos el espejo
        }
      } catch (error) {
        console.error("Error en radar de equipo", error);
      }
    }, 1500);
    return () => clearInterval(radar);
  }, [pinSala]);

  const enviarRespuesta = async (e) => {
    e.preventDefault();
    if (!respuesta.trim()) return;

    try {
      const comando = new UpdateCommand({
        TableName: "Partidas_100Mexicanos",
        Key: { pinSala: pinSala },
        UpdateExpression: "SET intentoAdivinar = :resp",
        ExpressionAttributeValues: { ":resp": respuesta.trim().toUpperCase() }
      });

      await docClient.send(comando);
      setEnviado(true);
      setRespuesta('');
      setTimeout(() => setEnviado(false), 2500);
    } catch (error) {
      console.error("Error", error);
    }
  };

  if (!pinSala || !ronda) return <h2 className="magenta-title" style={{marginTop: '20vh'}}>Sincronizando...</h2>;

  // Calculamos los puntos en tiempo real sumando las respuestas que ya están reveladas
  const puntosAcumulados = ronda.respuestas.reduce((total, resp, index) => {
    return tablero.reveladas[index] ? total + (resp.puntos || 0) : total;
  }, 0);

  return (
    <div className="equipo-container sin-scroll" style={{ justifyContent: 'flex-start', paddingTop: '1rem', height: '100vh', paddingBottom: '2rem' }}>
      
      {/* HEADER: Nombre y Puntos */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #ff00ff', paddingBottom: '0.5rem' }}>
        <h3 style={{ color: '#00f2ff', margin: 0 }}>{nombreEquipo}</h3>
        <h3 style={{ color: '#ff00ff', margin: 0 }}>Ronda: {puntosAcumulados} pts</h3>
      </div>

      {/* LA PREGUNTA */}
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h2 style={{ color: '#fff', fontSize: '1.2rem', margin: 0 }}>{ronda.pregunta}</h2>
      </div>

      {/* STRIKES Y MINI-TABLERO (Espejo) */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', marginBottom: '1rem' }}>
        {[1, 2, 3].map(num => (
          <span key={num} style={{ fontSize: '1.5rem', color: num <= tablero.strikes ? '#ff0000' : '#333', fontWeight: 'bold' }}>
            X
          </span>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '2rem', flexGrow: 1, overflowY: 'auto' }} className="banco-scroll">
        {ronda.respuestas.map((resp, index) => {
          if (!resp.texto) return null;
          const revelada = tablero.reveladas[index];
          
          return (
            <div key={index} style={{ 
              display: 'flex', justifyContent: 'space-between', padding: '10px 15px', 
              backgroundColor: revelada ? '#00f2ff' : '#0a0a0a', 
              color: revelada ? '#000' : '#00f2ff',
              border: `1px solid ${revelada ? '#00f2ff' : '#333'}`,
              borderRadius: '5px', fontWeight: 'bold'
            }}>
              <span>{revelada ? resp.texto : index + 1}</span>
              <span>{revelada ? resp.puntos : '--'}</span>
            </div>
          );
        })}
      </div>

      {/* FORMULARIO DE ENVÍO */}
      <form onSubmit={enviarRespuesta} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
        <input
          type="text" className="neon-input-magenta" placeholder="Escribe aquí..."
          value={respuesta} onChange={(e) => setRespuesta(e.target.value)} disabled={enviado}
          style={{ fontSize: '1.2rem', padding: '1rem', textAlign: 'center' }}
        />
        <button type="submit" className="neon-btn start-btn" disabled={enviado || !respuesta.trim()} style={{ padding: '1rem', fontSize: '1.1rem' }}>
          {enviado ? "ENVIANDO..." : "ENVIAR RESPUESTA"}
        </button>
      </form>
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

              {/* NUEVAS RUTAS DE LA FASE 4 */}
              <Route path="/juego-host" element={<PantallaJuegoHost />} />
              <Route path="/juego-equipo" element={<PantallaJuegoEquipo />} />

              <Route path="/config-ronda" element={<PantallaConfiguracion />} />
            </Routes>
          </Router>
        )}
      </Authenticator>
    </div>
  );
}

export default App;