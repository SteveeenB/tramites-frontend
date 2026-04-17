import React from 'react';
import './Sidebar.css';
import { getMenuByRole } from '../config/menuConfig';

const Sidebar = ({ role, selectedId, onSelect }) => {
  const menuItems = getMenuByRole(role);

  return (
    <aside className="role-sidebar">
      <h3 className="role-sidebar-title">Menu de {role}</h3>
      <ul className="role-sidebar-list">
        {menuItems.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={`role-sidebar-btn ${selectedId === item.id ? 'active' : ''}`}
              onClick={() => onSelect(item)}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;