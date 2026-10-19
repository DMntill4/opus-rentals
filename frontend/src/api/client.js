import { mockCategories, mockTools, mockRequests, mockAdminUsers, mockAdminKpis } from './mock-store.js';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

// Control flag: Attempt live Spring Boot backend first, with automatic mock fallback if backend is offline
export const USE_MOCK_BACKEND = false;

class ApiClient {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
    // Local state for mock mode
    this.mockTools = [...mockTools];
    this.mockRequests = [...mockRequests];
    this.mockUsers = [...mockAdminUsers];
    this.registeredAccounts = new Map();
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getHeaders(isFormData = false) {
    const headers = {};
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
      headers['Accept'] = 'application/json';
    }
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    if (USE_MOCK_BACKEND) {
      return this.handleMockRequest(endpoint, options);
    }

    const isFormData = options.body instanceof FormData;
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(isFormData),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 401 && !endpoint.includes('/auth/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new CustomEvent('auth:expired'));
        throw new Error('Tu sesión ha expirado. Por favor ingresa nuevamente.');
      }

      const contentType = response.headers.get('content-type') || '';
      let data = null;
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else if (contentType.includes('text/html') || contentType.includes('text/plain')) {
        data = await response.text();
      }

      if (!response.ok) {
        let errorMsg = data?.message || data?.error || (typeof data === 'string' ? data : `Error HTTP ${response.status}`);
        if (data?.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
          const fieldErrors = Object.values(data.data).join('; ');
          if (fieldErrors) errorMsg = `${errorMsg}: ${fieldErrors}`;
        }
        const error = new Error(errorMsg);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      // Automatically unwrap Spring Boot ApiResponse envelope { success: true, message: ..., data: ... }
      if (data && typeof data === 'object' && 'data' in data && 'success' in data) {
        return data.data;
      }

      return data;
    } catch (err) {
      // If the backend actually responded with an HTTP status (e.g. 400, 403, 500), throw it!
      if (err.status) {
        throw err;
      }
      console.warn(`[Live API fallback to mock] ${options.method || 'GET'} ${url} failed (Backend unreachable):`, err);
      // Fallback to mock only if server is completely unreachable / offline
      return this.handleMockRequest(endpoint, options);
    }
  }

  // Autonomous Mock Handler for ToolRent UI
  async handleMockRequest(endpoint, options = {}) {
    // Artificial small delay for realistic UX micro-animations
    await new Promise(r => setTimeout(r, 120));
    const method = options.method || 'GET';
    const body = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : {};

    // 1. Categories
    if (endpoint.startsWith('/tools/categories') || endpoint.startsWith('/categories')) {
      return mockCategories;
    }

    // 2. Tools
    if (endpoint.startsWith('/tools')) {
      if (endpoint.includes('/availability')) {
        return { available: true, bookedDateRanges: [] };
      }
      if (method === 'GET') {
        const [path, qs] = endpoint.split('?');
        const params = new URLSearchParams(qs || '');
        let list = [...this.mockTools];
        if (params.get('status')) list = list.filter(t => t.status === params.get('status'));
        if (params.get('categoryId')) list = list.filter(t => t.categoryId === params.get('categoryId'));
        return list;
      }
      if (method === 'POST') {
        const newTool = {
          id: `tool-${Date.now().toString().slice(-4)}`,
          name: body.name || 'Nueva Herramienta',
          brand: body.brand || 'ToolRent Pro',
          model: body.model || 'Standard',
          dailyPrice: body.dailyPrice || 90000,
          replacementValue: body.replacementValue || 1500000,
          status: 'AVAILABLE',
          description: body.description || '',
          images: body.images || [{ imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800', isPrimary: true }],
          specs: body.specifications || []
        };
        this.mockTools.unshift(newTool);
        return newTool;
      }
      if (method === 'DELETE') {
        const id = endpoint.split('/')[2];
        this.mockTools = this.mockTools.filter(t => t.id !== id);
        return { success: true };
      }
    }

    // 3. Auth
    if (endpoint.startsWith('/auth/login')) {
      const username = body.username || 'demo_user';
      let roles = ['ROLE_CLIENTE'];
      const registered = this.registeredAccounts.get(username) || this.registeredAccounts.get(body.email);
      if (registered && registered.roles) {
        roles = registered.roles;
      } else if (username.includes('admin')) {
        roles = ['ROLE_ADMIN'];
      } else if (username.includes('prov') || username.includes('Juan') || username.includes('caterpillar')) {
        roles = ['ROLE_PROVEEDOR'];
      } else if (username.includes('client') || username.includes('carlos')) {
        roles = ['ROLE_CLIENTE'];
      }
      return {
        token: `mock-jwt-token.${btoa(JSON.stringify({ sub: username, roles, exp: Math.floor(Date.now() / 1000) + 86400 }))}.signature`,
        type: 'Bearer'
      };
    }

    if (endpoint.startsWith('/auth/register')) {
      const email = (body.email || `${body.username}@empresa.co`).trim().toLowerCase();
      
      const emailExists = this.mockUsers.some(u => u.email && u.email.toLowerCase() === email) ||
                          this.registeredAccounts.has(email) ||
                          (body.username && this.registeredAccounts.has(body.username.toLowerCase()));

      if (emailExists) {
        const err = new Error(`El correo electrónico ${email} ya se encuentra registrado en el sistema. Inicie sesión o utilice otro correo.`);
        err.status = 409;
        throw err;
      }

      const role = body.role || (body.roles && body.roles[0]) || 'ROLE_CLIENTE';
      const cleanRoles = Array.isArray(body.roles) ? body.roles : [role];
      const account = {
        id: `usr-${Date.now().toString().slice(-4)}`,
        username: body.username || email.split('@')[0] || 'usuario',
        email: email,
        roles: cleanRoles,
        enabled: true,
      };
      this.registeredAccounts.set(body.username || email, account);
      this.registeredAccounts.set(email, account);
      return account;
    }

    // 4. Users / Profiles
    if (endpoint === '/users/me') {
      const token = this.getToken();
      let roles = ['ROLE_CLIENTE'];
      let username = 'Juan Pérez';
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          roles = payload.roles || roles;
          username = payload.sub || username;
        } catch {}
      }
      const registered = this.registeredAccounts.get(username);
      if (registered) {
        return { id: registered.id, username: registered.username, email: registered.email, roles: registered.roles };
      }
      return { id: 'usr-01', username, email: `${username}@opusrentals.com`, roles };
    }

    if (endpoint === '/providers/me') {
      return { id: 'prov-001', companyName: 'Constructoras del Norte S.A.S.', taxId: '901.234.567-8', verified: true };
    }

    if (endpoint === '/clients/me') {
      return { id: 'cli-001', fullName: 'Juan Pérez García', identificationNumber: '1.032.456.789' };
    }

    if (endpoint === '/providers') {
      return [
        { id: 'prov-001', companyName: 'Constructoras del Norte S.A.S.', taxId: '901.234.567-8', contactPhone: '+57 317 654 3210', city: 'Bucaramanga, Santander', verified: true },
        { id: 'prov-002', companyName: 'Equipos & Maquinaria Colombia', taxId: '900.876.543-2', contactPhone: '+57 310 888 7766', city: 'Bogotá D.C.', verified: false },
      ];
    }

    if (endpoint.includes('/verify')) {
      return { success: true, verified: true };
    }

    if (endpoint === '/users') {
      return this.mockUsers.map(u => ({
        id: u.id,
        username: u.name,
        email: u.email,
        roles: u.role === 'Cliente' ? ['ROLE_CLIENTE'] : ['ROLE_PROVEEDOR'],
        enabled: u.active
      }));
    }

    // 5. Rentals
    if (endpoint.startsWith('/rentals/my-rentals') || endpoint.startsWith('/rentals/client/')) {
      return this.mockRequests.map(r => {
        const itemToolName = r.toolName || r.tool?.name || 'Equipo Industrial';
        const itemDailyRate = r.dailyRate || r.tool?.dailyPrice || (r.subtotal && r.totalDays ? Math.round(r.subtotal / r.totalDays) : 150000);
        return {
          id: r.id,
          startDate: r.startDate || r.dates?.split(' - ')?.[0] || '2026-10-14',
          endDate: r.endDate || r.dates?.split(' - ')?.[1] || '2026-10-17',
          totalDays: r.totalDays || r.days || 1,
          dailyRate: itemDailyRate,
          subtotal: r.subtotal || r.total || itemDailyRate,
          estimatedTotal: r.estimatedTotal || r.totalAmount || r.total || itemDailyRate,
          totalAmount: r.totalAmount || r.total || itemDailyRate,
          status: r.status || 'PENDING',
          createdAt: r.createdAt || new Date().toISOString(),
          toolId: r.toolId || r.tool?.id || 1,
          toolName: itemToolName,
          providerCompanyName: r.providerCompanyName || 'Equipos & Maquinaria Colombia S.A.S.',
          invoiceNumber: r.invoiceNumber || `OP-INV-${r.id}`,
          items: [{ toolName: itemToolName, dailyPrice: itemDailyRate }]
        };
      });
    }

    if (endpoint.includes('/booked-dates')) {
      const toolIdMatch = endpoint.match(/\/tool\/(\d+)\/booked-dates/);
      const toolId = toolIdMatch ? toolIdMatch[1] : null;
      return this.mockRequests
        .filter(r => (!toolId || String(r.toolId) === String(toolId)) && r.status !== 'CANCELLED' && r.status !== 'REJECTED')
        .map(r => ({
          startDate: r.startDate || '2026-10-19',
          endDate: r.endDate || '2026-10-21',
          status: r.status || 'APPROVED'
        }));
    }

    if (endpoint.startsWith('/rentals/provider-requests') || endpoint.startsWith('/rentals/provider/')) {
      return this.mockRequests;
    }

    if (endpoint.startsWith('/rentals')) {
      if (method === 'PATCH') {
        const parts = endpoint.split('/');
        const id = parts[2];
        const action = parts[3];
        const req = this.mockRequests.find(r => String(r.id) === String(id));
        if (req) {
          if (action === 'status') {
            req.status = body.status || 'CANCELLED';
          } else if (action === 'confirm' || action === 'approve') {
            req.status = 'APPROVED';
          } else if (action === 'start') {
            req.status = 'IN_PROGRESS';
          } else if (action === 'complete') {
            req.status = 'COMPLETED';
          } else if (action === 'cancel') {
            req.status = 'CANCELLED';
          }
        }
        return { success: true, id, status: req?.status || 'UPDATED' };
      }
      if (method === 'POST') {
        if (endpoint.includes('/cancel')) {
          const parts = endpoint.split('/');
          const id = parts[2];
          const req = this.mockRequests.find(r => String(r.id) === String(id));
          if (req) req.status = 'CANCELLED';
          return { success: true, id, status: 'CANCELLED' };
        }
        const foundTool = this.mockTools.find(t => String(t.id) === String(body.toolId)) || {};
        const toolName = body.toolName || foundTool.name || 'Maquinaria Industrial Certificada';
        const dailyPrice = body.dailyPrice || foundTool.dailyPrice || 1250000;
        
        const sDate = new Date(body.startDate || '2026-10-14');
        const eDate = new Date(body.endDate || '2026-10-17');
        const diffDays = Math.max(1, Math.round((eDate - sDate) / (1000 * 60 * 60 * 24)) + 1);
        const subtotal = body.subtotal || (diffDays * dailyPrice);
        const total = body.total || (subtotal * 1.19);

        const newRental = {
          id: `TR-${Date.now().toString().slice(-4)}`,
          startDate: body.startDate || '2026-10-14',
          endDate: body.endDate || '2026-10-17',
          totalDays: diffDays,
          dailyRate: dailyPrice,
          subtotal: subtotal,
          estimatedTotal: total,
          totalAmount: total,
          total: total,
          status: 'PENDING',
          toolName: toolName,
          providerCompanyName: body.providerCompanyName || foundTool.provider?.name || 'Equipos & Maquinaria Colombia S.A.S.',
          invoiceId: Math.floor(Math.random() * 9000) + 1000,
          invoiceNumber: `INV-OP-${Date.now().toString().slice(-4)}`,
          createdAt: new Date().toISOString()
        };

        this.mockRequests.unshift({
          id: newRental.id,
          client: { name: 'Cliente Actual', email: 'cliente@opusrentals.com' },
          tool: { id: body.toolId, name: toolName, dailyPrice: dailyPrice },
          startDate: newRental.startDate,
          endDate: newRental.endDate,
          dates: `${newRental.startDate} - ${newRental.endDate}`,
          days: diffDays,
          subtotal: subtotal,
          total: total,
          status: 'PENDING',
          createdAt: newRental.createdAt,
          providerCompanyName: newRental.providerCompanyName
        });
        return newRental;
      }
      return this.mockRequests;
    }

    // 6. Billing
    if (endpoint.startsWith('/billing/payments')) {
      return { id: `PAY-${Date.now().toString().slice(-6)}`, amount: body.amount || 255000, invoiceId: 'TR-0004587', status: 'APPROVED' };
    }

    if (endpoint.startsWith('/billing/invoices/rental/')) {
      return { id: 'TR-0004587', subtotal: 761000, tax: 144590, total: 905590 };
    }

    // 7. Reporting
    if (endpoint.startsWith('/reporting/provider/')) {
      const pendingCount = this.mockRequests.filter(r => r.status === 'PENDING').length;
      const rentedCount = this.mockRequests.filter(r => r.status === 'IN_PROGRESS').length;
      return {
        totalTools: 24,
        rentedTools: rentedCount || 5,
        totalEarnings: 8450000,
        pendingRentals: pendingCount || 6
      };
    }

    if (endpoint.startsWith('/reporting/income')) {
      return { totalIncome: mockAdminKpis.totalIncome };
    }

    if (endpoint.startsWith('/reporting/tool-availability')) {
      return { availableCount: mockAdminKpis.availableTools, rentedCount: 16, maintenanceCount: 6 };
    }

    if (endpoint.startsWith('/reporting/most-rented-tools')) {
      return mockAdminKpis.topTools.map(t => ({ toolName: t.name, rentalCount: t.count }));
    }

    if (endpoint.startsWith('/reporting/frequent-clients')) {
      return mockAdminKpis.topClients.map(c => ({ clientName: c.name, totalSpent: c.count * 850000 }));
    }

    // 8. Inspections & Damages
    if (endpoint.startsWith('/inspections')) {
      return { id: `INSP-${Date.now().toString().slice(-4)}`, status: 'RECORDED' };
    }

    // 9. Claims, Warranties & Refunds
    if (!this.mockClaims) this.mockClaims = [];

    if (endpoint.includes('/claims')) {
      if (endpoint.includes('/resolve') && method === 'PATCH') {
        const parts = endpoint.split('/');
        const claimId = parts[2];
        const claim = this.mockClaims.find(c => String(c.id) === String(claimId));
        if (claim) {
          claim.status = body.status || 'RESOLVED';
          if (body.refundAmount) claim.refundAmount = body.refundAmount;
          if (body.resolutionNotes) claim.resolutionNotes = body.resolutionNotes;
          claim.resolvedAt = new Date().toISOString();
          return claim;
        }
        return { success: true, status: body.status || 'RESOLVED' };
      }

      if (method === 'POST') {
        const rentalIdMatch = endpoint.match(/\/rentals\/(\d+)\/claims/);
        const rentalId = rentalIdMatch ? Number(rentalIdMatch[1]) : 1;
        const newClaim = {
          id: Date.now(),
          rentalId: rentalId,
          clientId: 1,
          clientFullName: 'Cliente en Obra',
          clientPhone: '3101234567',
          toolId: 3,
          toolName: 'Herramienta Industrial',
          providerId: 3,
          providerCompanyName: 'Bosch Herramientas Pro',
          claimType: body.claimType || 'WARRANTY_REPLACEMENT',
          reason: body.reason || 'Falla técnica',
          description: body.description || '',
          requestedAction: body.requestedAction || 'REPLACEMENT',
          status: 'PENDING',
          refundAmount: 0,
          resolutionNotes: null,
          createdAt: new Date().toISOString(),
          resolvedAt: null
        };
        this.mockClaims.unshift(newClaim);
        return newClaim;
      }

      return this.mockClaims;
    }

    if (endpoint.startsWith('/admin/reports/provider-quality')) {
      return [
        {
          providerId: 1,
          providerName: 'Caterpillar Equipos SAS',
          taxId: 'NIT-900123456-1',
          city: 'Bogotá D.C.',
          totalRentals: 48,
          returnedRentals: 42,
          returnRatePercentage: 87.5,
          damageReportsCount: 2,
          warrantyClaimsCount: 1,
          refundRequestsCount: 0,
          totalRefundAmount: 0,
          activeToolsCount: 12
        },
        {
          providerId: 2,
          providerName: 'Komatsu Maquinaria Andina',
          taxId: 'NIT-900234567-2',
          city: 'Medellín',
          totalRentals: 36,
          returnedRentals: 32,
          returnRatePercentage: 88.89,
          damageReportsCount: 1,
          warrantyClaimsCount: 2,
          refundRequestsCount: 1,
          totalRefundAmount: 450000,
          activeToolsCount: 8
        },
        {
          providerId: 3,
          providerName: 'Bosch Herramientas Pro',
          taxId: 'NIT-900345678-3',
          city: 'Barranquilla',
          totalRentals: 29,
          returnedRentals: 26,
          returnRatePercentage: 89.66,
          damageReportsCount: 1,
          warrantyClaimsCount: 1,
          refundRequestsCount: 0,
          totalRefundAmount: 0,
          activeToolsCount: 10
        },
        {
          providerId: 4,
          providerName: 'Hilti Soluciones de Anclaje',
          taxId: 'NIT-900456789-4',
          city: 'Bogotá D.C.',
          totalRentals: 22,
          returnedRentals: 20,
          returnRatePercentage: 90.91,
          damageReportsCount: 0,
          warrantyClaimsCount: 0,
          refundRequestsCount: 0,
          totalRefundAmount: 0,
          activeToolsCount: 6
        }
      ];
    }

    return { message: 'Mock response successful' };
  }

  get(endpoint, params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.append(k, v);
      }
    });
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request(`${endpoint}${queryString}`, { method: 'GET' });
  }

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  patch(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  upload(endpoint, file, extraData = {}) {
    const formData = new FormData();
    formData.append('file', file);
    Object.entries(extraData).forEach(([k, v]) => formData.append(k, v));
    return this.post(endpoint, formData);
  }
}

export const api = new ApiClient();
export default api;
