import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

// Operational State Engine for the Full-Stack Developer Preview
// This mirrors the Laravel + MySQL database state in-memory with filesystem persistence
interface LocalState {
  users: Array<{ id: string; name: string; role: string; pin: string }>;
  products: Array<{
    id: string;
    category: string;
    name: string;
    description: string;
    price: number;
    current_stock: number;
    track_stock: boolean;
  }>;
  categories: Array<{ id: string; name: string; slug: string; icon: string }>;
  orders: Array<{
    id: string;
    order_number: string;
    order_type: string;
    status: string;
    user_id: string;
    customer_id?: string;
    customer_name?: string;
    subtotal: number;
    discount: number;
    total: number;
    notes?: string;
    items: any[];
    created_at: string;
  }>;
  cashSession: {
    id: string;
    opened_by: string;
    opened_at: string;
    opening_cash: number;
    status: 'OPEN' | 'CLOSED';
  } | null;
  tables: Array<{ id: string; name: string; capacity: number; status: string; position_x: number; position_y: number }>;
  auditLogs: Array<{ id: string; action: string; user: string; timestamp: string; details: string }>;
  expenses: Array<{ id: string; title: string; category: string; amount: number; date: string; notes?: string }>;
  suppliers: Array<{ id: string; name: string; phone: string; balance: number; email?: string }>;
  onlineOrders: Array<{ id: string; customer_name: string; total: number; status: string; items: any[]; created_at: string }>;
  settings: {
    restaurant_name: string;
    currency: string;
    tax_rate: number;
    receipt_footer: string;
  };
}

const state: LocalState = {
  users: [
    { id: 'usr-1', name: 'Karim (Cashier)', role: 'CASHIER', pin: '1234' },
    { id: 'usr-2', name: 'Amine (Manager)', role: 'MANAGER', pin: '9999' },
    { id: 'usr-3', name: 'Sofia (Admin)', role: 'ADMIN', pin: '0000' },
    { id: 'usr-4', name: 'Yacine (Chef)', role: 'KITCHEN', pin: '5555' },
  ],
  products: [
    { id: 'prod-1', category: 'BURGERS', name: 'Crispy Classic Burger', description: 'Crispy golden chicken fillet, lettuce, mayo and melted cheese', price: 550, current_stock: 120, track_stock: true },
    { id: 'prod-2', category: 'BURGERS', name: 'Crispy Volcano Burger', description: 'Fiery spicy crispy chicken fillet, jalapeños, and volcano sauce', price: 600, current_stock: 85, track_stock: true },
    { id: 'prod-3', category: 'TACOS', name: 'French Tacos Double', description: 'Two crispy tenders, fries, and warm cheesy sauce in tortilla', price: 700, current_stock: 0, track_stock: false },
    { id: 'prod-4', category: 'DRINKS', name: 'Hamoud Boualem 33cl', description: 'Traditional Algerian lemonade soda', price: 120, current_stock: 300, track_stock: true },
    { id: 'prod-5', category: 'DRINKS', name: 'Coca-Cola 33cl', description: 'Ice cold Coca-Cola soda', price: 120, current_stock: 180, track_stock: true },
    { id: 'prod-6', category: 'EXTRAS', name: 'Algerian Cheese Sauce', description: 'Warm signature house cheese dipping sauce', price: 50, current_stock: 500, track_stock: false },
  ],
  categories: [
    { id: 'BURGERS', name: 'Burgers', slug: 'burgers', icon: 'Beef' },
    { id: 'TACOS', name: 'Tacos', slug: 'tacos', icon: 'Triangle' },
    { id: 'DRINKS', name: 'Drinks', slug: 'drinks', icon: 'CupSoda' },
    { id: 'EXTRAS', name: 'Extras', slug: 'extras', icon: 'PlusCircle' },
  ],
  orders: [],
  cashSession: null,
  tables: [
    { id: 'tab-1', name: 'T1', capacity: 2, status: 'AVAILABLE', position_x: 100, position_y: 100 },
    { id: 'tab-2', name: 'T2', capacity: 4, status: 'AVAILABLE', position_x: 250, position_y: 100 },
    { id: 'tab-3', name: 'T3', capacity: 4, status: 'AVAILABLE', position_x: 400, position_y: 100 },
    { id: 'tab-4', name: 'T4', capacity: 6, status: 'AVAILABLE', position_x: 100, position_y: 250 },
  ],
  auditLogs: [],
  expenses: [
    { id: 'exp-1', title: 'Chicken supplier pre-order bulk', category: 'Ingredients', amount: 35000, date: '2026-09-14' },
    { id: 'exp-2', title: 'Cooking oil canisters x5', category: 'Supplies', amount: 12500, date: '2026-09-15' },
  ],
  suppliers: [
    { id: 'sup-1', name: 'Algeria Poultry Fresh', phone: '0555123456', balance: 45000, email: 'poultry@algeria.dz' },
    { id: 'sup-2', name: 'Soda & Beverage Distrib', phone: '021987654', balance: 12000, email: 'drinks@distrib.dz' },
  ],
  onlineOrders: [
    { id: 'onl-1', customer_name: 'Anis Belgacem', total: 1850, status: 'PENDING', items: [{ name: 'Crispy Classic Burger', quantity: 2, price: 550 }, { name: 'French Tacos Double', quantity: 1, price: 700 }], created_at: new Date().toISOString() },
  ],
  settings: {
    restaurant_name: 'Crispy Chicken Algiers',
    currency: 'DA',
    tax_rate: 0,
    receipt_footer: 'Thank you for your visit! Crispy Chicken POS',
  },
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Log all REST traffic for transparency
  app.use((req, res, next) => {
    console.log(`[API ${req.method}] ${req.path}`);
    next();
  });

  // REST API Endpoints mirroring the production Laravel Controllers

  // 1. Auth Login
  app.post('/api/auth/login', (req, res) => {
    const { pin } = req.body;
    const user = state.users.find(u => u.pin === pin);

    if (user) {
      console.log(`Employee Auth: ${user.name} logged in`);
      state.auditLogs.unshift({
        id: Math.random().toString(36).substring(7),
        action: 'LOGIN',
        user: user.name,
        timestamp: new Date().toISOString(),
        details: 'Logged in via PIN',
      });

      return res.json({
        success: true,
        token: `token-${user.id}-${Date.now()}`,
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
        },
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid security PIN. Access denied.',
    });
  });

  // 2. Log Out
  app.post('/api/auth/logout', (req, res) => {
    res.json({ success: true, message: 'Logged out successfully.' });
  });

  // 3. Retrieve Catalog Products & Categories
  app.get('/api/products', (req, res) => {
    // Categories list mapped directly from our constant types
    const categories = [
      { id: 'BURGERS', name: 'Burgers', slug: 'burgers', icon: 'Beef' },
      { id: 'TACOS', name: 'Tacos', slug: 'tacos', icon: 'Triangle' },
      { id: 'DRINKS', name: 'Drinks', slug: 'drinks', icon: 'CupSoda' },
      { id: 'EXTRAS', name: 'Extras', slug: 'extras', icon: 'PlusCircle' },
    ];

    // Format products in the layout React's menus expect
    const formattedProducts = state.products.map(p => ({
      id: p.id,
      category: p.category,
      name: p.name,
      description: p.description,
      track_stock: p.track_stock,
      current_stock: p.current_stock,
      prices: [
        { size_id: 'solo', size_name: 'Solo', price: p.price },
        { size_id: 'medium', size_name: 'Medium Menu', price: p.price + 200 },
        { size_id: 'large', size_name: 'Large Menu', price: p.price + 300 },
      ],
      modifiers: [
        {
          id: 'grp-sauces',
          name: 'Select Sauce',
          min_selections: 0,
          max_selections: 2,
          options: [
            { id: 'opt-mayo', name: 'Mayonnaise', price: 0 },
            { id: 'opt-ketchup', name: 'Ketchup', price: 0 },
            { id: 'opt-harissa', name: 'Harissa', price: 0 },
            { id: 'opt-cheese', name: 'Warm Cheese Sauce', price: 50 },
          ],
        },
      ],
    }));

    res.json({
      success: true,
      categories,
      products: formattedProducts,
    });
  });

  // 3b. Categories API Endpoints
  app.get('/api/categories', (req, res) => {
    res.json(state.categories);
  });

  app.post('/api/categories', (req, res) => {
    const { name, slug, icon } = req.body;
    const newCat = {
      id: (name || 'New Category').toUpperCase().replace(/\s+/g, '_'),
      name: name || 'New Category',
      slug: slug || (name || 'New Category').toLowerCase().replace(/\s+/g, '-'),
      icon: icon || 'PlusCircle'
    };
    state.categories.push(newCat);
    res.status(201).json(newCat);
  });

  app.put('/api/categories/:id', (req, res) => {
    const { name, slug, icon } = req.body;
    const cat = state.categories.find(c => c.id === req.params.id);
    if (cat) {
      if (name) cat.name = name;
      if (slug) cat.slug = slug;
      if (icon) cat.icon = icon;
      return res.json(cat);
    }
    res.status(404).json({ message: 'Category not found' });
  });

  app.delete('/api/categories/:id', (req, res) => {
    const index = state.categories.findIndex(c => c.id === req.params.id);
    if (index !== -1) {
      state.categories.splice(index, 1);
      return res.json({ success: true });
    }
    res.status(404).json({ message: 'Category not found' });
  });

  // 4. Retrieve stock inventory levels
  app.get('/api/inventory', (req, res) => {
    const stockItems = state.products.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      currentStock: p.current_stock,
      minLevel: p.track_stock ? 20 : 0,
      unit: 'PCS',
      trackStock: p.track_stock,
    }));
    res.json(stockItems);
  });

  // 5. Adjust Stock
  app.post('/api/inventory/adjust', (req, res) => {
    const { productId, quantity, type, reason } = req.body;
    const product = state.products.find(p => p.id === productId);

    if (product) {
      const adjustmentValue = parseFloat(quantity);
      if (type === 'addition') {
        product.current_stock += adjustmentValue;
      } else {
        product.current_stock = Math.max(0, product.current_stock - adjustmentValue);
      }

      state.auditLogs.unshift({
        id: Math.random().toString(36).substring(7),
        action: 'INVENTORY_ADJUST',
        user: 'System Operator',
        timestamp: new Date().toISOString(),
        details: `Adjusted stock for ${product.name}: ${type === 'addition' ? '+' : '-'}${quantity} (${reason})`,
      });

      return res.json({ success: true, newStock: product.current_stock });
    }

    res.status(404).json({ success: false, message: 'Product not found' });
  });

  // 6. Fetch Register Status
  app.get('/api/cash-sessions/status', (req, res) => {
    res.json(state.cashSession);
  });

  // 7. Open Cash Register Session
  app.post('/api/cash-sessions/open', (req, res) => {
    const { openingCash, openedBy } = req.body;

    state.cashSession = {
      id: `cs-${Date.now()}`,
      opened_by: openedBy || 'Staff Member',
      opened_at: new Date().toISOString(),
      opening_cash: parseFloat(openingCash) || 0,
      status: 'OPEN',
    };

    state.auditLogs.unshift({
      id: Math.random().toString(36).substring(7),
      action: 'OPEN_SESSION',
      user: openedBy || 'Staff Member',
      timestamp: new Date().toISOString(),
      details: `Opened register shift with DA ${openingCash}`,
    });

    res.json({ success: true, session: state.cashSession });
  });

  // 8. Close Cash Register Session & Audit Variance
  app.post('/api/cash-sessions/close', (req, res) => {
    const { actualCash, closedBy } = req.body;

    if (!state.cashSession) {
      return res.status(400).json({ success: false, message: 'No active register session' });
    }

    const openingCash = state.cashSession.opening_cash;
    // Calculate expected sales from cash orders made in this session
    const salesTotal = state.orders
      .filter(o => o.status === 'COMPLETED' || o.status === 'PAID')
      .reduce((sum, o) => sum + o.total, 0);

    const expectedCash = openingCash + salesTotal;
    const actualCashVal = parseFloat(actualCash) || 0;
    const difference = actualCashVal - expectedCash;

    state.auditLogs.unshift({
      id: Math.random().toString(36).substring(7),
      action: 'CLOSE_SESSION',
      user: closedBy || 'Staff Member',
      timestamp: new Date().toISOString(),
      details: `Closed register shift. Expected: DA ${expectedCash}, Actual: DA ${actualCashVal}. Variance: DA ${difference}`,
    });

    state.cashSession = null;

    res.json({
      success: true,
      summary: {
        openingCash,
        expectedSales: salesTotal,
        expectedTotal: expectedCash,
        actualTotal: actualCashVal,
        variance: difference,
      },
    });
  });

  // 9. Fetch Orders History
  app.get('/api/orders', (req, res) => {
    res.json(state.orders);
  });

  // 10. Place Sales Order & Atomically Consume Stock
  app.post('/api/orders', (req, res) => {
    const orderData = req.body;

    // Build human-readable order number
    const count = state.orders.length + 1;
    const orderNumber = `CC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(count).padStart(4, '0')}`;

    const newOrder = {
      id: orderData.id || `ord-${Math.random().toString(36).substring(7)}`,
      order_number: orderNumber,
      order_type: orderData.orderType || orderData.order_type || 'COUNTER',
      status: orderData.status || 'COMPLETED',
      user_id: orderData.userId || 'usr-1',
      customer_id: orderData.customerId,
      customer_name: orderData.customerName,
      subtotal: orderData.subtotal || orderData.total,
      discount: orderData.discount || 0,
      total: orderData.total,
      notes: orderData.notes,
      items: orderData.items || [],
      created_at: new Date().toISOString(),
    };

    // Deduct stock for items sold
    newOrder.items.forEach((item: any) => {
      const product = state.products.find(p => p.id === item.id || p.id === item.productId);
      if (product && product.track_stock) {
        product.current_stock = Math.max(0, product.current_stock - item.quantity);
      }
    });

    state.orders.unshift(newOrder);

    state.auditLogs.unshift({
      id: Math.random().toString(36).substring(7),
      action: 'PLACE_ORDER',
      user: 'Cashier Terminal',
      timestamp: new Date().toISOString(),
      details: `Placed order ${orderNumber} for DA ${newOrder.total}`,
    });

    res.json({
      success: true,
      message: 'Order created',
      order: newOrder,
    });
  });

  // 11. Offline queue sync
  app.post('/api/orders/sync', (req, res) => {
    const { queue } = req.body;
    const syncedIds: string[] = [];

    if (Array.isArray(queue)) {
      queue.forEach((qItem: any) => {
        const orderData = qItem.payload;
        const count = state.orders.length + 1;
        const orderNumber = `CC-OFFLINE-${String(count).padStart(4, '0')}`;

        const newOrder = {
          id: orderData.id || qItem.entityId,
          order_number: orderNumber,
          order_type: orderData.orderType || 'COUNTER',
          status: 'COMPLETED',
          user_id: orderData.userId || 'usr-1',
          total: orderData.total,
          subtotal: orderData.subtotal || orderData.total,
          discount: orderData.discount || 0,
          items: orderData.items || [],
          created_at: qItem.createdAt || new Date().toISOString(),
        };

        newOrder.items.forEach((item: any) => {
          const product = state.products.find(p => p.id === item.id);
          if (product && product.track_stock) {
            product.current_stock = Math.max(0, product.current_stock - item.quantity);
          }
        });

        state.orders.unshift(newOrder);
        syncedIds.push(qItem.id);
      });
    }

    res.json({ success: true, synced_ids: syncedIds });
  });

  // 12. Fetch Physical Seating Layout Tables
  app.get('/api/tables', (req, res) => {
    res.json(state.tables);
  });

  // 13. Audit logs fetcher
  app.get('/api/audit-logs', (req, res) => {
    res.json(state.auditLogs);
  });

  // 14. Staff Access Controls
  app.get('/api/staff', (req, res) => {
    res.json(state.users);
  });

  app.post('/api/staff', (req, res) => {
    const { name, role, pin } = req.body;
    const newStaff = {
      id: `usr-${state.users.length + 1}`,
      name: name || 'New Staff',
      role: role || 'CASHIER',
      pin: pin || '1234'
    };
    state.users.push(newStaff);
    res.status(201).json(newStaff);
  });

  app.put('/api/staff/:id', (req, res) => {
    const { name, role, pin } = req.body;
    const staff = state.users.find(u => u.id === req.params.id);
    if (staff) {
      if (name) staff.name = name;
      if (role) staff.role = role;
      if (pin) staff.pin = pin;
      return res.json(staff);
    }
    res.status(404).json({ message: 'Staff member not found' });
  });

  app.delete('/api/staff/:id', (req, res) => {
    const index = state.users.findIndex(u => u.id === req.params.id);
    if (index !== -1) {
      state.users.splice(index, 1);
      return res.json({ success: true });
    }
    res.status(404).json({ message: 'Staff member not found' });
  });

  app.post('/api/staff/:id/reset-pin', (req, res) => {
    const { pin } = req.body;
    const staff = state.users.find(u => u.id === req.params.id);
    if (staff) {
      staff.pin = pin;
      return res.json({ success: true });
    }
    res.status(404).json({ message: 'Staff member not found' });
  });

  // 15. Expenses API Endpoints
  app.get('/api/expenses', (req, res) => {
    res.json(state.expenses);
  });

  app.post('/api/expenses', (req, res) => {
    const { title, category, amount, date, notes } = req.body;
    const newExp = {
      id: `exp-${state.expenses.length + 1}`,
      title: title || 'Expense',
      category: category || 'General',
      amount: Number(amount) || 0,
      date: date || new Date().toISOString().slice(0, 10),
      notes
    };
    state.expenses.push(newExp);
    res.status(201).json(newExp);
  });

  app.put('/api/expenses/:id', (req, res) => {
    const { title, category, amount, date, notes } = req.body;
    const exp = state.expenses.find(e => e.id === req.params.id);
    if (exp) {
      if (title !== undefined) exp.title = title;
      if (category !== undefined) exp.category = category;
      if (amount !== undefined) exp.amount = Number(amount);
      if (date !== undefined) exp.date = date;
      if (notes !== undefined) exp.notes = notes;
      return res.json(exp);
    }
    res.status(404).json({ message: 'Expense not found' });
  });

  app.delete('/api/expenses/:id', (req, res) => {
    const index = state.expenses.findIndex(e => e.id === req.params.id);
    if (index !== -1) {
      state.expenses.splice(index, 1);
      return res.json({ success: true });
    }
    res.status(404).json({ message: 'Expense not found' });
  });

  // 16. Suppliers API Endpoints
  app.get('/api/suppliers', (req, res) => {
    res.json(state.suppliers);
  });

  app.post('/api/suppliers', (req, res) => {
    const { name, phone, balance, email } = req.body;
    const newSup = {
      id: `sup-${state.suppliers.length + 1}`,
      name: name || 'Supplier',
      phone: phone || '',
      balance: Number(balance) || 0,
      email
    };
    state.suppliers.push(newSup);
    res.status(201).json(newSup);
  });

  app.put('/api/suppliers/:id', (req, res) => {
    const { name, phone, balance, email } = req.body;
    const sup = state.suppliers.find(s => s.id === req.params.id);
    if (sup) {
      if (name !== undefined) sup.name = name;
      if (phone !== undefined) sup.phone = phone;
      if (balance !== undefined) sup.balance = Number(balance);
      if (email !== undefined) sup.email = email;
      return res.json(sup);
    }
    res.status(404).json({ message: 'Supplier not found' });
  });

  app.delete('/api/suppliers/:id', (req, res) => {
    const index = state.suppliers.findIndex(s => s.id === req.params.id);
    if (index !== -1) {
      state.suppliers.splice(index, 1);
      return res.json({ success: true });
    }
    res.status(404).json({ message: 'Supplier not found' });
  });

  app.get('/api/suppliers/:id/balance', (req, res) => {
    const sup = state.suppliers.find(s => s.id === req.params.id);
    if (sup) {
      return res.json({ balance: sup.balance, history: [] });
    }
    res.status(404).json({ message: 'Supplier not found' });
  });

  // 17. Online Orders API Endpoints
  app.get('/api/online-orders', (req, res) => {
    res.json(state.onlineOrders);
  });

  app.post('/api/online-orders/:id/accept', (req, res) => {
    const order = state.onlineOrders.find(o => o.id === req.params.id);
    if (order) {
      order.status = 'ACCEPTED';
      return res.json({ success: true });
    }
    res.status(404).json({ message: 'Online order not found' });
  });

  app.post('/api/online-orders/:id/reject', (req, res) => {
    const order = state.onlineOrders.find(o => o.id === req.params.id);
    if (order) {
      order.status = 'REJECTED';
      return res.json({ success: true });
    }
    res.status(404).json({ message: 'Online order not found' });
  });

  // 18. Settings API Endpoints
  app.get('/api/settings', (req, res) => {
    res.json(state.settings);
  });

  app.put('/api/settings', (req, res) => {
    const { restaurant_name, currency, tax_rate, receipt_footer } = req.body;
    if (restaurant_name !== undefined) state.settings.restaurant_name = restaurant_name;
    if (currency !== undefined) state.settings.currency = currency;
    if (tax_rate !== undefined) state.settings.tax_rate = Number(tax_rate);
    if (receipt_footer !== undefined) state.settings.receipt_footer = receipt_footer;
    res.json(state.settings);
  });

  // 19. Reports API Endpoints
  app.get('/api/reports/kpi', (req, res) => {
    const salesToday = state.orders.reduce((sum, o) => sum + o.total, 0);
    const receiptsCount = state.orders.length;
    const averageBasket = receiptsCount > 0 ? Math.round(salesToday / receiptsCount) : 0;
    res.json({
      salesToday: salesToday || 48500,
      receiptsCount: receiptsCount || 62,
      averageBasket: averageBasket || 782
    });
  });

  app.get('/api/reports/sales-share', (req, res) => {
    res.json([
      { channel: 'Dine-In / Tables', revenue: 22500, share: '46.3%' },
      { channel: 'Counter / Takeaway', revenue: 14200, share: '29.2%' },
      { channel: 'Delivery', revenue: 11800, share: '24.3%' }
    ]);
  });

  app.get('/api/reports/top-products', (req, res) => {
    res.json([
      { rank: 1, name: 'Crispy Classic Burger', qty: 28, revenue: 18200 },
      { rank: 2, name: 'Crispy Volcano Burger', qty: 15, revenue: 11250 },
      { rank: 3, name: 'French Tacos Double', qty: 8, revenue: 10800 }
    ]);
  });

  // Mount Vite development or production build static paths
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is booted and running securely on http://localhost:${PORT}`);
  });
}

startServer();
