import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import '@aws-amplify/ui-react/styles.css';

// Importamos la configuración y la librería
import { Amplify } from 'aws-amplify';
import awsConfig from './aws-config';

// Configuramos Amplify
Amplify.configure(awsConfig);
ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);