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
          <p className="card-desc">Ingresa el PIN de la sala en tu celular para ir a la zona de votación.</p>
          <input
            type="text"
            placeholder="PIN DE SALA (Ej. 1234)"
            className="neon-input"
          />
          <button onClick={() => navigate('/votacion')} className="neon-btn join-btn">
            Entrar a Votar
          </button>
        </div>

      </div>
    </div>
  );
}

// --- COMPONENTES TEMPORALES (Para que no marque error al navegar) ---
function PantallaTablero() {
  const navigate = useNavigate();
  return (
    <div className="text-center p-10">
      <h1 className="text-5xl text-[#00f2ff] font-bold mb-8">🖥️ TABLERO PRINCIPAL</h1>
      <button onClick={() => navigate('/')} className="text-[#ff00ff] underline">Volver al Lobby</button>
    </div>
  );
}

function PantallaVotacion() {
  const navigate = useNavigate();
  return (
    <div className="text-center p-10">
      <h1 className="text-5xl text-[#ff00ff] font-bold mb-8">📱 ZONA DE VOTACIÓN</h1>
      <button onClick={() => navigate('/')} className="text-[#00f2ff] underline">Volver al Lobby</button>
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