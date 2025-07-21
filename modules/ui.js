// UI Functions Module

// Global variables (will be set by initialize function)
let products, cart, currentMode, salesHistory, notificationHistory, notificationCount;
let topProductChartInstance, monthlySalesChartInstance;
let addProductToFirestore, updateProductInFirestore, deleteProductFromFirestore, addSaleToFirestore, addNotificationToFirestore;

// Initialize function to set global variables
function initialize(productsRef, cartRef, currentModeRef, salesHistoryRef, notificationHistoryRef, notificationCountRef, topProductChartInstanceRef, monthlySalesChartInstanceRef, addProductToFirestoreRef, updateProductInFirestoreRef, deleteProductFromFirestoreRef, addSaleToFirestoreRef, addNotificationToFirestoreRef) {
    products = productsRef;
    cart = cartRef;
    currentMode = currentModeRef;
    salesHistory = salesHistoryRef;
    notificationHistory = notificationHistoryRef;
    notificationCount = notificationCountRef;
    topProductChartInstance = topProductChartInstanceRef;
    monthlySalesChartInstance = monthlySalesChartInstanceRef;
    addProductToFirestore = addProductToFirestoreRef;
    updateProductInFirestore = updateProductInFirestoreRef;
    deleteProductFromFirestore = deleteProductFromFirestoreRef;
    addSaleToFirestore = addSaleToFirestoreRef;
    addNotificationToFirestore = addNotificationToFirestoreRef;
}

// Update products function
function updateProducts(productsRef) {
    products = productsRef;
}

// Update sales history function
function updateSalesHistory(salesHistoryRef) {
    salesHistory = salesHistoryRef;
}

// Tab and Mode Management
function switchTab(tabName) {
    const mode = window.currentMode || currentMode;
    if (tabName === 'products' && mode !== 'admin') {
        alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
        return;
    }

    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(tabName).classList.add('active');

    if (tabName === 'stock') {
        renderStockManagement();
    } else if (tabName === 'products') {
        renderProductsManagement();
    } else if (tabName === 'history') {
        renderHistory();
    } else if (tabName === 'reports') {
        renderReports();
    }
}

function switchMode(mode) {
    if (mode === 'admin') {
        showModal('adminLoginModal');
        setTimeout(() => {
            document.getElementById('adminPassword').focus();
        }, 100);
    } else {
        currentMode = 'user';
        document.getElementById('userMode').classList.add('active');
        document.getElementById('adminMode').classList.remove('active');
        document.getElementById('statusText').textContent = 'โหมดพนักงาน';
        updateModeVisibility();

        const currentTab = document.querySelector('.tab.active');
        if (currentTab && currentTab.classList.contains('admin-only')) {
            switchTab('sales');
        }
    }
}

function updateModeVisibility() {
    const mode = window.currentMode || currentMode;
    if (mode === 'admin') {
        document.body.classList.add('admin-mode');
    } else {
        document.body.classList.remove('admin-mode');

        const currentTab = document.querySelector('.tab.active');
        if (currentTab && currentTab.classList.contains('admin-only')) {
            switchTab('sales');
        }
    }
}

// Modal Management
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function hideModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Product Rendering
function renderProducts() {
    console.log(`🎨 Rendering products: ${products.length} total, ${products.filter(p => p.stock > 0).length} in stock`);
    
    const grid = document.getElementById('productsGrid');
    const searchTerm = document.getElementById('searchProduct').value.toLowerCase();
    const brandFilter = document.getElementById('brandFilter').value;
    
    const brandSelect = document.getElementById('brandFilter');
    const brands = Array.from(new Set(products.map(p => p.brand))).sort();
    brandSelect.innerHTML = '<option value="">ทั้งหมด</option>' + brands.map(b => `<option value="${b}">${b}</option>`).join('');
    brandSelect.value = brandFilter;

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
            product.brand.toLowerCase().includes(searchTerm);
        const matchesBrand = !brandFilter || product.brand === brandFilter;
        return matchesSearch && matchesBrand;
    });

    console.log(`🔍 Filtered products: ${filteredProducts.length} matching search/filter`);

    if (filteredProducts.length === 0) {
        if (products.length === 0) {
            console.log('📭 No products available, showing loading state');
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                    <h3>🌾 ไม่มีสินค้าในระบบ</h3>
                    <p>กำลังโหลดข้อมูลสินค้าจาก Firebase...</p>
                    <div class="spinner" style="margin: 20px auto; width: 40px; height: 40px;"></div>
                </div>
            `;
        } else {
            console.log('🔍 No products match search/filter criteria');
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                    <h3>🔍 ไม่พบสินค้าที่ค้นหา</h3>
                    <p>ลองเปลี่ยนคำค้นหาหรือตัวกรอง</p>
                </div>
            `;
        }
        return;
    }

    const productCards = filteredProducts.map(product => {
        let stockDisplay = '';
        if (typeof product.stock !== 'number' || isNaN(product.stock)) {
            stockDisplay = '<span class="stock-badge" style="color: #f44336;">หมด</span>';
        } else if (product.stock === 0) {
            stockDisplay = '<span class="stock-badge" style="color: #f44336;">หมด</span>';
        } else {
            stockDisplay = `<span class="stock-badge">${product.stock} ถุง</span>`;
        }
        return `
            <div class="product-card">
                <div class="product-image ${product.image ? '' : 'placeholder'}">
                    ${product.image ? `<img src="${product.image}" alt="${product.name}">` : '🌾'}
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <div class="product-brand">${product.brand}</div>
                    <div class="product-price">${product.price.toFixed(2)} บาท</div>
                    <div class="product-stock">
                        คงเหลือ: ${stockDisplay}
                    </div>
                    <div class="product-actions">
                        <button class="btn btn-primary" onclick="addToCart('${product.id}')" 
                                ${(product.stock === 0 || typeof product.stock !== 'number' || isNaN(product.stock)) ? 'disabled' : ''}>
                            🛒 เพิ่มลงตะกร้า
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    grid.innerHTML = productCards;
    console.log(`✅ Rendered ${filteredProducts.length} product cards`);
}

function renderStockManagement() {
    const grid = document.getElementById('stockGrid');
    grid.innerHTML = products.map(product => {
        let stockDisplay = '';
        if (typeof product.stock !== 'number' || isNaN(product.stock)) {
            stockDisplay = '<span class="stock-badge" style="color: #f44336;">หมด</span>';
        } else if (product.stock === 0) {
            stockDisplay = '<span class="stock-badge" style="color: #f44336;">หมด</span>';
        } else {
            stockDisplay = `<span class="stock-badge">${product.stock} ถุง</span>`;
        }
        return `
            <div class="product-card">
                <div class="product-image ${product.image ? '' : 'placeholder'}">
                    ${product.image ? `<img src="${product.image}" alt="${product.name}">` : '🌾'}
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <div class="product-brand">${product.brand}</div>
                    <div class="product-price">${product.price.toFixed(2)} บาท</div>
                    <div class="product-stock">
                        คงเหลือ: ${stockDisplay}
                    </div>
                    <div class="stock-update">
                        <button class="btn btn-primary" onclick="showStockModal('${product.id}', 'add')">เพิ่ม</button>
                        <button class="btn btn-warning" onclick="showStockModal('${product.id}', 'reduce')">ลด</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderProductsManagement() {
    const grid = document.getElementById('productsManageGrid');
    grid.innerHTML = products.map(product => {
        let stockDisplay = '';
        if (typeof product.stock !== 'number' || isNaN(product.stock)) {
            stockDisplay = '<span class="stock-badge" style="color: #f44336;">หมด</span>';
        } else if (product.stock === 0) {
            stockDisplay = '<span class="stock-badge" style="color: #f44336;">หมด</span>';
        } else {
            stockDisplay = `<span class="stock-badge">${product.stock} ถุง</span>`;
        }
        return `
            <div class="product-card">
                <div class="product-image ${product.image ? '' : 'placeholder'}">
                    ${product.image ? `<img src="${product.image}" alt="${product.name}">` : '🌾'}
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <div class="product-brand">${product.brand}</div>
                    <div class="product-price">${product.price.toFixed(2)} บาท</div>
                    <div class="product-stock">
                        คงเหลือ: ${stockDisplay}
                    </div>
                    <div class="product-actions">
                        <button class="btn btn-warning" onclick="editProduct('${product.id}')">
                            ✏️ แก้ไข
                        </button>
                        <button class="btn btn-danger" onclick="deleteProduct('${product.id}')">
                            🗑️ ลบ
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Cart Management
function updateCart() {
    const cartItems = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const totalAmount = document.getElementById('totalAmount');
    const checkoutBtn = document.getElementById('checkoutBtn');

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-state">
                <h3>ตะกร้าสินค้าว่างเปล่า</h3>
                <p>เพิ่มสินค้าลงในตะกร้าเพื่อเริ่มการขาย</p>
            </div>
        `;
        checkoutBtn.disabled = true;
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${item.price.toFixed(2)} บาท</div>
                </div>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                    <input type="number" class="quantity" min="1" max="${(products.find(p => p.id === item.id)?.stock) ?? 1}" value="${item.quantity}" style="width:50px;text-align:center;" 
                        onchange="setCartQuantity('${item.id}', this.value)" 
                        onblur="setCartQuantity('${item.id}', this.value)"
                        onkeydown="if(event.key==='Enter'){setCartQuantity('${item.id}', this.value)}">
                    <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                </div>
                <button class="btn btn-danger" onclick="removeFromCart('${item.id}')">
                    🗑️
                </button>
            </div>
        `).join('');
        checkoutBtn.disabled = false;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartCount.textContent = `${cart.length} รายการ`;
    totalAmount.textContent = `${total.toFixed(2)} บาท`;
}

// History Rendering
function renderHistory() {
    console.log(`📋 Rendering history: ${salesHistory.length} total sales`);
    
    const historyList = document.getElementById('historyList');
    const startDateInput = document.getElementById('historyStartDate');
    const endDateInput = document.getElementById('historyEndDate');
    let filtered = salesHistory.slice();
    
    console.log(`📊 Sales data:`, salesHistory);
    
    if (startDateInput && startDateInput.value) {
        const start = new Date(startDateInput.value + 'T00:00:00');
        filtered = filtered.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate >= start;
        });
    }
    if (endDateInput && endDateInput.value) {
        const end = new Date(endDateInput.value + 'T23:59:59');
        filtered = filtered.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate <= end;
        });
    }
    
    console.log(`🔍 Filtered sales: ${filtered.length} after date filtering`);
    
    if (filtered.length === 0) {
        console.log('📭 No sales to display');
        historyList.innerHTML = `
            <div class="empty-state">
                <h3>ยังไม่มีประวัติการขาย</h3>
                <p>เมื่อมีการขายสินค้าแล้ว ประวัติจะแสดงที่นี่</p>
            </div>
        `;
        return;
    }
    
    filtered.sort((a, b) => {
        const da = parseDateThai(a.date);
        const db = parseDateThai(b.date);
        return db - da;
    });
    
    const historyHTML = filtered.map(sale => `
        <div class="history-item">
            <div class="history-header">
                <span class="history-date">${sale.date}</span>
                <span class="history-total">${sale.total.toFixed(2)} บาท</span>
            </div>
            <div class="history-items">
                ${sale.items.map(item => `${item.name} x${item.quantity}`).join(', ')}
            </div>
        </div>
    `).join('');
    
    historyList.innerHTML = historyHTML;
    console.log(`✅ Rendered ${filtered.length} history items`);
}

// Reports Rendering
function renderReports() {
    const reportsGrid = document.getElementById('reportsGrid');
    const topProductMonth = document.getElementById('topProductMonth');
    const monthlySalesYear = document.getElementById('monthlySalesYear');

    const monthSet = new Set();
    const yearSet = new Set();
    salesHistory.forEach(sale => {
        const date = parseDateThai(sale.date);
        if (isNaN(date.getTime())) return;
        const month = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        const year = date.getFullYear();
        monthSet.add(month);
        yearSet.add(year);
    });
    const months = Array.from(monthSet).sort();
    const years = Array.from(yearSet).sort();

    if (topProductMonth) {
        topProductMonth.innerHTML = months.map(m => {
            const [y, mo] = m.split('-');
            return `<option value="${m}">${mo}/${y}</option>`;
        }).join('');
        if (!topProductMonth.value && months.length > 0) topProductMonth.value = months[months.length - 1];
    }
    if (monthlySalesYear) {
        monthlySalesYear.innerHTML = years.map(y => `<option value="${y}">${y}</option>`).join('');
        if (!monthlySalesYear.value && years.length > 0) monthlySalesYear.value = years[years.length - 1];
    }

    // Top Product Chart
    let selectedMonth = topProductMonth && topProductMonth.value ? topProductMonth.value : null;
    const productMap = {};
    salesHistory.forEach(sale => {
        const date = parseDateThai(sale.date);
        if (isNaN(date.getTime())) return;
        const month = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        if (selectedMonth && month !== selectedMonth) return;
        sale.items.forEach(item => {
            if (!productMap[item.name]) productMap[item.name] = 0;
            productMap[item.name] += item.quantity;
        });
    });
    
    const topProductsArr = Object.entries(productMap)
        .map(([name, qty]) => ({ name, qty }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 10);
    const topProductLabels = topProductsArr.map(p => p.name);
    const topProductData = topProductsArr.map(p => p.qty);
    
    if (topProductChartInstance) topProductChartInstance.destroy();
    const ctx1 = document.getElementById('topProductChart').getContext('2d');
    topProductChartInstance = new Chart(ctx1, {
        type: 'bar',
        data: {
            labels: topProductLabels,
            datasets: [{
                label: 'จำนวนที่ขาย (ถุง)',
                data: topProductData,
                backgroundColor: topProductLabels.map((_, i) => `hsl(${i * 36},70%,60%)`),
                borderColor: topProductLabels.map((_, i) => `hsl(${i * 36},70%,40%)`),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                title: { display: false }
            },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'จำนวนที่ขาย (ถุง)' } }
            }
        }
    });

    // Monthly Sales Chart
    let selectedYear = monthlySalesYear && monthlySalesYear.value ? parseInt(monthlySalesYear.value) : null;
    const monthlySalesMap = {};
    salesHistory.forEach(sale => {
        const date = parseDateThai(sale.date);
        if (isNaN(date.getTime())) return;
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        if (selectedYear && year !== selectedYear) return;
        const monthLabel = `${year}-${month.toString().padStart(2, '0')}`;
        if (!monthlySalesMap[monthLabel]) monthlySalesMap[monthLabel] = 0;
        monthlySalesMap[monthLabel] += sale.total;
    });
    
    const monthlyLabels = Array.from({ length: 12 }, (_, i) => `${selectedYear}-${(i + 1).toString().padStart(2, '0')}`);
    const monthlyData = monthlyLabels.map(m => monthlySalesMap[m] || 0);
    
    if (monthlySalesChartInstance) monthlySalesChartInstance.destroy();
    const ctx2 = document.getElementById('monthlySalesChart').getContext('2d');
    monthlySalesChartInstance = new Chart(ctx2, {
        type: 'line',
        data: {
            labels: monthlyLabels.map(m => {
                const [y, mo] = m.split('-');
                return `${mo}/${y}`;
            }),
            datasets: [{
                label: 'ยอดขายรวม (บาท)',
                data: monthlyData,
                fill: true,
                backgroundColor: 'rgba(67,160,71,0.15)',
                borderColor: '#43a047',
                tension: 0.2,
                pointRadius: 4,
                pointBackgroundColor: '#43a047',
                pointBorderColor: '#fff',
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                title: { display: false }
            },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'บาท' } }
            }
        }
    });

    // Summary Cards
    const totalSales = salesHistory.reduce((sum, sale) => sum + sale.total, 0);
    const totalTransactions = salesHistory.length;
    const totalProducts = products.length;
    const lowStockProducts = products.filter(p => p.stock < 10).length;
    const avgSale = totalTransactions > 0 ? totalSales / totalTransactions : 0;

    reportsGrid.innerHTML = `
        <div class="report-card">
            <h3>ยอดขายรวม</h3>
            <div class="report-value">${totalSales.toFixed(2)}</div>
            <div class="report-label">บาท</div>
        </div>
        <div class="report-card">
            <h3>จำนวนการขาย</h3>
            <div class="report-value">${totalTransactions}</div>
            <div class="report-label">ครั้ง</div>
        </div>
        <div class="report-card">
            <h3>จำนวนสินค้า</h3>
            <div class="report-value">${totalProducts}</div>
            <div class="report-label">รายการ</div>
        </div>
        <div class="report-card">
            <h3>สินค้าใกล้หมด</h3>
            <div class="report-value">${lowStockProducts}</div>
            <div class="report-label">รายการ</div>
        </div>
        <div class="report-card">
            <h3>ยอดขายเฉลี่ย</h3>
            <div class="report-value">${avgSale.toFixed(2)}</div>
            <div class="report-label">บาท/ครั้ง</div>
        </div>
        <div class="report-card">
            <h3>Stock รวม</h3>
            <div class="report-value">${products.reduce((sum, p) => sum + p.stock, 0)}</div>
            <div class="report-label">ถุง</div>
        </div>
    `;
}

// Notification Management
function updateNotificationBell() {
    const countElement = document.getElementById('notificationCount');
    if (notificationCount > 0) {
        countElement.textContent = notificationCount;
        countElement.classList.remove('hidden');
    } else {
        countElement.classList.add('hidden');
    }
}

function showNotificationHistory() {
    const historyList = document.getElementById('notificationHistoryList');

    if (notificationHistory.length === 0) {
        historyList.innerHTML = `
            <div class="empty-state">
                <h3>ไม่มีประวัติการแจ้งเตือน</h3>
                <p>เมื่อมีการแจ้งเตือนใหม่ ประวัติจะแสดงที่นี่</p>
            </div>
        `;
    } else {
        historyList.innerHTML = notificationHistory.map(notification => `
            <div class="notification-item">
                <div class="notification-item-header">
                    <div class="notification-item-title">
                        <span>⚠️</span>
                        ${notification.title}
                    </div>
                    <div class="notification-item-time">${notification.timestamp}</div>
                </div>
                <div class="notification-item-content">
                    <p>${notification.message}</p>
                    <ul>
                        ${notification.products.map(product => `<li>${product}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `).join('');
    }

    showModal('notificationHistoryModal');
}

// Utility Functions
function parseDateThai(str) {
    if (!str) return new Date(NaN);
    let [datePart, timePart] = str.split(',');
    if (!datePart) return new Date(NaN);
    let [d, m, y] = datePart.trim().split('/');
    if (!d || !m || !y) return new Date(NaN);
    if (y.length === 4 && +y > 2400) y = (+y - 543).toString();
    let iso = `${y.padStart(4, '0')}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    if (timePart) iso += 'T' + timePart.trim();
    return new Date(iso);
}

// Export functions
export {
    initialize,
    updateProducts,
    updateSalesHistory,
    switchTab,
    switchMode,
    updateModeVisibility,
    showModal,
    hideModal,
    renderProducts,
    renderStockManagement,
    renderProductsManagement,
    updateCart,
    renderHistory,
    renderReports,
    updateNotificationBell,
    showNotificationHistory,
    parseDateThai
}; 