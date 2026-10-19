import api from '../api/client.js';

class AuthState {
  constructor() {
    this.token = localStorage.getItem('token');
    this.user = this.loadStoredUser();
  }

  loadStoredUser() {
    try {
      const stored = localStorage.getItem('user');
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      if (parsed) {
        if (!parsed.username || parsed.username === 'undefined') {
          parsed.username = (parsed.displayName && parsed.displayName !== 'undefined')
            ? parsed.displayName
            : (parsed.fullName && parsed.fullName !== 'undefined'
                ? parsed.fullName
                : (parsed.email ? parsed.email.split('@')[0] : 'Usuario'));
        }
        if (!parsed.displayName || parsed.displayName === 'undefined') {
          parsed.displayName = parsed.username;
        }
      }
      return parsed;
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
    const rawRole = user?.role || (user?.roles && user.roles[0]) || 'ROLE_CLIENT';
    const normalizedRole = rawRole === 'ROLE_CLIENT' ? 'ROLE_CLIENTE' : (rawRole === 'ROLE_PROVIDER' ? 'ROLE_PROVEEDOR' : rawRole);
    const roles = user?.roles || [normalizedRole, rawRole];

    const computedName = (user?.displayName && user.displayName !== 'undefined')
      ? user.displayName
      : ((user?.fullName && user.fullName !== 'undefined')
          ? user.fullName
          : ((user?.username && user.username !== 'undefined')
              ? user.username
              : (user?.email ? user.email.split('@')[0] : 'Usuario')));

    this.user = user ? { 
      ...user,
      id: user.userId || user.id || 1,
      username: computedName,
      displayName: computedName,
      fullName: user.fullName || computedName,
      email: user.email || '',
      roles: roles,
      profile: {
        id: user.profileId || user.userId || user.id || 1,
        fullName: computedName,
        companyName: computedName,
        ...(user.profile || {})
      }
    } : { username: 'usuario', displayName: 'Usuario', roles: ['ROLE_CLIENTE'] };

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
    return this.hasRole('PROVEEDOR') || this.hasRole('ROLE_PROVEEDOR') || this.hasRole('PROVIDER') || this.hasRole('ROLE_PROVIDER');
  }

  isClient() {
    return this.hasRole('CLIENTE') || this.hasRole('ROLE_CLIENTE') || this.hasRole('CLIENT') || this.hasRole('ROLE_CLIENT');
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

  async register({ username, email, password, roles, role, fullName, phone, companyName, taxId, documentType, documentNumber, address, city }) {
    const finalRole = role || (roles && roles[0]) || 'ROLE_CLIENTE';
    const isClientRole = finalRole === 'ROLE_CLIENTE' || finalRole === 'ROLE_CLIENT';
    const cleanEmail = email || (username?.includes('@') ? username : `${username}@${isClientRole ? 'cliente.com' : 'proveedor.com'}`);
    const resolvedPhone = phone || '3001234567';
    const resolvedAddress = address ? (city ? `${address}, ${city}` : address) : (city ? `Zona Central, ${city}` : 'Bogota, Colombia');

    if (isClientRole) {
      const parts = (fullName || username || 'Cliente').split(' ');
      const firstName = parts[0] || 'Cliente';
      const lastName = parts.slice(1).join(' ') || 'General';
      const docType = documentType || 'CC';
      const docNum = documentNumber || taxId || String(Date.now()).slice(-8);

      const res = await api.post('/auth/register/client', {
        email: cleanEmail,
        password,
        firstName,
        lastName,
        documentType: docType,
        documentNumber: docNum,
        phone: resolvedPhone,
        address: resolvedAddress
      });
      if (res && res.token) {
        return this.setSession({ 
          token: res.token, 
          user: {
            ...res,
            displayName: res.displayName || fullName || `${firstName} ${lastName}`,
            fullName: fullName || res.displayName || `${firstName} ${lastName}`,
            username: fullName || res.displayName || username || cleanEmail.split('@')[0],
            phone: resolvedPhone,
            address: resolvedAddress
          } 
        });
      }
    } else {
      const provName = companyName || fullName || username || 'Empresa Maquinaria SAS';
      const rawTaxId = (taxId || documentNumber || `${Date.now().toString().slice(-8)}-1`);
      const provTaxId = rawTaxId.replace(/^NIT\s*[-:]?\s*/i, '').trim();

      const res = await api.post('/auth/register/provider', {
        email: cleanEmail,
        password,
        companyName: provName,
        taxId: provTaxId,
        address: resolvedAddress,
        contacts: [{ contactType: 'PHONE', contactValue: resolvedPhone }],
        coverageZones: [{ state: 'Cundinamarca', city: city || 'Bogotá' }]
      });
      if (res && res.token) {
        return this.setSession({ 
          token: res.token, 
          user: {
            ...res,
            role: res.role || 'ROLE_PROVIDER',
            roles: [res.role || 'ROLE_PROVIDER'],
            displayName: res.displayName || provName,
            fullName: provName,
            username: provName,
            phone: resolvedPhone,
            address: resolvedAddress
          } 
        });
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
