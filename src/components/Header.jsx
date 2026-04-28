import { Link } from 'react-router-dom';

function Header() {
  return (
    <header>
      <nav>
        <ul>
          <li><Link to="/">Inicio</Link></li>
          <li><Link to="/formNombre">Formulario de Nombre</Link></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;