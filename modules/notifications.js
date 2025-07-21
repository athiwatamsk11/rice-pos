// Notification Management Functions

// Global variables (will be set by initialize function)
let products;
let addNotificationToFirestore;

// Initialize function to set global variables
function initialize(productsRef, addNotificationToFirestoreRef) {
    products = productsRef;
    addNotificationToFirestore = addNotificationToFirestoreRef;
}

// Update products function
function updateProducts(productsRef) {
    products = productsRef;
}

function checkLowStock() {
    const lowStockThreshold = 10; // เกณฑ์ stock ต่ำ (น้อยกว่า 10 ถุง)
    const lowStockProducts = products.filter(p => p.stock < lowStockThreshold);

    if (lowStockProducts.length > 0) {
        showLowStockNotification(lowStockProducts);
    }
}

function showLowStockNotification(lowStockProducts) {
    // บันทึกประวัติการแจ้งเตือน
    const notificationRecord = {
        type: 'low_stock',
        title: 'สินค้าใกล้หมด',
        message: `มีสินค้า ${lowStockProducts.length} รายการที่มี stock ต่ำกว่า 10 ถุง`,
        products: lowStockProducts.map(p => `${p.name} - เหลือ ${p.stock} ถุง`),
        timestamp: new Date().toLocaleString('th-TH'),
        read: false
    };
    addNotificationToFirestore(notificationRecord);

    const notification = document.createElement('div');
    notification.className = 'low-stock-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-header">
                <span class="notification-icon">⚠️</span>
                <span class="notification-title">สินค้าใกล้หมด</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="notification-body">
                <p>มีสินค้า ${lowStockProducts.length} รายการที่มี stock ต่ำกว่า 10 ถุง:</p>
                <ul>
                    ${lowStockProducts.map(product => `
                        <li>${product.name} - เหลือ ${product.stock} ถุง</li>
                    `).join('')}
                </ul>
            </div>
        </div>
    `;

    document.body.appendChild(notification);

    // ลบการแจ้งเตือนอัตโนมัติหลัง 10 วินาที
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 10000);
}

// Export functions
export {
    initialize,
    updateProducts,
    checkLowStock,
    showLowStockNotification
}; 