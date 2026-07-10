import { memo } from 'react';
import { Link } from 'react-router-dom';
import { optimizeCloudinary } from '../../utils/cloudinary';

const UserAvatar = memo(({ user, onNavigate }) => (
  <Link
    to="/perfil"
    className="navUsuario-link"
    onClick={() => onNavigate('/perfil')}
  >
    <div className="nav-avatar-mini">
      {user.avatar && !user.avatar.includes('googleusercontent.com') ? (
        <img src={optimizeCloudinary(user.avatar, 'q_auto,f_auto,w_64')} alt={user.name} className="nav-avatar-img"
          width="32" height="32" decoding="async"
          referrerPolicy="no-referrer" crossOrigin="anonymous"
          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
        />
      ) : null}
      <div className="nav-avatar-iniciales"
        style={{ display: user.avatar && !user.avatar.includes('googleusercontent.com') ? 'none' : 'flex' }}>
        {user.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
      </div>
    </div>
    <span className="nav-nombre">{user.name?.split(' ')[0]}</span>
  </Link>
));
UserAvatar.displayName = 'UserAvatar';

export default UserAvatar;
