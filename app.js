import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
    getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyB80Lw579vymHLg0-CfRYP989nSUdpIcA4",
    authDomain: "rice-pos.firebaseapp.com",
    projectId: "rice-pos",
    storageBucket: "rice-pos.firebasestorage.app",
    messagingSenderId: "932787497578",
    appId: "1:932787497578:web:8faa2b5094203113857813",
    measurementId: "G-1M294V875F"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Global state
let products = [];
let cart = [];
let currentMode = 'user';
window.currentMode = currentMode;
let currentEditingProduct = null;
let salesHistory = [];
let notificationHistory = [];
let notificationCount = 0;
let currentStockProductId = null;
let currentStockAction = null;
let topProductChartInstance = null;
let monthlySalesChartInstance = null;

// CRUD functions for Firestore
async function addProductToFirestore(product) {
    await addDoc(collection(db, 'products'), product);
}

async function updateProductInFirestore(id, data) {
    await updateDoc(doc(db, 'products', id), data);
}

async function deleteProductFromFirestore(id) {
    await deleteDoc(doc(db, 'products', id));
}

async function addSaleToFirestore(sale) {
    try {
        console.log('🔥 Adding sale to Firestore:', sale);
        const docRef = await addDoc(collection(db, 'salesHistory'), sale);
        console.log('✅ Sale added successfully with ID:', docRef.id);
    } catch (error) {
        console.error('❌ Error adding sale to Firestore:', error);
    }
}

async function addNotificationToFirestore(notification) {
    await addDoc(collection(db, 'notificationHistory'), notification);
}

async function clearNotificationHistoryFirestore() {
    const querySnapshot = await getDocs(collection(db, 'notificationHistory'));
    for (const docSnap of querySnapshot.docs) {
        await deleteDoc(doc(db, 'notificationHistory', docSnap.id));
    }
}

// Import modules
import * as UI from './modules/ui.js';
import * as Cart from './modules/cart.js';
import * as Products from './modules/products.js';
import * as Admin from './modules/admin.js';
import * as Notifications from './modules/notifications.js';

// Initialize modules with global context
UI.initialize(products, cart, currentMode, salesHistory, notificationHistory, notificationCount, topProductChartInstance, monthlySalesChartInstance, addProductToFirestore, updateProductInFirestore, deleteProductFromFirestore, addSaleToFirestore, addNotificationToFirestore);
Cart.initialize(products, cart, addSaleToFirestore, updateProductInFirestore);
Products.initialize(products, currentEditingProduct, currentStockProductId, currentStockAction, addProductToFirestore, updateProductInFirestore, deleteProductFromFirestore);
Admin.initialize(db, salesHistory, notificationHistory, notificationCount, clearNotificationHistoryFirestore);
Notifications.initialize(products, addNotificationToFirestore);

// Global functions for modules to use
window.showModal = UI.showModal;
window.hideModal = UI.hideModal;
window.addToCart = Cart.addToCart;
window.removeFromCart = Cart.removeFromCart;
window.updateCartUI = UI.updateCart;
window.editProduct = Products.editProduct;
window.showStockModal = Products.showStockModal;
window.removeImage = Products.removeImage;
window.checkLowStock = Notifications.checkLowStock;

// Real-time sync for products
onSnapshot(collection(db, 'products'), (snapshot) => {
    console.log(`🔄 Real-time sync: Received ${snapshot.size} products from Firebase`);
    
    products = [];
    snapshot.forEach(docSnap => {
        const productData = { id: docSnap.id, ...docSnap.data() };
        products.push(productData);
        console.log(`📦 Product: ${productData.name} - ${productData.stock} ถุง`);
    });
    
    console.log(`📊 Total products in memory: ${products.length}`);
    
    // Update global variables in modules
    UI.updateProducts(products);
    Cart.updateProducts(products);
    Products.updateProducts(products);
    Notifications.updateProducts(products);
    
    // Render UI
    UI.renderProducts();
    UI.renderStockManagement();
    UI.renderProductsManagement();
    Notifications.checkLowStock();
    
    console.log('✅ UI updated with latest product data');
}, (error) => {
    console.error('❌ Error in real-time sync:', error);
});

// Real-time sync for salesHistory
onSnapshot(collection(db, 'salesHistory'), (snapshot) => {
    console.log(`🔄 Real-time sync: Received ${snapshot.size} sales from Firebase`);
    
    salesHistory = [];
    snapshot.forEach(docSnap => {
        const saleData = { id: docSnap.id, ...docSnap.data() };
        salesHistory.push(saleData);
        console.log(`💰 Sale: ${saleData.date} - ${saleData.total} บาท`);
    });
    
    console.log(`📊 Total sales in memory: ${salesHistory.length}`);
    
    // Update global variables in modules
    UI.updateSalesHistory(salesHistory);
    Admin.updateSalesHistory(salesHistory);
    
    // Render UI
    UI.renderHistory();
    UI.renderReports();
    
    console.log('✅ Sales history UI updated');
}, (error) => {
    console.error('❌ Error in sales history sync:', error);
});

// Real-time sync for notificationHistory
onSnapshot(collection(db, 'notificationHistory'), (snapshot) => {
    notificationHistory = [];
    snapshot.forEach(docSnap => {
        notificationHistory.push({ id: docSnap.id, ...docSnap.data() });
    });
    notificationCount = notificationHistory.filter(n => !n.read).length;
    UI.updateNotificationBell();
});

// Initialize app
document.addEventListener('DOMContentLoaded', function () {
    initializePOSApp();
    // Add sample data if no products exist
    addSampleProductsIfNeeded();
});

function initializePOSApp() {
    setupEventListeners();
    UI.renderProducts();
    UI.updateCart();
    UI.updateModeVisibility();
    UI.renderHistory();
    UI.renderReports();
    UI.updateNotificationBell();
    Notifications.checkLowStock();
}

function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function () {
            UI.switchTab(this.dataset.tab);
        });
    });

    // Mode switching
    const userModeBtn = document.getElementById('userMode');
    if (userModeBtn) userModeBtn.addEventListener('click', () => UI.switchMode('user'));
    const adminModeBtn = document.getElementById('adminMode');
    if (adminModeBtn) adminModeBtn.addEventListener('click', () => UI.switchMode('admin'));

    // Search and filters
    const searchProduct = document.getElementById('searchProduct');
    if (searchProduct) searchProduct.addEventListener('input', UI.renderProducts);
    const brandFilter = document.getElementById('brandFilter');
    if (brandFilter) brandFilter.addEventListener('change', UI.renderProducts);

    // Modal handlers
    const cancelLogin = document.getElementById('cancelLogin');
    if (cancelLogin) cancelLogin.addEventListener('click', () => UI.hideModal('adminLoginModal'));
    const confirmLogin = document.getElementById('confirmLogin');
    if (confirmLogin) confirmLogin.addEventListener('click', Admin.handleAdminLogin);
    const adminPassword = document.getElementById('adminPassword');
    if (adminPassword) adminPassword.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            Admin.handleAdminLogin();
        }
    });
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) addProductBtn.addEventListener('click', () => Products.showAddProductModal());
    const addSampleDataBtn = document.getElementById('addSampleDataBtn');
    if (addSampleDataBtn) addSampleDataBtn.addEventListener('click', addSampleProducts);
    const cancelProduct = document.getElementById('cancelProduct');
    if (cancelProduct) cancelProduct.addEventListener('click', () => UI.hideModal('productModal'));
    const saveProduct = document.getElementById('saveProduct');
    if (saveProduct) saveProduct.addEventListener('click', Products.handleSaveProduct);

    // Product image upload
    const productImage = document.getElementById('productImage');
    if (productImage) productImage.addEventListener('change', Products.handleImageUpload);

    // Checkout
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) checkoutBtn.addEventListener('click', Cart.handleCheckout);
    const cancelCheckout = document.getElementById('cancelCheckout');
    if (cancelCheckout) cancelCheckout.addEventListener('click', () => UI.hideModal('checkoutModal'));
    const confirmCheckout = document.getElementById('confirmCheckout');
    if (confirmCheckout) confirmCheckout.addEventListener('click', Cart.handleConfirmCheckout);
    const receivedAmount = document.getElementById('receivedAmount');
    if (receivedAmount) {
        receivedAmount.addEventListener('input', Cart.calculateChange);
        receivedAmount.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                Cart.handleConfirmCheckout();
            }
        });
    }

    // Stock Modal
    const cancelStock = document.getElementById('cancelStock');
    if (cancelStock) cancelStock.addEventListener('click', () => UI.hideModal('stockModal'));
    const confirmStock = document.getElementById('confirmStock');
    if (confirmStock) confirmStock.addEventListener('click', Products.confirmStockUpdate);
    const stockAmount = document.getElementById('stockAmount');
    if (stockAmount) stockAmount.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            Products.confirmStockUpdate();
        }
    });

    // Notification Bell
    const notificationBell = document.getElementById('notificationBell');
    if (notificationBell) notificationBell.addEventListener('click', UI.showNotificationHistory);
    const clearNotifications = document.getElementById('clearNotifications');
    if (clearNotifications) clearNotifications.addEventListener('click', Admin.clearNotificationHistory);

    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function (e) {
            if (e.target === this) {
                UI.hideModal(this.id);
            }
        });
    });

    // History and reports
    const historyStartDate = document.getElementById('historyStartDate');
    if (historyStartDate) historyStartDate.addEventListener('change', UI.renderHistory);
    const historyEndDate = document.getElementById('historyEndDate');
    if (historyEndDate) historyEndDate.addEventListener('change', UI.renderHistory);
    const printHistoryBtn = document.getElementById('printHistoryBtn');
    if (printHistoryBtn) printHistoryBtn.addEventListener('click', Admin.printHistoryPDF);

    const topProductMonth = document.getElementById('topProductMonth');
    if (topProductMonth) topProductMonth.addEventListener('change', UI.renderReports);
    const monthlySalesYear = document.getElementById('monthlySalesYear');
    if (monthlySalesYear) monthlySalesYear.addEventListener('change', UI.renderReports);

    const addSampleSalesBtn = document.getElementById('addSampleSalesBtn');
    if (addSampleSalesBtn) addSampleSalesBtn.addEventListener('click', addSampleSales);
    const clearSalesHistoryBtn = document.getElementById('clearSalesHistoryBtn');
    if (clearSalesHistoryBtn) clearSalesHistoryBtn.addEventListener('click', Admin.clearSalesHistory);
}

// Window functions for modules to call
window.updateCartUI = function() {
    UI.updateCart();
    UI.renderProducts();
};

window.showModal = function(modalId) {
    UI.showModal(modalId);
};

window.hideModal = function(modalId) {
    UI.hideModal(modalId);
};

window.checkLowStock = function() {
    Notifications.checkLowStock();
};

window.setCurrentMode = function(mode) {
    currentMode = mode;
    window.currentMode = mode;
    UI.updateModeVisibility();
    UI.switchTab('products');
};

window.updateModeVisibility = function() {
    UI.updateModeVisibility();
};

window.switchTab = function(tabName) {
    UI.switchTab(tabName);
};

window.updateHistoryUI = function() {
    UI.renderHistory();
    UI.renderReports();
};

window.updateNotificationBell = function() {
    UI.updateNotificationBell();
};

// Export functions to window for onclick handlers
window.addToCart = Cart.addToCart;
window.removeFromCart = Cart.removeFromCart;
window.updateQuantity = Cart.updateQuantity;
window.showStockModal = Products.showStockModal;
window.editProduct = Products.editProduct;
window.removeImage = Products.removeImage;
window.setCartQuantity = Cart.setCartQuantity;
window.deleteProduct = Products.deleteProduct;

// Add spinner CSS
if (!document.getElementById('spinner-style')) {
    const style = document.createElement('style');
    style.id = 'spinner-style';
    style.innerHTML = `.spinner {border: 3px solid #e0e0e0; border-top: 3px solid #f44336; border-radius: 50%; width: 18px; height: 18px; animation: spin 1s linear infinite; display:inline-block; vertical-align:middle;} @keyframes spin {0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}`;
    document.head.appendChild(style);
} 

// Add sample products if database is empty
async function addSampleProductsIfNeeded() {
    try {
        console.log('🔍 Checking Firebase connection and existing products...');
        const querySnapshot = await getDocs(collection(db, 'products'));
        console.log(`📊 Found ${querySnapshot.size} existing products`);
        
        if (querySnapshot.empty) {
            console.log('📦 No products found, adding sample data...');
            await addSampleProducts();
        } else {
            console.log('✅ Products already exist in database');
        }
        
        // Check for sample sales history
        const salesSnapshot = await getDocs(collection(db, 'salesHistory'));
        console.log(`💰 Found ${salesSnapshot.size} existing sales`);
        
        if (salesSnapshot.empty) {
            console.log('📦 No sales history found, adding sample sales...');
            await addSampleSales();
        } else {
            console.log('✅ Sales history already exists in database');
        }
    } catch (error) {
        console.error('❌ Error checking for sample data:', error);
        console.error('This might be a Firebase connection issue. Please check your internet connection and Firebase configuration.');
    }
}

async function addSampleProducts() {
    const sampleProducts = [
        {
            name: 'ข้าวหอมมะลิ',
            brand: 'หอมมะลิ',
            price: 45.00,
            stock: 100,
            image: null
        },
        {
            name: 'ข้าวขาว',
            brand: 'ข้าวขาว',
            price: 35.00,
            stock: 150,
            image: null
        },
        {
            name: 'ข้าวกล้อง',
            brand: 'ข้าวกล้อง',
            price: 55.00,
            stock: 80,
            image: null
        },
        {
            name: 'ข้าวเหนียว',
            brand: 'ข้าวเหนียว',
            price: 40.00,
            stock: 120,
            image: null
        },
        {
            name: 'ข้าวหอมนิล',
            brand: 'หอมนิล',
            price: 65.00,
            stock: 60,
            image: null
        },
        {
            name: 'ข้าวไรซ์เบอร์รี่',
            brand: 'ไรซ์เบอร์รี่',
            price: 75.00,
            stock: 40,
            image: null
        }
    ];

    console.log('Adding sample products to Firebase...');
    
    for (const product of sampleProducts) {
        try {
            await addProductToFirestore(product);
            console.log(`✅ Added sample product: ${product.name} (${product.stock} ถุง)`);
        } catch (error) {
            console.error(`❌ Error adding sample product ${product.name}:`, error);
        }
    }
    
    console.log('🎉 Sample products added successfully!');
    alert('เพิ่มข้อมูลตัวอย่างสำเร็จ! ระบบจะแสดงสินค้าภายในไม่กี่วินาที');
}

async function addSampleSales() {
    const sampleSales = [
        {
            date: new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleString('th-TH'), // 1 วันที่แล้ว
            items: [
                { id: 'sample1', name: 'ข้าวหอมมะลิ', price: 45.00, quantity: 2 },
                { id: 'sample2', name: 'ข้าวขาว', price: 35.00, quantity: 1 }
            ],
            total: 125.00,
            received: 150.00,
            change: 25.00
        },
        {
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleString('th-TH'), // 2 วันที่แล้ว
            items: [
                { id: 'sample3', name: 'ข้าวกล้อง', price: 55.00, quantity: 1 },
                { id: 'sample4', name: 'ข้าวเหนียว', price: 40.00, quantity: 3 }
            ],
            total: 175.00,
            received: 200.00,
            change: 25.00
        },
        {
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleString('th-TH'), // 3 วันที่แล้ว
            items: [
                { id: 'sample5', name: 'ข้าวหอมนิล', price: 65.00, quantity: 1 },
                { id: 'sample6', name: 'ข้าวไรซ์เบอร์รี่', price: 75.00, quantity: 1 }
            ],
            total: 140.00,
            received: 150.00,
            change: 10.00
        }
    ];

    console.log('Adding sample sales to Firebase...');
    
    for (const sale of sampleSales) {
        try {
            await addSaleToFirestore(sale);
            console.log(`✅ Added sample sale: ${sale.date} - ${sale.total} บาท`);
        } catch (error) {
            console.error(`❌ Error adding sample sale:`, error);
        }
    }
    
    console.log('🎉 Sample sales added successfully!');
} 