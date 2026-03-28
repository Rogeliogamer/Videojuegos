import { Authenticator } from '@aws-amplify/ui-react';
// 1. PRIMERO importamos los estilos genéricos de Amazon
import '@aws-amplify/ui-react/styles.css'; 

// 2. DESPUÉS importamos TU estilo para que sobrescriba al de Amazon
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

function App() {
  return (
    // Pasamos los campos personalizados al componente
    <Authenticator formFields={formFields}>
      {({ signOut, user }) => (
        <main className="min-h-screen bg-blue-900 text-white p-8">
          <header className="flex justify-between items-center mb-12">
            <h1 className="text-3xl font-bold italic">100 MEXICANOS DIJERON</h1>
            
            <div className="flex items-center gap-4">
              <span className="bg-blue-700 px-4 py-2 rounded-full text-sm">
                {/* Ahora podemos usar el nombre que guardamos */}
                Hola, {user?.userId.preferred_username || user?.signInDetails?.loginId || 'Jugador'}
              </span>
              <button 
                onClick={signOut}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded font-bold transition"
              >
                Cerrar Sesión
              </button>
            </div>
          </header>

          <section className="max-w-4xl mx-auto text-center">
            <div className="bg-yellow-500 text-blue-900 p-10 rounded-xl shadow-2xl border-4 border-white">
              <h2 className="text-4xl font-black mb-4 uppercase">¡Bienvenidos al Tablero!</h2>
              <p className="text-xl">Autenticación exitosa en AWS Cognito.</p>
            </div>
          </section>
        </main>
      )}
    </Authenticator>
  );
}

export default App;