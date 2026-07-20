const API_BASE_URL = 'http://localhost:5000/api';

export const api = {
  // Products
  async getProducts() {
    const res = await fetch(`${API_BASE_URL}/products`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },
  async createProduct(product: any) {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('smartcart-admin-token') || '' : '';
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(product),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create product');
    }
    return res.json();
  },
  async updateProduct(id: string, product: any) {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('smartcart-admin-token') || '' : '';
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(product),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update product');
    }
    return res.json();
  },
  async deleteProduct(id: string) {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('smartcart-admin-token') || '' : '';
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to delete product');
    return res.json();
  },

  // Carts
  async getCarts(params?: { page?: number; limit?: number; search?: string; status?: string; batteryLevel?: string; sortBy?: string; sortOrder?: string }) {
    let url = `${API_BASE_URL}/carts`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, String(val));
        }
      });
      const qs = searchParams.toString();
      if (qs) {
        url += `?${qs}`;
      }
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch carts');
    return res.json();
  },
  async createCart(cart: any) {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('smartcart-admin-token') || '' : '';
    const res = await fetch(`${API_BASE_URL}/carts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(cart),
    });
    if (!res.ok) throw new Error('Failed to create cart');
    return res.json();
  },
  async updateCart(id: string, cart: any) {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('smartcart-admin-token') || '' : '';
    const res = await fetch(`${API_BASE_URL}/carts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(cart),
    });
    if (!res.ok) throw new Error('Failed to update cart');
    return res.json();
  },
  async deleteCart(id: string) {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('smartcart-admin-token') || '' : '';
    const res = await fetch(`${API_BASE_URL}/carts/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to delete cart');
    return res.json();
  },
  async bulkUpdateCarts(cartIds: string[], status: string) {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('smartcart-admin-token') || '' : '';
    const res = await fetch(`${API_BASE_URL}/carts/bulk-update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ cartIds, status }),
    });
    if (!res.ok) throw new Error('Failed to bulk update carts');
    return res.json();
  },
  getExportCartsUrl() {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('smartcart-admin-token') || '' : '';
    return `${API_BASE_URL}/carts/export?token=${token}`; // need custom logic on server if using url, better to fetch and blob, but returning string for now
  },

  // Alerts
  async getAlerts() {
    const res = await fetch(`${API_BASE_URL}/alerts`);
    if (!res.ok) throw new Error('Failed to fetch alerts');
    return res.json();
  },
  async createAlert(alert: any) {
    const res = await fetch(`${API_BASE_URL}/alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alert),
    });
    if (!res.ok) throw new Error('Failed to create alert');
    return res.json();
  },
  async updateAlert(id: string, alert: any) {
    const res = await fetch(`${API_BASE_URL}/alerts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alert),
    });
    if (!res.ok) throw new Error('Failed to update alert');
    return res.json();
  },
  async deleteAlert(id: string) {
    const res = await fetch(`${API_BASE_URL}/alerts/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete alert');
    return res.json();
  },

  // Orders
  async getOrders() {
    const res = await fetch(`${API_BASE_URL}/orders`);
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },
  async createOrder(order: any) {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('smartcart-admin-token') || '' : '';
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(order),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create order');
    }
    return res.json();
  },

  // Logs
  async submitGatewayLog(cartId: string, staffName: string, status: string, reason?: string, token?: string) {
    const res = await fetch(`${API_BASE_URL}/gateway/log`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ cartId, staffName, status, reason }),
    });
    if (!res.ok) throw new Error('Failed to submit gateway log');
    return res.json();
  },
  async getLogs() {
    const res = await fetch(`${API_BASE_URL}/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log),
    });
    if (!res.ok) throw new Error('Failed to create log');
    return res.json();
  },

  // Group Sessions
  async getGroupSession(code: string) {
    const res = await fetch(`${API_BASE_URL}/group-sessions/${code}`);
    if (!res.ok) throw new Error('Failed to fetch group session');
    return res.json();
  },
  async createGroupSession(session: any) {
    const res = await fetch(`${API_BASE_URL}/group-sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create group session');
    }
    return res.json();
  },
  async updateGroupSession(code: string, sessionData: any) {
    const res = await fetch(`${API_BASE_URL}/group-sessions/${code}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessionData),
    });
    if (!res.ok) throw new Error('Failed to update group session');
    return res.json();
  },
  async joinGroupSession(code: string, memberInfo: any) {
    const res = await fetch(`${API_BASE_URL}/group-sessions/${code}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(memberInfo),
    });
    if (!res.ok) throw new Error('Failed to join group session');
    return res.json();
  },
  async leaveGroupSession(code: string, memberInfo: any) {
    const res = await fetch(`${API_BASE_URL}/group-sessions/${code}/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(memberInfo),
    });
    if (!res.ok) throw new Error('Failed to leave group session');
    return res.json();
  },

  // Analytics
  async getAnalyticsOverview() {
    const res = await fetch(`${API_BASE_URL}/analytics/overview`);
    if (!res.ok) throw new Error('Failed to fetch analytics overview');
    return res.json();
  },
  async getCategoryPieData(category: string) {
    const res = await fetch(`${API_BASE_URL}/analytics/pie?category=${encodeURIComponent(category)}`);
    if (!res.ok) throw new Error('Failed to fetch category pie data');
    return res.json();
  },

  // Customer & Admin Authentication
  async loginWithQR(qrCode?: string) {
    const res = await fetch(`${API_BASE_URL}/customer/login-qr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qrCode }),
    });
    if (!res.ok) throw new Error('Failed to login with QR');
    return res.json();
  },

  async loginAdmin(username: string, password: string) {
    const res = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const errorMsg = await res.json().catch(() => ({}));
      throw new Error(errorMsg.message || 'Failed to login');
    }
    return res.json();
  },

  // Gateway
  async getGatewayCartPayload(cartId: string, token: string) {
    const res = await fetch(`${API_BASE_URL}/gateway/cart/${encodeURIComponent(cartId)}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) {
      const errorMsg = await res.json().catch(() => ({}));
      throw new Error(errorMsg.message || 'Failed to fetch cart payload');
    }
    return res.json();
  },

  // Customer Authentication & Points
  async loginCustomer(phoneNumber: string, pinCode: string) {
    const res = await fetch(`${API_BASE_URL}/customer/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, pinCode }),
    });
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('user not found');
      }
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Sai thông tin đăng nhập hoặc mã PIN');
    }
    return res.json();
  },
  async registerCustomer(customerData: { fullName: string, age: number, phoneNumber: string, pinCode: string, email?: string }) {
    const res = await fetch(`${API_BASE_URL}/customer/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerData),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Đăng ký thất bại.');
    }
    return res.json();
  },
  async verifyCustomerEmail(email: string, otp: string) {
    const res = await fetch(`${API_BASE_URL}/customer/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Xác thực OTP thất bại.');
    }
    return res.json();
  },
  async updateCustomerPoints(customerId: string, points: number) {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('smartcart-admin-token') || '' : '';
    const res = await fetch(`${API_BASE_URL}/customer/${customerId}/points`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ points }),
    });
    if (!res.ok) throw new Error('Failed to update customer points');
    return res.json();
  },
  async updateCustomerPointsByPhone(phoneNumber: string, points: number) {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('smartcart-admin-token') || '' : '';
    const res = await fetch(`${API_BASE_URL}/customer/phone/${phoneNumber}/points`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ points }),
    });
    if (!res.ok) throw new Error('Failed to update customer points by phone');
    return res.json();
  },

  // Staff Management
  async getStaff() {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('smartcart-admin-token') || '' : '';
    if (!token) {
      throw new Error(`DEBUG_NO_TOKEN: localStorage has no smartcart-admin-token! userRole=${typeof window !== 'undefined' ? window.localStorage.getItem('smartcart-user-role') : ''}`);
    }
    const res = await fetch(`${API_BASE_URL}/staff`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to fetch staff. Status: ${res.status}. Detail: ${errText}`);
    }
    return res.json();
  },
  async createStaff(staff: any) {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('smartcart-admin-token') || '' : '';
    const res = await fetch(`${API_BASE_URL}/staff`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(staff),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to create staff');
    }
    return res.json();
  },
  async updateStaff(id: string, staff: any) {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('smartcart-admin-token') || '' : '';
    const res = await fetch(`${API_BASE_URL}/staff/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(staff),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to update staff');
    }
    return res.json();
  },
  async deleteStaff(id: string) {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('smartcart-admin-token') || '' : '';
    const res = await fetch(`${API_BASE_URL}/staff/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to delete staff');
    }
    return res.json();
  },

  // Branches
  async getBranches() {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('smartcart-admin-token') || '' : '';
    if (!token) {
      throw new Error(`DEBUG_NO_TOKEN: localStorage has no smartcart-admin-token in getBranches!`);
    }
    const res = await fetch(`${API_BASE_URL}/branches`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to fetch branches. Status: ${res.status}. Detail: ${errText}`);
    }
    return res.json();
  },
  async createBranch(branch: any) {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('smartcart-admin-token') || '' : '';
    const res = await fetch(`${API_BASE_URL}/branches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(branch)
    });
    if (!res.ok) throw new Error('Failed to create branch');
    return res.json();
  },
  async updateBranch(id: string, branch: any) {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('smartcart-admin-token') || '' : '';
    const res = await fetch(`${API_BASE_URL}/branches/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(branch)
    });
    if (!res.ok) throw new Error('Failed to update branch');
    return res.json();
  },
  async deleteBranch(id: string) {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('smartcart-admin-token') || '' : '';
    const res = await fetch(`${API_BASE_URL}/branches/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to delete branch');
    return res.json();
  },

  // Settings
  async getSettings() {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('smartcart-admin-token') || '' : '';
    const res = await fetch(`${API_BASE_URL}/settings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },
  async updateSettings(settings: any) {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('smartcart-admin-token') || '' : '';
    const res = await fetch(`${API_BASE_URL}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(settings)
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },

  // Customer CRM
  async getCustomers() {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('smartcart-admin-token') || '' : '';
    const res = await fetch(`${API_BASE_URL}/customer`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch customers');
    return res.json();
  },

  // Tickets
  async getTickets() {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('smartcart-admin-token') || '' : '';
    const res = await fetch(`${API_BASE_URL}/tickets`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch tickets');
    return res.json();
  },
  async updateTicketStatus(id: string, status: 'open' | 'resolved') {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('smartcart-admin-token') || '' : '';
    const res = await fetch(`${API_BASE_URL}/tickets/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update ticket status');
    return res.json();
  },

  // Low Stock
  async getLowStockProducts() {
    const res = await fetch(`${API_BASE_URL}/products/low-stock`);
    if (!res.ok) throw new Error('Failed to fetch low stock products');
    return res.json();
  }
};

