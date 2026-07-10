import { memo } from 'react';
import { Link } from 'react-router-dom';

const NavLink = memo(({ to, isActive, onNavigate, children, badge }) => (
  <li className={isActive ? "activo" : ""}>
    <Link to={to} className="navMenu-link" onClick={() => onNavigate(to)}>
      {children}
      {badge > 0 && (
        <span className="nav-badge-pendientes" title={`${badge} imagen${badge !== 1 ? "es" : ""} por aprobar`}>
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  </li>
));
NavLink.displayName = 'NavLink';

export default NavLink;
