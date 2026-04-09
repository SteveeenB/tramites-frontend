import React from 'react';
import './TramitesSidebar.css';

const TramitesSidebar = ({ items = [], seleccionado, onSeleccionar }) => {
  return (
    <aside className="tramites-sidebar">
      <h3 className="tramites-sidebar-title">Tramites</h3>
      <ul className="tramites-menu">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={`tramites-menu-btn ${seleccionado === item.id ? 'active' : ''}`}
              onClick={() => onSeleccionar(item)}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default TramitesSidebar;
