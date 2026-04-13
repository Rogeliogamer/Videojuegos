import { PutCommand, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from './dynamo';
import { useState, useEffect } from 'react';
import { Authenticator, translations } from '@aws-amplify/ui-react';
import { I18n } from 'aws-amplify/utils'; // Si usas la versión más reciente (v6)
// Nota: Si te marca error el renglón de arriba, cámbialo por: import { I18n } from 'aws-amplify';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import '@aws-amplify/ui-react/styles.css'; 
import './App.css';

// Configuración de traducciones para el componente Authenticator (Amplify UI)
I18n.putVocabularies(translations);
// Aquí puedes personalizar aún más los textos específicos de los campos de autenticación
I18n.putVocabularies({
  es: {
    'Email': 'Correo electrónico:',
    'Enter your Email': 'ejemplo@correo.com',
    'Password': 'Contraseña:',
    'Enter your Password': 'Escribe tu contraseña',
    'Forgot your password?': '¿Olvidaste tu contraseña?'
  }
});
// Establecemos el idioma global a español
I18n.setLanguage('es');

// Configuración de campos personalizados para el proceso de registro (sign up) en el Authenticator
const formFields = {
  // Configuración de campos para el proceso de registro (sign up)
  signUp: {
    // Agregamos un campo personalizados para el nombre real del jugador
    given_name: {
      label: 'Nombre Real:',
      placeholder: 'Escribe tu nombre y apellido',
      isRequired: true,
      order: 1
    },
    // El campo de email es obligatorio y se usará como loginId en Cognito, pero lo renombramos para que suene más amigable
    email: { // Este es el campo que Cognito usa para el login (Email)
      label: 'Correo electrónico:',
      placeholder: 'ejemplo@correo.com',
      isRequired: true,
      order: 2
    },
    // El campo de contraseña también es obligatorio, pero lo personalizamos para que suene más divertido
    password: {
      label: 'Contraseña:',
      placeholder: 'Crea una contraseña',
      order: 3
    },
    // Agregamos un campo para confirmar la contraseña, aunque Cognito no lo requiere, es una buena práctica para evitar errores de tipeo
    confirm_password: {
      label: 'Confirmar Contraseña:',
      placeholder: 'Repite tu contraseña',
      order: 4
    },
    // Finalmente, agregamos un campo para el nickname o nombre de usuario que se mostrará en el juego, este será el "alias" del jugador dentro de la partida
    preferred_username: { // Este será tu Nickname oficial
      label: 'Nombre de usuario:',
      placeholder: 'Nickname',
      isRequired: true,
      order: 5
    }
  },
};

// --- COMPONENTE 1: EL LOBBY (Sala de espera) ---
function LobbyPrincipal({ user, signOut }) {
  // Aquí es donde mostraremos el nickname del jugador, que se obtiene de los atributos del usuario en Cognito
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('Jugador');
  
  // Al cargar el componente, hacemos una consulta a Cognito para obtener los atributos del usuario autenticado, específicamente el preferred_username que configuramos en el registro
  useEffect(() => {
    const cargarAtributos = async () => {
      try {
        // fetchUserAttributes es una función de Amplify Auth que nos devuelve un objeto con todos los atributos del usuario, incluyendo el preferred_username que configuramos en el proceso de registro
        const atributos = await fetchUserAttributes();

        // Buscamos el preferred_username que configuramos en el registro
        if (atributos.preferred_username) {
          setNickname(atributos.preferred_username);
        }
      } catch (error) {
        console.error("Error al obtener atributos del usuario:", error);
      }
    };

    cargarAtributos();
  }, []);

  // RENDERIZADO DEL LOBBY PRINCIPAL
  return (
    // Contenedor principal del lobby, con un diseño de dos columnas para las opciones de Host y Jugador
    <div className="lobby-container">
      {/* HEADER: Título a la izquierda, Usuario/Botón a la derecha */}
      <header className="lobby-header">
        {/* TÍTULO DEL JUEGO */}
        <h1 className="lobby-title">100 MEXICANOS DIJERON</h1>

        {/* PANEL DE USUARIO: Muestra el nickname del jugador y un botón para cerrar sesión */}
        <div className="user-panel">
          {/* Mostramos el nickname del jugador, si no se encuentra, mostramos el loginId o un genérico "Jugador" */}
          <span className="user-name">
            👤 {nickname || user?.signInDetails?.loginId || 'Jugador'}
          </span>

          {/*} BOTÓN DE CERRAR SESIÓN */}
          <button onClick={signOut} className="neon-btn logout-btn">
            Salir
          </button>
        </div>
      </header>

      {/* CONTENEDOR DE TARJETAS (Lado a lado) */}
      <div className="cards-container">

        {/* TARJETA IZQUIERDA: CREAR PARTIDA (Host) */}
        <div className="neon-card host-card">
          {/* TÍTULO */}
          <h2 className="card-title">Modo Host</h2>

          {/* DESCRIPCIÓN */}
          <p className="card-desc">
            Crea una nueva sala y muestra el tablero principal en la pantalla grande.
          </p>

          {/* BOTÓN PARA CREAR PARTIDA (Navega a la pantalla de configuración del Host) */}
          <button onClick={() => navigate('/config-ronda')} className="neon-btn host-btn">
            Crear Partida
          </button>
        </div>

        {/* TARJETA DERECHA: UNIRSE A PARTIDA (Equipos) */}
        <div className="neon-card join-card">
          {/* TÍTULO */}
          <h2 className="card-title">Unirse a Equipo</h2>

          {/* DESCRIPCIÓN */}
          <p className="card-desc">
            Ve a la zona de votación para ingresar el PIN de la sala y registrar a tu equipo.
          </p>

          {/* BOTÓN PARA UNIRSE A PARTIDA (Navega a la pantalla de unión de jugadores) */}
          <button onClick={() => navigate('/votacion')} className="neon-btn join-btn">
            Entrar a Jugar
          </button>
        </div>
      </div>
    </div>
  );
}

import { BANCO_PREGUNTAS } from './preguntas';

function PantallaConfiguracion() {
  const navigate = useNavigate();

  // 1. Estados de Configuración
  const [nombreEquipoA, setNombreEquipoA] = useState('EQUIPO 1');
  const [nombreEquipoB, setNombreEquipoB] = useState('EQUIPO 2');
  const [numRondas, setNumRondas] = useState(3);
  const [rondasSeleccionadas, setRondasSeleccionadas] = useState([]);

  // Estados para Pregunta Personalizada
  const [customPregunta, setCustomPregunta] = useState('');
  const [customRespuestas, setCustomRespuestas] = useState(
    Array(5).fill({ texto: '', puntos: 0 })
  );

  // 2. Lógica de Selección de Preguntas (Máximo N rondas)
  const togglePreguntaBanco = (p) => {
    if (rondasSeleccionadas.find(r => r.id === p.id)) {
      setRondasSeleccionadas(rondasSeleccionadas.filter(r => r.id !== p.id));
    } else {
      if (rondasSeleccionadas.length < numRondas) {
        setRondasSeleccionadas([...rondasSeleccionadas, p]);
      } else {
        alert(`Ya seleccionaste las ${numRondas} rondas permitidas.`);
      }
    }
  };

  const agregarPersonalizada = () => {
    // Validación: Pregunta y 5 respuestas con puntos
    const validas = customRespuestas.filter(r => r.texto.trim() !== '' && r.puntos > 0);
    if (!customPregunta || validas.length < 5) {
      alert("Para una ronda personalizada necesitas la pregunta y las 5 respuestas con sus puntos.");
      return;
    }

    const nuevaRonda = {
      id: Date.now(),
      pregunta: customPregunta,
      respuestas: customRespuestas
    };

    if (rondasSeleccionadas.length < numRondas) {
      setRondasSeleccionadas([...rondasSeleccionadas, nuevaRonda]);
      setCustomPregunta('');
      setCustomRespuestas(Array(5).fill({ texto: '', puntos: 0 }));
    } else {
      alert("Ya completaste el número de rondas.");
    }
  };

  const crearPartidaFinal = () => {
    if (rondasSeleccionadas.length < numRondas) {
      alert(`Faltan ${numRondas - rondasSeleccionadas.length} rondas por configurar.`);
      return;
    }

    // Saltamos al tablero enviando el "Mega Objeto" de configuración
    navigate('/tablero', {
      state: {
        config: {
          equipoA: { nombre: nombreEquipoA.toUpperCase(), jugadores: [] },
          equipoB: { nombre: nombreEquipoB.toUpperCase(), jugadores: [] },
          rondas: rondasSeleccionadas,
          maxRondas: numRondas
        }
      }
    });
  };

  return (
    <div className="host-container sin-scroll" style={{ overflowY: 'auto', maxHeight: '95vh', justifyContent: 'flex-start' }}>
      <h2 className="magenta-title">CONFIGURACIÓN DE PARTIDA</h2>
      
      <div className="config-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        {/* LADO IZQUIERDO: EQUIPOS Y RONDAS */}
        <section className="crear-section">
          <h3 style={{ color: '#00f2ff' }}>1. Equipos y Rondas</h3>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
            <input className="neon-input-magenta" placeholder="Nombre Equipo A" onChange={e => setNombreEquipoA(e.target.value)} />
            <input className="neon-input-magenta" placeholder="Nombre Equipo B" onChange={e => setNombreEquipoB(e.target.value)} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Número de Rondas (1-5): </label>
            <input type="number" min="1" max="5" value={numRondas} className="neon-input-magenta" style={{ width: '60px', marginLeft: '10px' }} 
                   onChange={e => setNumRondas(parseInt(e.target.value))} />
          </div>

          <h3 style={{ color: '#ff00ff' }}>2. Pregunta Personalizada</h3>
          <input className="neon-input-magenta" placeholder="Pregunta..." value={customPregunta} onChange={e => setCustomPregunta(e.target.value)} />
          {customRespuestas.map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
              <input className="neon-input-magenta" placeholder={`Respuesta ${i+1}`} style={{ flex: 3 }}
                     onChange={e => {
                      const n = [...customRespuestas];
                      n[i] = { ...n[i], texto: e.target.value.toUpperCase() };
                      setCustomRespuestas(n);
                    }} />
              <input type="number" className="neon-input-magenta" placeholder="Pts" style={{ flex: 1 }}
                     onChange={e => {
                      const n = [...customRespuestas];
                      n[i] = { ...n[i], puntos: parseInt(e.target.value) || 0 };
                      setCustomRespuestas(n);
                    }} />
            </div>
          ))}
          <button className="neon-btn" style={{ marginTop: '10px', width: '100%', fontSize: '0.8rem' }} onClick={agregarPersonalizada}>
            AÑADIR A LA PARTIDA
          </button>
        </section>

        {/* LADO DERECHO: BANCO Y RESUMEN */}
        <section className="banco-section">
          <h3 style={{ color: '#00f2ff' }}>3. Banco de Preguntas</h3>
          <div className="banco-scroll" style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1rem' }}>
            {BANCO_PREGUNTAS.map(p => (
              <div key={p.id} className="pregunta-item"
                   style={{ border: `1px solid ${rondasSeleccionadas.find(r => r.id === p.id) ? '#00f2ff' : '#333'}`, padding: '8px', marginBottom: '5px', cursor: 'pointer' }}
                   onClick={() => togglePreguntaBanco(p)}>
                {p.pregunta}
              </div>
            ))}
          </div>

          <h3 style={{ color: '#ff00ff' }}>Resumen: {rondasSeleccionadas.length} / {numRondas}</h3>
          <div style={{ backgroundColor: '#111', padding: '10px', borderRadius: '5px', minHeight: '100px' }}>
            {rondasSeleccionadas.map((r, i) => (
              <div key={i} style={{ fontSize: '0.8rem', color: '#00f2ff' }}>R{i+1}: {r.pregunta}</div>
            ))}
          </div>

          <button className="neon-btn start-btn" style={{ marginTop: '1.5rem', width: '100%' }} onClick={crearPartidaFinal}>
            CREAR PARTIDA CON {numRondas} RONDAS
          </button>
        </section>
      </div>
    </div>
  );
}

// --- COMPONENTE 2: PANEL DEL HOST (Administrador) ---
function PantallaTablero() {
  const navigate = useNavigate();
  const location = useLocation();
  const { config } = location.state || {}; // Recibimos la super configuración de la pantalla anterior

  // Estados de la sala
  const [pin, setPin] = useState('----');
  const [salaDB, setSalaDB] = useState(null); // Aquí guardaremos los datos en tiempo real

  // 1. CREAR LA SALA CON LA NUEVA ESTRUCTURA
  useEffect(() => {
    // Si alguien entra directo sin configurar, lo regresamos
    if (!config) { navigate('/config-ronda'); return; }

    const crearSala = async () => {
      const pinAleatorio = Math.floor(1000 + Math.random() * 9000).toString();
      setPin(pinAleatorio);

      const comando = new PutCommand({
        TableName: "Partidas_100Mexicanos",
        Item: {
          pinSala: pinAleatorio,
          estado: "esperando",
          equipoA: config.equipoA,
          equipoB: config.equipoB,
          rondas: config.rondas,
          rondaActiva: config.rondas[0], // Pre-cargamos la ronda 1
          indiceRondaActual: 0,
          puntajesGlobales: { [config.equipoA.nombre]: 0, [config.equipoB.nombre]: 0 }
        }
      });

      try {
        await docClient.send(comando);
        console.log("📡 Mega-Sala registrada con PIN:", pinAleatorio);
      } catch (error) {
        console.error("❌ Error conectando con DynamoDB:", error);
      }
    };
    crearSala();
  }, [config, navigate]);

  // 2. RADAR: VIGILAR QUIÉN SE UNE A QUÉ EQUIPO
  useEffect(() => {
    if (pin === '----') return;
    const vigilarLobby = async () => {
      try {
        const comando = new GetCommand({ TableName: "Partidas_100Mexicanos", Key: { pinSala: pin } });
        const respuesta = await docClient.send(comando);
        if (respuesta.Item) {
          setSalaDB(respuesta.Item); // Actualizamos la vista con los jugadores nuevos
        }
      } catch (error) { console.error(error); }
    };
    const radar = setInterval(vigilarLobby, 2000);
    return () => clearInterval(radar);
  }, [pin]);

  // 3. GATILLO PARA INICIAR EL JUEGO
  const iniciarJuego = async () => {
    try {
      const comandoUpdate = new UpdateCommand({
        TableName: "Partidas_100Mexicanos",
        Key: { pinSala: pin },
        UpdateExpression: "SET estado = :nuevoEstado",
        ExpressionAttributeValues: { ":nuevoEstado": "jugando" }
      });
      await docClient.send(comandoUpdate);
      navigate('/juego-host', { state: { pinSala: pin } });
    } catch (error) {
      console.error(error);
    }
  };

  // --- CÁLCULOS DE BALANCE DE JUGADORES ---
  const jugadoresA = salaDB?.equipoA?.jugadores || [];
  const jugadoresB = salaDB?.equipoB?.jugadores || [];

  // Condición 1: Diferencia máxima de 1 jugador entre equipos
  const balanceado = Math.abs(jugadoresA.length - jugadoresB.length) <= 1;
  // Condición 2: Al menos 1 jugador en cada equipo para poder jugar
  const minimoJugadores = jugadoresA.length > 0 && jugadoresB.length > 0;

  return (
    <div className="host-container sin-scroll" style={{ height: '90vh', justifyContent: 'flex-start', paddingTop: '1rem' }}>
      <header className="host-nav">
        <button onClick={() => navigate('/config-ronda')} className="volver-btn">⬅ Cancelar Partida</button>
        <span className="host-badge">MODO ADMINISTRADOR</span>
      </header>

      <div className="pin-section" style={{ marginBottom: '1rem' }}>
        <h2 className="pin-subtitle">PIN DE LA SALA</h2>
        <h1 className="huge-neon-pin" style={{ fontSize: 'clamp(4rem, 8vw, 6rem)' }}>{pin}</h1>
      </div>

      {/* VISTA DE EQUIPOS Y JUGADORES CONECTADOS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        {/* PANEL EQUIPO A */}
        <div style={{ backgroundColor: '#0a0a0a', border: '1px solid #00f2ff', borderRadius: '10px', padding: '1rem' }}>
          <h3 style={{ color: '#00f2ff', marginTop: 0, textAlign: 'center' }}>
            {config?.equipoA.nombre} ({jugadoresA.length}/5)
          </h3>
          <div style={{ minHeight: '100px', color: '#fff', textAlign: 'center' }}>
            {jugadoresA.length === 0 ? <p style={{ color: '#555' }}>Esperando jugadores...</p> :
             jugadoresA.map((jugador, i) => <div key={i}>👤 {jugador}</div>)}
          </div>
        </div>

        {/* PANEL EQUIPO B */}
        <div style={{ backgroundColor: '#0a0a0a', border: '1px solid #00f2ff', borderRadius: '10px', padding: '1rem' }}>
          <h3 style={{ color: '#00f2ff', marginTop: 0, textAlign: 'center' }}>
            {config?.equipoB.nombre} ({jugadoresB.length}/5)
          </h3>
          <div style={{ minHeight: '100px', color: '#fff', textAlign: 'center' }}>
            {jugadoresB.length === 0 ? <p style={{ color: '#555' }}>Esperando jugadores...</p> :
             jugadoresB.map((jugador, i) => <div key={i}>👤 {jugador}</div>)}
          </div>
        </div>
      </div>

      {/* EL BOTÓN INTELIGENTE CON LAS CONDICIONES DE BALANCE */}
      <div className="start-section" style={{ textAlign: 'center' }}>
        <button 
          onClick={iniciarJuego}
          disabled={!balanceado || !minimoJugadores}
          className={`neon-btn ${balanceado && minimoJugadores ? 'start-btn' : 'start-btn-disabled'}`}
          style={{ width: '100%', padding: '1.5rem', fontSize: '1.2rem' }}
        >
          {(!minimoJugadores) ? "ESPERANDO AL MENOS 1 JUGADOR POR BANDO..." : 
           (!balanceado) ? "⚠️ EQUIPOS DESBALANCEADOS" : 
           "¡INICIAR PARTIDA!"}
        </button>
      </div>
    </div>
  );
}

// --- ACTUALIZACIÓN DE UNIÓN DE JUGADORES (UX MEJORADA) ---
function PantallaVotacion() {
  const navigate = useNavigate();

  const [pinSala, setPinSala] = useState('');
  const [nombreJugador, setNombreJugador] = useState('');
  const [equipoElegido, setEquipoElegido] = useState('');
  const [infoSala, setInfoSala] = useState(null); // Para guardar nombres de equipos de la DB
  const [unido, setUnido] = useState(false);

  // 1. BUSCADOR DE SALA EXPLÍCITO
  const buscarSala = async () => {
    if (pinSala.length !== 4) {
      alert("El PIN debe tener 4 dígitos.");
      return;
    }
    try {
      const res = await docClient.send(new GetCommand({ TableName: "Partidas_100Mexicanos", Key: { pinSala } }));
      if (res.Item) {
        setInfoSala(res.Item);
      } else {
        alert("❌ Sala no encontrada. Revisa el PIN.");
      }
    } catch (e) { 
      console.error(e);
    }
  };

  // 2. UNIRSE AL EQUIPO Y ENTRAR A SALA DE ESPERA
  const handleUnirse = async (e) => {
    e.preventDefault(); // Evita que la página se recargue al enviar el formulario

    if (!equipoElegido || !nombreJugador.trim()) {
      alert("Elige un equipo y escribe tu nombre.");
      return;
    }

    const equipoKey = equipoElegido === infoSala.equipoA.nombre ? 'equipoA' : 'equipoB';
    const jugadoresActuales = infoSala[equipoKey].jugadores || [];

    if (jugadoresActuales.length >= 5) {
      alert("Este equipo ya está lleno (Máx 5 jugadores).");
      return;
    }

    try {
      // 3. REGISTRO EN DYNAMODB (SET dinámico para agregar al arreglo de jugadores)
      const comandoUpdate = new UpdateCommand({
        TableName: "Partidas_100Mexicanos",
        Key: { pinSala: pinSala },
        UpdateExpression: `SET ${equipoKey}.jugadores = list_append(if_not_exists(${equipoKey}.jugadores, :emptyList), :nuevoJugador)`,
        ExpressionAttributeValues: {
          ":nuevoJugador": [nombreJugador.trim().toUpperCase()],
          ":emptyList": []
        }
      });

      await docClient.send(comandoUpdate);

      // ¡ÉXITO! Pasamos al estado de espera (NO saltamos al juego todavía)
      setUnido(true);
      } catch (error) {
        console.error(error);
        alert("Error al unirse. Intenta de nuevo.");
      }
    };

    // 3. RADAR DE ESPERA (Vigila cuando el Host le da a Iniciar Partida)
    useEffect(() => {
    if (!unido) return;

    const vigilarEstado = setInterval(async () => {
      try {
        const comando = new GetCommand({ TableName: "Partidas_100Mexicanos", Key: { pinSala } });
        const res = await docClient.send(comando);

        // Si el Host ya cambió el semáforo a verde...
        if (res.Item && res.Item.estado === "jugando") {
          console.log("¡El Host arrancó! Saltando...");
          // Ahora sí, hacemos el salto sincronizado llevando nuestros datos
          navigate('/juego-equipo', { state: { pinSala, nombreEquipo: equipoElegido, nombreJugador } });
        }
      } catch (error) {
        console.error("Error vigilando estado:", error);
      }
    }, 1500);

    return () => clearInterval(vigilarEstado);
  }, [unido, pinSala, equipoElegido, nombreJugador, navigate]);

  // ==========================================
  // RENDERIZADO VISUAL
  // ==========================================

  // VISTA A: EL JUGADOR YA SE UNIÓ Y ESTÁ ESPERANDO AL HOST
  if (unido) {
    return (
      <div className="equipo-container" style={{ justifyContent: 'center', textAlign: 'center', height: '80vh' }}>
        <h1 className="magenta-title" style={{ fontSize: '3rem', animation: 'pulso 2s infinite' }}>
          ¡CONECTADO!
        </h1>
        <h2 style={{ color: '#00f2ff', marginTop: '2rem' }}>Equipo: {equipoElegido}</h2>
        <h3 style={{ color: '#fff' }}>Jugador: {nombreJugador.toUpperCase()}</h3>
        <p style={{ color: '#aaa', marginTop: '3rem', fontSize: '1.2rem' }}>
          Mire la pantalla principal... el Host iniciará la partida pronto.
        </p>
      </div>
    );
  }

  // VISTA B: FORMULARIO DE INGRESO
  return (
    <div className="equipo-container" style={{ justifyContent: 'flex-start', paddingTop: '2rem' }}>
      <h2 className="magenta-title" style={{ textAlign: 'center', marginBottom: '2rem' }}>UNIRSE AL JUEGO</h2>
      {/* PASO 1: INGRESAR PIN */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
        <input 
          className="neon-input-magenta" 
          placeholder="PIN de 4 dígitos" 
          maxLength={4} 
          value={pinSala} 
          onChange={e => setPinSala(e.target.value)}
          style={{ flex: 2, textAlign: 'center', fontSize: '1.5rem', letterSpacing: '5px' }}
        />
        <button 
          className="neon-btn start-btn" 
          onClick={buscarSala}
          style={{ flex: 1, padding: '0', fontSize: '1rem' }}
        >
          BUSCAR
        </button>
      </div>

      {/* PASO 2: ELEGIR EQUIPO Y NOMBRE (Aparece solo si la sala existe) */}
      {infoSala && (
        <div style={{ marginTop: '1rem', width: '100%', animation: 'fadeIn 0.5s' }}>
          <input 
            className="neon-input-magenta" 
            placeholder="Tu Nombre / Apodo" 
            onChange={e => setNombreJugador(e.target.value)} 
            style={{ width: '100%', boxSizing: 'border-box', textAlign: 'center', marginBottom: '1.5rem' }}
          />

          <p style={{ color: '#00f2ff', textAlign: 'center', marginBottom: '1rem' }}>SELECCIONA TU BANDO:</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* BOTÓN EQUIPO A */}
            <button 
              onClick={() => setEquipoElegido(infoSala.equipoA.nombre)} 
              style={{ 
                padding: '1rem', borderRadius: '8px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s',
                // Lógica de colores dinámicos
                backgroundColor: equipoElegido === infoSala.equipoA.nombre ? '#00f2ff' : 'transparent',
                color: equipoElegido === infoSala.equipoA.nombre ? '#000' : '#00f2ff',
                border: '2px solid #00f2ff',
                boxShadow: equipoElegido === infoSala.equipoA.nombre ? '0 0 20px #00f2ff' : 'none'
              }}
            >
              {infoSala.equipoA.nombre} ({infoSala.equipoA.jugadores ? infoSala.equipoA.jugadores.length : 0}/5)
            </button>

            {/* BOTÓN EQUIPO B */}
            <button 
              onClick={() => setEquipoElegido(infoSala.equipoB.nombre)} 
              style={{ 
                padding: '1rem', borderRadius: '8px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s',
                // Lógica de colores dinámicos (Magenta)
                backgroundColor: equipoElegido === infoSala.equipoB.nombre ? '#ff00ff' : 'transparent',
                color: equipoElegido === infoSala.equipoB.nombre ? '#000' : '#ff00ff',
                border: '2px solid #ff00ff',
                boxShadow: equipoElegido === infoSala.equipoB.nombre ? '0 0 20px #ff00ff' : 'none'
              }}
            >
              {infoSala.equipoB.nombre} ({infoSala.equipoB.jugadores ? infoSala.equipoB.jugadores.length : 0}/5)
            </button>
          </div>
          <button 
            className="neon-btn start-btn" 
            style={{ width: '100%', marginTop: '2rem', padding: '1.5rem', fontSize: '1.2rem' }} 
            onClick={handleUnirse}
          >
            ¡ENTRAR A LA SALA DE ESPERA!
          </button>
        </div>
      )}
    </div>
  );
}

// --- COMPONENTE 4: TABLERO ACTIVO (Host) ---
function PantallaJuegoHost() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pinSala } = location.state || {};

  const [salaDB, setSalaDB] = useState(null);
  const [ronda, setRonda] = useState(null);
  
  const [reveladas, setReveladas] = useState([false, false, false, false, false]);
  const [strikes, setStrikes] = useState(0);
  const [fase, setFase] = useState('enfrentamiento');
  const [equipoControl, setEquipoControl] = useState(null);
  const [puntajesGlobales, setPuntajesGlobales] = useState({});

  const [intentoCaraACara, setIntentoCaraACara] = useState({});
  const [mensajeCaraACara, setMensajeCaraACara] = useState('');
  const [respuestasProcesadas, setRespuestasProcesadas] = useState(0); 

  useEffect(() => {
    if (!pinSala) { navigate('/'); return; }
    const cargarTablero = async () => {
      try {
        const cmd = new GetCommand({ TableName: "Partidas_100Mexicanos", Key: { pinSala: pinSala } });
        const res = await docClient.send(cmd);
        if (res.Item) {
          setSalaDB(res.Item);
          if (res.Item.rondaActiva) setRonda(res.Item.rondaActiva);
          if (res.Item.puntajesGlobales) setPuntajesGlobales(res.Item.puntajesGlobales);
        }
      } catch (error) { console.error("Error", error); }
    };
    cargarTablero();
  }, [pinSala, navigate]);

  const puntosRonda = ronda ? ronda.respuestas.reduce((total, resp, index) => reveladas[index] ? total + (resp.puntos || 0) : total, 0) : 0;
  const eqA = salaDB?.equipoA?.nombre;
  const eqB = salaDB?.equipoB?.nombre;
  
  const idxRonda = salaDB?.indiceRondaActual || 0;
  const jugadorA = salaDB?.equipoA?.jugadores[idxRonda % (salaDB.equipoA?.jugadores.length || 1)] || '';
  const jugadorB = salaDB?.equipoB?.jugadores[idxRonda % (salaDB.equipoB?.jugadores.length || 1)] || '';

  // NUEVO: Verificamos si esta es literalmente la última ronda
  const esFinDeJuego = fase === 'resumen' && salaDB && (salaDB.indiceRondaActual + 1 >= salaDB.rondas.length);

  // CORRECCIÓN DE BUG: Ahora calculamos usando las cartas EXACTAS de este instante
  const asignarPuntosAuto = async (equipoGanador, nuevasReveladas) => {
    const puntosCalculados = ronda.respuestas.reduce((total, resp, index) =>
      nuevasReveladas[index] ? total + (resp.puntos || 0) : total
    , 0);

    const nuevosPuntajes = { ...puntajesGlobales, [equipoGanador]: (puntajesGlobales[equipoGanador] || 0) + puntosCalculados };
    try {
      await docClient.send(new UpdateCommand({
        TableName: "Partidas_100Mexicanos", Key: { pinSala: pinSala },
        UpdateExpression: "SET puntajesGlobales = :pts",
        ExpressionAttributeValues: { ":pts": nuevosPuntajes }
      }));
      setPuntajesGlobales(nuevosPuntajes);
      setFase('resumen'); 
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (!ronda || !pinSala) return;

    const motorDeJuego = async () => {
      try {
        const res = await docClient.send(new GetCommand({ TableName: "Partidas_100Mexicanos", Key: { pinSala } }));
        if (res.Item && res.Item.intentoAdivinar) {
          const { equipo, texto } = res.Item.intentoAdivinar;
          let aciertoIndex = -1;
          ronda.respuestas.forEach((resp, index) => {
            if (resp.texto && resp.texto.trim().toUpperCase() === texto && !reveladas[index]) aciertoIndex = index;
          });
          
          if (fase === 'enfrentamiento') {
            if (aciertoIndex === 0) {
              const nuevas = [...reveladas]; nuevas[0] = true;
              setReveladas(nuevas);
              setEquipoControl(equipo);
              setFase('control');
              setMensajeCaraACara('');
              setIntentoCaraACara({});
              setRespuestasProcesadas(p => p + 1);
            } else {
              if (!intentoCaraACara.equipo) {
                if (aciertoIndex !== -1) setReveladas(prev => { const n = [...prev]; n[aciertoIndex] = true; return n; });
                setIntentoCaraACara({ equipo, index: aciertoIndex });
                setMensajeCaraACara(`Respuesta registrada. Esperando al equipo contrario...`);
              } else {
                if (aciertoIndex !== -1) setReveladas(prev => { const n = [...prev]; n[aciertoIndex] = true; return n; });
                
                let idx1 = intentoCaraACara.index; 
                let idx2 = aciertoIndex;

                if (idx1 === -1 && idx2 === -1) {
                  setMensajeCaraACara("❌ AMBOS FALLARON ❌");
                  setIntentoCaraACara({});
                  setRespuestasProcesadas(p => p + 1); 
                } else {
                  let rank1 = idx1 === -1 ? 999 : idx1;
                  let rank2 = idx2 === -1 ? 999 : idx2;
                  
                  setEquipoControl(rank1 < rank2 ? intentoCaraACara.equipo : equipo);
                  setFase('control');
                  setMensajeCaraACara('');
                  setIntentoCaraACara({});
                  setRespuestasProcesadas(p => p + 1); 
                }
              }
            }
          } 
          else if (fase === 'control' && equipo === equipoControl) {
            if (aciertoIndex !== -1) {
              const nuevasReveladas = [...reveladas];
              nuevasReveladas[aciertoIndex] = true;
              setReveladas(nuevasReveladas);
              
              let todasDescubiertas = true;
              ronda.respuestas.forEach((r, i) => { if (r.texto && !nuevasReveladas[i]) todasDescubiertas = false; });
              if (todasDescubiertas) asignarPuntosAuto(equipoControl, nuevasReveladas);
              
              setRespuestasProcesadas(p => p + 1); 
            } else {
              setStrikes(prev => {
                if (prev + 1 >= 3) setFase('robo');
                return prev + 1;
              });
              setRespuestasProcesadas(p => p + 1); 
            }
          }
          else if (fase === 'robo' && equipo !== equipoControl) {
            if (aciertoIndex !== -1) {
              const nuevasReveladas = [...reveladas];
              nuevasReveladas[aciertoIndex] = true;
              setReveladas(nuevasReveladas);
              // ROBO EXITOSO: Pasamos el arreglo nuevo para que sume la palabra adivinada
              asignarPuntosAuto(equipo, nuevasReveladas); 
            } else {
              // ROBO FALLIDO: El equipo original se queda los puntos actuales
              asignarPuntosAuto(equipoControl, reveladas); 
            }
            setRespuestasProcesadas(p => p + 1); 
          }

          await docClient.send(new UpdateCommand({
            TableName: "Partidas_100Mexicanos", Key: { pinSala }, UpdateExpression: "REMOVE intentoAdivinar"
          }));
        }
      } catch (e) { console.error(e); }
    };
    const radar = setInterval(motorDeJuego, 1000);
    return () => clearInterval(radar);
  }, [pinSala, ronda, fase, equipoControl, reveladas, intentoCaraACara, puntajesGlobales]);

  useEffect(() => {
    if (!pinSala) return;
    const compartirTablero = async () => {
      try {
        await docClient.send(new UpdateCommand({
          TableName: "Partidas_100Mexicanos", Key: { pinSala },
          UpdateExpression: "SET tablero = :tab",
          // ENVIAMOS LA BANDERA DE FIN DE JUEGO A LOS CELULARES
          ExpressionAttributeValues: { ":tab": { reveladas, strikes, fase, equipoControl, jugadorA, jugadorB, mensajeCaraACara, respuestasProcesadas, esFinDeJuego } }
        }));
      } catch (error) { console.error(error); }
    };
    compartirTablero();
  }, [reveladas, strikes, fase, equipoControl, pinSala, jugadorA, jugadorB, mensajeCaraACara, respuestasProcesadas, esFinDeJuego]);

  const avanzarSiguienteRonda = async () => {
    const nextIdx = salaDB.indiceRondaActual + 1;
    if (nextIdx < salaDB.rondas.length) {
      const nextRonda = salaDB.rondas[nextIdx];
      try {
        await docClient.send(new UpdateCommand({
          TableName: "Partidas_100Mexicanos", Key: { pinSala },
          UpdateExpression: "SET indiceRondaActual = :idx, rondaActiva = :ra",
          ExpressionAttributeValues: { ":idx": nextIdx, ":ra": nextRonda }
        }));
        
        setSalaDB({ ...salaDB, indiceRondaActual: nextIdx });
        setRonda(nextRonda);
        setReveladas([false, false, false, false, false]);
        setStrikes(0);
        setFase('enfrentamiento');
        setEquipoControl(null);
        setRespuestasProcesadas(p => p + 1); 
      } catch (e) { console.error(e); }
    }
  };

  if (!ronda) return <h2 className="magenta-title text-center" style={{marginTop: '20vh'}}>Cargando...</h2>;

  return (
    <div className="host-container sin-scroll" style={{ height: '95vh', justifyContent: 'flex-start', paddingTop: '1rem' }}>
      <div style={{ backgroundColor: '#111', padding: '10px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', border: '1px solid #ff00ff' }}>
        <div>
          <span style={{ color: '#00f2ff', fontWeight: 'bold' }}>FASE: </span>
          <span style={{ color: '#fff', textTransform: 'uppercase' }}>{fase === 'control' ? `CONTROL DE ${equipoControl}` : fase}</span>
        </div>
        
        {fase === 'enfrentamiento' && <span style={{color: '#ff00ff', fontWeight: 'bold'}}>⚔️ {jugadorA} VS {jugadorB} ⚔️</span>}
        {mensajeCaraACara && <span style={{color: '#ffff00', animation: 'pulso 1s infinite'}}>{mensajeCaraACara}</span>}
        
        {fase === 'resumen' && (
          !esFinDeJuego ? 
          <button className="start-btn neon-btn" onClick={avanzarSiguienteRonda} style={{padding: '5px 15px'}}>Siguiente Ronda ({salaDB.indiceRondaActual + 2}/{salaDB.rondas.length}) ➡</button> :
          <span style={{ color: '#ff0000', fontWeight: 'bold', fontSize: '1.2rem', animation: 'pulso 1s infinite' }}>🏆 FIN DE PARTIDA 🏆</span>
        )}
      </div>

      <div style={{ textAlign: 'center', padding: '0 1rem', marginBottom: '1rem' }}>
        <h2 style={{ color: '#fff', fontSize: 'clamp(1.5rem, 4vh, 2.5rem)', textShadow: '0 0 15px #00f2ff', margin: 0, lineHeight: '1.2' }}>{ronda.pregunta}</h2>
      </div>

      <div className="tablero-grid" style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(0.5rem, 1.5vh, 1rem)', maxWidth: '800px', margin: '0 auto', width: '100%', padding: '0 1rem' }}>
        {ronda.respuestas.map((resp, index) => {
          if (!resp.texto) return null; 
          const revelada = reveladas[index];
          const mostrarFaltante = fase === 'resumen' && !revelada; 

          return (
            <div key={index} className={`casilla-respuesta ${revelada || mostrarFaltante ? 'revelada' : 'oculta'}`} 
                 style={mostrarFaltante ? { backgroundColor: '#330033', borderColor: '#555', boxShadow: 'none' } : {}}>
              <div className="casilla-frente"><span className="casilla-numero">{index + 1}</span></div>
              <div className="casilla-dorso" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '0 2rem' }}>
                <span className="respuesta-texto" style={mostrarFaltante ? { color: '#aaa', textShadow: 'none' } : {}}>{resp.texto}</span>
                <span className="respuesta-puntos" style={mostrarFaltante ? { color: '#aaa', textShadow: 'none' } : {}}>{resp.puntos}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
        {[1, 2, 3].map((num) => (<div key={num} className={`strike-box ${num <= strikes ? 'strike-activo' : ''}`}>X</div>))}
      </div>

      <div style={{ backgroundColor: '#0a0a0a', border: '1px solid #ff00ff', borderRadius: '10px', padding: '1rem', marginTop: '2rem', textAlign: 'center' }}>
        <h3 style={{ color: '#ff00ff', margin: 0, letterSpacing: '2px' }}>BANCO ACUMULADO DE LA RONDA: {puntosRonda} pts</h3>
      </div>
    </div>
  );
}

// --- COMPONENTE 5: ZONA DE RESPUESTAS (Equipo) ---
function PantallaJuegoEquipo() {
  const location = useLocation();
  const { pinSala, nombreEquipo, nombreJugador } = location.state || {};
  
  const [ronda, setRonda] = useState(null);
  const [tablero, setTablero] = useState({ reveladas: [], strikes: 0, fase: 'enfrentamiento', equipoControl: null, jugadorA: '', jugadorB: '', mensajeCaraACara: '', respuestasProcesadas: 0, esFinDeJuego: false });
  
  const [respuesta, setRespuesta] = useState('');
  const [enviado, setEnviado] = useState(false);
  
  const [ultimoProcesadoLocal, setUltimoProcesadoLocal] = useState(0); 
  const [idRondaActual, setIdRondaActual] = useState(''); 
  
  // AHORA GUARDAMOS TODOS LOS PUNTAJES PARA PODER COMPARARLOS AL FINAL
  const [puntajesGlobales, setPuntajesGlobales] = useState({});

  // RADAR DEL JUGADOR
  useEffect(() => {
    if (!pinSala) return;
    const radar = setInterval(async () => {
      try {
        const cmd = new GetCommand({ TableName: "Partidas_100Mexicanos", Key: { pinSala }});
        const res = await docClient.send(cmd);
        if (res.Item) {
          if (res.Item.rondaActiva) {
            setRonda(res.Item.rondaActiva);
            if (res.Item.rondaActiva.pregunta !== idRondaActual) {
              setEnviado(false);
              setRespuesta('');
              setIdRondaActual(res.Item.rondaActiva.pregunta);
            }
          }
          if (res.Item.tablero) {
            setTablero(res.Item.tablero);
            if (res.Item.tablero.respuestasProcesadas !== ultimoProcesadoLocal) {
              setEnviado(false); 
              setRespuesta(''); 
              setUltimoProcesadoLocal(res.Item.tablero.respuestasProcesadas); 
            }
          }
          if (res.Item.puntajesGlobales) {
            setPuntajesGlobales(res.Item.puntajesGlobales);
          }
        }
      } catch (error) { console.error("Error radar", error); }
    }, 1000);
    return () => clearInterval(radar);
  }, [pinSala, nombreEquipo, ultimoProcesadoLocal, idRondaActual]);

  const enviarRespuesta = async (e) => {
    e.preventDefault();
    if (!respuesta.trim()) return;
    try {
      await docClient.send(new UpdateCommand({
        TableName: "Partidas_100Mexicanos", Key: { pinSala },
        UpdateExpression: "SET intentoAdivinar = :resp",
        ExpressionAttributeValues: { ":resp": { equipo: nombreEquipo, texto: respuesta.trim().toUpperCase() } }
      }));
      setEnviado(true);
    } catch (error) { console.error(error); }
  };

  if (!pinSala || !ronda) return <h2 className="magenta-title" style={{marginTop: '20vh'}}>Sincronizando...</h2>;

  // ==========================================
  // PANTALLA DE VICTORIA (INTERCEPCIÓN DE FIN DE JUEGO)
  // ==========================================
  if (tablero.esFinDeJuego) {
    const equiposNombres = Object.keys(puntajesGlobales);
    let eq1 = equiposNombres[0] || 'Equipo A';
    let eq2 = equiposNombres[1] || 'Equipo B';
    let pts1 = puntajesGlobales[eq1] || 0;
    let pts2 = puntajesGlobales[eq2] || 0;
    
    let ganador = eq1; let ptsGanador = pts1;
    let perdedor = eq2; let ptsPerdedor = pts2;
    let empate = false;

    // Lógica para descubrir quién ganó
    if (pts2 > pts1) { ganador = eq2; ptsGanador = pts2; perdedor = eq1; ptsPerdedor = pts1; }
    else if (pts1 === pts2) { empate = true; }

    return (
      <div className="equipo-container sin-scroll" style={{ justifyContent: 'center', height: '100vh', textAlign: 'center' }}>
        <h1 style={{ color: '#ffd700', fontSize: '3rem', animation: 'pulso 2s infinite', textShadow: '0 0 20px #ffd700', margin: 0 }}>
          🏆 FIN DE PARTIDA 🏆
        </h1>
        
        <div style={{ backgroundColor: '#111', padding: '2rem', borderRadius: '15px', border: '2px solid #ff00ff', marginTop: '3rem', boxShadow: '0 0 30px rgba(255, 0, 255, 0.3)' }}>
          {empate ? (
            <h2 style={{ color: '#00f2ff', fontSize: '2rem', margin: 0 }}>¡ES UN EMPATE!<br/><br/><span style={{fontSize: '3rem'}}>{ptsGanador} pts</span></h2>
          ) : (
            <>
              <h2 style={{ color: '#00ff00', fontSize: '2.5rem', margin: '0 0 1rem 0', textShadow: '0 0 15px #00ff00' }}>
                🥇 {ganador}<br/>{ptsGanador} pts
              </h2>
              <hr style={{ borderColor: '#333', margin: '1.5rem 0' }} />
              <h3 style={{ color: '#ff0000', fontSize: '1.5rem', margin: 0 }}>
                💀 {perdedor}<br/>{ptsPerdedor} pts
              </h3>
            </>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // PANTALLA NORMAL DE JUEGO
  // ==========================================
  const puntosRonda = ronda.respuestas.reduce((total, resp, index) => tablero.reveladas[index] ? total + (resp.puntos || 0) : total, 0);

  // MÁQUINA DE ESTADOS LOCAL
  let esMiTurno = false;
  let mensajeEstado = "";

  if (tablero.fase === 'enfrentamiento') {
    const miNombreMayusculas = nombreJugador ? nombreJugador.toUpperCase() : '';
    esMiTurno = (miNombreMayusculas === tablero.jugadorA || miNombreMayusculas === tablero.jugadorB);

    if (esMiTurno) {
      if (tablero.mensajeCaraACara === "❌ AMBOS FALLARON ❌") {
        mensajeEstado = tablero.mensajeCaraACara;
      } else if (enviado) {
        mensajeEstado = "Respuesta registrada. Esperando al oponente...";
      } else {
        mensajeEstado = "¡ES TU TURNO EN EL CARA A CARA!";
      }
    } else {
      mensajeEstado = `CARA A CARA: ${tablero.jugadorA} vs ${tablero.jugadorB}`;
    }

  } else if (tablero.fase === 'control') {
    esMiTurno = (nombreEquipo === tablero.equipoControl);
    mensajeEstado = esMiTurno ? "¡ES TURNO DE TU EQUIPO!" : `TURNO DE ${tablero.equipoControl}`;
  } else if (tablero.fase === 'robo') {
    esMiTurno = (nombreEquipo !== tablero.equipoControl);
    mensajeEstado = esMiTurno ? "🚨 ¡OPORTUNIDAD DE ROBO! 🚨" : "EL EQUIPO RIVAL INTENTA ROBAR...";
  } else if (tablero.fase === 'resumen') {
    esMiTurno = false;
    mensajeEstado = "🏁 RONDA TERMINADA - ESPERANDO AL HOST 🏁";
  }

  return (
    <div className="equipo-container sin-scroll" style={{ justifyContent: 'flex-start', paddingTop: '1rem', height: '100vh', paddingBottom: '2rem' }}>
      
      {/* HEADER DE PUNTOS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #ff00ff', paddingBottom: '0.5rem' }}>
        <div style={{ textAlign: 'left' }}>
          <h3 style={{ color: '#00f2ff', margin: 0 }}>{nombreEquipo}</h3>
          <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 'bold' }}>TOTAL: <span style={{ color: '#00f2ff' }}>{puntajesGlobales[nombreEquipo] || 0} pts</span></span>
        </div>
        <h3 style={{ color: '#ff00ff', margin: 0 }}>Ronda: {puntosRonda} pts</h3>
      </div>

      {/* ¡LA PREGUNTA HA VUELTO! */}
      <div style={{ textAlign: 'center', marginBottom: '1rem', padding: '0 10px' }}>
        <h2 style={{ color: '#fff', fontSize: '1.2rem', margin: 0, textShadow: '0 0 10px #00f2ff' }}>
          {ronda.pregunta}
        </h2>
      </div>

      {/* CAJA DE MENSAJES DE ESTADO */}
      <div style={{ textAlign: 'center', marginBottom: '1rem', backgroundColor: esMiTurno ? '#0a2a0a' : '#2a0a0a', padding: '10px', borderRadius: '8px', border: `1px solid ${esMiTurno ? '#00ff00' : '#ff0000'}` }}>
        <h4 style={{ color: esMiTurno ? '#00ff00' : '#ff0000', margin: 0, animation: tablero.mensajeCaraACara ? 'pulso 1s infinite' : 'none' }}>
          {mensajeEstado}
        </h4>
      </div>

      {/* STRIKES */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', marginBottom: '1rem' }}>
        {[1, 2, 3].map(num => (<span key={num} style={{ fontSize: '1.5rem', color: num <= tablero.strikes ? '#ff0000' : '#333', fontWeight: 'bold' }}>X</span>))}
      </div>

      {/* TABLERO CELULAR */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '2rem', flexGrow: 1, overflowY: 'auto' }} className="banco-scroll">
        {ronda.respuestas.map((resp, index) => {
          if (!resp.texto) return null;
          const revelada = tablero.reveladas[index];
          const mostrarFaltante = tablero.fase === 'resumen' && !revelada;

          return (
            <div key={index} style={{ 
              display: 'flex', justifyContent: 'space-between', padding: '10px 15px', 
              backgroundColor: revelada ? '#00f2ff' : (mostrarFaltante ? '#330033' : '#0a0a0a'), 
              color: revelada ? '#000' : (mostrarFaltante ? '#aaa' : '#00f2ff'),
              border: `1px solid ${revelada ? '#00f2ff' : (mostrarFaltante ? '#555' : '#333')}`, 
              borderRadius: '5px', fontWeight: 'bold'
            }}>
              <span>{revelada || mostrarFaltante ? resp.texto : index + 1}</span>
              <span>{revelada || mostrarFaltante ? resp.puntos : '--'}</span>
            </div>
          );
        })}
      </div>

      {/* FORMULARIO */}
      <form onSubmit={enviarRespuesta} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
        <input type="text" className="neon-input-magenta" placeholder={esMiTurno ? "Escribe aquí..." : "Espera tu turno..."}
          value={respuesta} onChange={(e) => setRespuesta(e.target.value)} disabled={enviado || !esMiTurno}
          style={{ fontSize: '1.2rem', padding: '1rem', textAlign: 'center', opacity: esMiTurno ? 1 : 0.5 }}
        />
        <button type="submit" className={`neon-btn ${esMiTurno ? 'start-btn' : 'start-btn-disabled'}`} disabled={enviado || !esMiTurno || !respuesta.trim()} style={{ padding: '1rem', fontSize: '1.1rem' }}>
          {enviado ? "RESPUESTA REGISTRADA" : "ENVIAR RESPUESTA"}
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