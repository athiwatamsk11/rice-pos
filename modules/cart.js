// Cart Management Functions

// Global variables (will be set by initialize function)
let products, cart;
let addSaleToFirestore, updateProductInFirestore;

// Initialize function to set global variables
function initialize(productsRef, cartRef, addSaleToFirestoreRef, updateProductInFirestoreRef) {
    products = productsRef;
    cart = cartRef;
    addSaleToFirestore = addSaleToFirestoreRef;
    updateProductInFirestore = updateProductInFirestoreRef;
}

// Update products function
function updateProducts(productsRef) {
    products = productsRef;
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product || product.stock === 0) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        if (existingItem.quantity < product.stock) {
            existingItem.quantity++;
        } else {
            alert('สินค้าไม่เพียงพอ');
            return;
        }
    } else {
        cart.push({
            id: productId,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }

    // Update cart UI (need to call from main app)
    if (typeof window.updateCartUI === 'function') {
        window.updateCartUI();
    }
}

function removeFromCart(productId) {
    const index = cart.findIndex(item => item.id === productId);
    if (index !== -1) {
        cart.splice(index, 1);
        // Update cart UI (need to call from main app)
        if (typeof window.updateCartUI === 'function') {
            window.updateCartUI();
        }
    }
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    const product = products.find(p => p.id === productId);

    if (item && product) {
        const newQuantity = item.quantity + change;
        if (newQuantity > 0 && newQuantity <= product.stock) {
            item.quantity = newQuantity;
        } else if (newQuantity <= 0) {
            removeFromCart(productId);
            return;
        } else {
            alert('สินค้าไม่เพียงพอ');
            return;
        }
        // Update cart UI (need to call from main app)
        if (typeof window.updateCartUI === 'function') {
            window.updateCartUI();
        }
    }
}

function setCartQuantity(productId, value) {
    const item = cart.find(item => item.id === productId);
    const product = products.find(p => p.id === productId);
    let qty = parseInt(value);
    if (!item || !product || isNaN(qty)) return;
    if (qty < 1) qty = 1;
    if (qty > product.stock) qty = product.stock;
    item.quantity = qty;
    // Update cart UI (need to call from main app)
    if (typeof window.updateCartUI === 'function') {
        window.updateCartUI();
    }
}

function handleCheckout() {
    if (cart.length === 0) return;

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('checkoutTotal').value = `${total.toFixed(2)} บาท`;
    document.getElementById('receivedAmount').value = '';
    document.getElementById('changeAmount').value = '';
    
    // Show modal (need to call from main app)
    if (typeof window.showModal === 'function') {
        window.showModal('checkoutModal');
    }

    setTimeout(() => {
        document.getElementById('receivedAmount').focus();
    }, 100);
}

function calculateChange() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const received = parseFloat(document.getElementById('receivedAmount').value) || 0;
    const change = received - total;
    document.getElementById('changeAmount').value = change >= 0 ? `${change.toFixed(2)} บาท` : '0.00 บาท';
}

function handleConfirmCheckout() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const received = parseFloat(document.getElementById('receivedAmount').value) || 0;

    if (received < total) {
        alert('จำนวนเงินที่รับไม่เพียงพอ');
        return;
    }

    // Update stock
    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (product) {
            product.stock -= item.quantity;
            updateProductInFirestore(product.id, { stock: product.stock });
        }
    });

    // Add to sales history
    const newSale = {
        date: new Date().toLocaleString('th-TH'),
        items: [...cart],
        total: total,
        received: received,
        change: received - total
    };
    
    console.log('💾 Saving sale to Firebase:', newSale);
    addSaleToFirestore(newSale);

    // Clear cart
    cart.length = 0;
    
    // Update cart UI (need to call from main app)
    if (typeof window.updateCartUI === 'function') {
        window.updateCartUI();
    }
    
    // Hide modal (need to call from main app)
    if (typeof window.hideModal === 'function') {
        window.hideModal('checkoutModal');
    }

    alert(`ขายสำเร็จ!\nยอดรวม: ${total.toFixed(2)} บาท\nเงินทอน: ${(received - total).toFixed(2)} บาท`);

    // Check low stock (need to call from main app)
    if (typeof window.checkLowStock === 'function') {
        window.checkLowStock();
    }
}

// Export functions
export {
    initialize,
    updateProducts,
    addToCart,
    removeFromCart,
    updateQuantity,
    setCartQuantity,
    handleCheckout,
    calculateChange,
    handleConfirmCheckout
}; 