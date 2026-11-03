// main.jsx: punto de entrada. Carga los estilos y dibuja la aplicación dentro de <div id="root"> (src/index.html)
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import App from './App.jsx';

// StrictMode ayuda a detectar errores mientras se desarrolla (no cambia nada en el panel final)
createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>);
