import api from '../api/client.js';

class AuthState {
  constructor() {
    this.token = localStorage.getItem('token');
    this.user = this.loadStoredUser();
  }

  loadStoredUser() {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  decodeJwt(token) {
    if (!token) return null;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch (err) {
      console.error('Failed to parse JWT payload', err);
      return null;
    }
  }

  isAuthenticated() {
    if (!this.token) return false;
    if (this.token.startsWith('demo-') || this.token === 'mock-jwt-token') {
      return !!this.user;
    }
    const decoded = this.decodeJwt(this.token);
    if (!decoded || !decoded.exp) return !!this.user;
    const isExpired = decoded.exp * 1000 < Date.now();
    if (isExpired) {
      this.logout();
      return false;
    }
    return true;
  }

  setSession({ token, user }) {
    this.token = token || 'demo-jwt-token';
    const roles = user?.roles || (user?.role ? [user.role] : ['ROLE_CLIENTE']);
    this.user = user ? { ...user, roles } : { username: 'usuario', roles: ['ROLE_CLIENTE'] };
    localStorage.setItem('token', this.token);
    localStorage.setItem('user', JSON.stringify(this.user));
    this.notifyChange();
    return this.user;
  }

  getUser() {
    return this.user;
  }

  getRoles() {
    if (this.user?.roles && Array.isArray(this.user.roles)) return this.user.roles;
    if (this.user?.role) return [this.user.role];
    const decoded = this.decodeJwt(this.token);
    return decoded?.roles || [];
  }

  hasRole(roleName) {
    const roles = this.getRoles();
    const cleanRole = roleName.startsWith('ROLE_') ? roleName : `ROLE_${roleName}`;
    return roles.includes(cleanRole) || roles.includes(roleName);
  }

  isAdmin() {
    return this.hasRole('ADMIN') || this.hasRole('ROLE_ADMIN');
  }

  isProvider() {
    return this.hasRole('PROVEEDOR') || this.hasRole('ROLE_PROVEEDOR');
  }

  isClient() {
    return this.hasRole('CLIENTE') || this.hasRole('ROLE_CLIENTE');
  }

  async login(identifier, password) {
    const isEmail = identifier && identifier.includes('@');
    const email = isEmail ? identifier : `${identifier}@opusrentals.com`;
    const res = await api.post('/auth/login', { 
      email, 
      username: identifier, 
      password 
    });
    
    if (!res || !res.token) {
      throw new Error('Respuesta de autenticación inválida: no se recibió token');
    }

    this.token = res.token;
    localStorage.setItem('token', this.token);

    // Format roles array (e.g. ROLE_CLIENT -> ROLE_CLIENTE compatibility)
    const rawRole = res.role || 'ROLE_CLIENT';
    const normalizedRole = rawRole === 'ROLE_CLIENT' ? 'ROLE_CLIENTE' : (rawRole === 'ROLE_PROVIDER' ? 'ROLE_PROVEEDOR' : rawRole);
    const roles = [normalizedRole, rawRole];

    this.user = {
      id: res.userId || res.profileId || 1,
      username: res.displayName || identifier,
      email: res.email || email,
      roles: roles,
      profile: {
        id: res.profileId || res.userId || 1,
        fullName: res.displayName,
        companyName: res.displayName
      }
    };

    // Optionally enrich with /users/me
    try {
      const me = await api.get('/users/me');
      if (me) {
        this.user = {
          ...this.user,
          id: me.userId || me.id || this.user.id,
          username: me.displayName || me.firstName ? `${me.firstName} ${me.lastName || ''}`.trim() : this.user.username,
          email: me.email || this.user.email,
          profile: {
            ...this.user.profile,
            id: me.clientId || me.providerId || this.user.profile.id,
            fullName: me.firstName ? `${me.firstName} ${me.lastName || ''}`.trim() : this.user.username,
            companyName: me.companyName || this.user.profile.companyName,
            phone: me.phone,
            taxId: me.documentNumber || me.taxId
          }
        };
      }
    } catch (e) {
      // Keep res profile
    }

    localStorage.setItem('user', JSON.stringify(this.user));
    this.notifyChange();
    return this.user;
  }

  async register({ username, email, password, roles, role, fullName, phone, companyName, taxId }) {
    const finalRole = role || (roles && roles[0]) || 'ROLE_CLIENTE';
    const isClientRole = finalRole === 'ROLE_CLIENTE' || finalRole === 'ROLE_CLIENT';
    const cleanEmail = email || (username?.includes('@') ? username : `${username}@${isClientRole ? 'cliente.com' : 'proveedor.com'}`);

    if (isClientRole) {
      const parts = (fullName || username || 'Cliente').split(' ');
      const firstName = parts[0] || 'Cliente';
      const lastName = parts.slice(1).join(' ') || 'General';
      const res = await api.post('/auth/register/client', {
        email: cleanEmail,
        password,
        firstName,
        lastName,
        documentType: 'CC',
        documentNumber: taxId || String(Date.now()).slice(-8),
        phone: phone || '3001234567',
        address: 'Bogota, Colombia'
      });
      if (res && res.token) {
        return this.setSession({ token: res.token, user: res });
      }
    } else {
      const res = await api.post('/auth/register/provider', {
        email: cleanEmail,
        password,
        companyName: companyName || fullName || username || 'Empresa Maquinaria SAS',
        taxId: taxId || `NIT-900${Date.now().toString().slice(-6)}-1`,
        address: 'Zona Industrial, Colombia'
      });
      if (res && res.token) {
        return this.setSession({ token: res.token, user: res });
      }
    }

    // Fallback: log in explicitly if no token directly returned
    return await this.login(cleanEmail, password);
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.notifyChange();
  }

  notifyChange() {
    window.dispatchEvent(new CustomEvent('auth:change', { detail: { user: this.user } }));
  }
}

export const auth = new AuthState();
export default auth;
