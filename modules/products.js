// Product Management Functions

// Global variables (will be set by initialize function)
let products, currentEditingProduct, currentStockProductId, currentStockAction;
let addProductToFirestore, updateProductInFirestore, deleteProductFromFirestore;

// Initialize function to set global variables
function initialize(productsRef, currentEditingProductRef, currentStockProductIdRef, currentStockActionRef, addProductToFirestoreRef, updateProductInFirestoreRef, deleteProductFromFirestoreRef) {
    products = productsRef;
    currentEditingProduct = currentEditingProductRef;
    currentStockProductId = currentStockProductIdRef;
    currentStockAction = currentStockActionRef;
    addProductToFirestore = addProductToFirestoreRef;
    updateProductInFirestore = updateProductInFirestoreRef;
    deleteProductFromFirestore = deleteProductFromFirestoreRef;
}

// Update products function
function updateProducts(productsRef) {
    products = productsRef;
}

function showAddProductModal() {
    currentEditingProduct = null;
    document.getElementById('productModalTitle').textContent = 'เพิ่มสินค้าใหม่';
    document.getElementById('productName').value = '';
    document.getElementById('productBrand').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productImage').value = '';
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('imagePreview').src = '';
    document.getElementById('removeImageBtn').style.display = 'none';
    
    // Show modal
    window.showModal('productModal');
}

function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        currentEditingProduct = product;
        document.getElementById('productModalTitle').textContent = 'แก้ไขสินค้า';
        document.getElementById('productName').value = product.name;
        document.getElementById('productBrand').value = product.brand;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productImage').value = '';

        if (product.image) {
            document.getElementById('imagePreview').src = product.image;
            document.getElementById('imagePreview').style.display = 'block';
            document.getElementById('removeImageBtn').style.display = 'block';
        } else {
            document.getElementById('imagePreview').style.display = 'none';
            document.getElementById('removeImageBtn').style.display = 'none';
        }

        // Show modal
        window.showModal('productModal');
    }
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('ขนาดไฟล์ต้องไม่เกิน 5MB');
            event.target.value = '';
            return;
        }

        // Check file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            alert('รองรับเฉพาะไฟล์ JPG, PNG, GIF, WebP เท่านั้น');
            event.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById('imagePreview').src = e.target.result;
            document.getElementById('imagePreview').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

function removeImage() {
    document.getElementById('productImage').value = '';
    document.getElementById('imagePreview').src = '';
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('removeImageBtn').style.display = 'none';

    // If editing existing product, remove image from product
    if (currentEditingProduct) {
        currentEditingProduct.image = null;
    }
}

function handleSaveProduct() {
    const name = document.getElementById('productName').value.trim();
    const brand = document.getElementById('productBrand').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value);
    const imageFile = document.getElementById('productImage').files[0];

    if (!name || !brand || isNaN(price)) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
    }

    // Handle image
    let imageData = null;
    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function (e) {
            imageData = e.target.result;
            saveProductData(name, brand, price, imageData);
        };
        reader.readAsDataURL(imageFile);
    } else {
        // Use existing image if editing
        imageData = currentEditingProduct ? currentEditingProduct.image : null;
        saveProductData(name, brand, price, imageData);
    }
}

function saveProductData(name, brand, price, imageData) {
    if (currentEditingProduct) {
        // Edit existing product
        currentEditingProduct.name = name;
        currentEditingProduct.brand = brand;
        currentEditingProduct.price = price;
        if (imageData !== undefined) {
            currentEditingProduct.image = imageData;
        }
        updateProductInFirestore(currentEditingProduct.id, {
            name: name,
            brand: brand,
            price: price,
            image: imageData
        });
    } else {
        // Add new product
        const newProduct = {
            name: name,
            brand: brand,
            price: price,
            image: imageData
        };
        addProductToFirestore(newProduct);
    }

    // Hide modal
    window.hideModal('productModal');
    
    // Update UI
    window.updateCartUI();
}

async function deleteProduct(productId, btnEl) {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบสินค้านี้?')) return;
    if (btnEl) {
        btnEl.disabled = true;
        const oldText = btnEl.innerHTML;
        btnEl.innerHTML = '<span class="spinner" style="margin-right:8px;width:18px;height:18px;vertical-align:middle;"></span>กำลังลบ...';
        await deleteProductFromFirestore(productId);
        btnEl.disabled = false;
        btnEl.innerHTML = oldText;
    } else {
        await deleteProductFromFirestore(productId);
    }
    
    // Remove from cart
    window.removeFromCart(productId);
    
    // Update UI
    window.updateCartUI();
}

// Stock Management
function showStockModal(productId, action) {
    currentStockProductId = productId;
    currentStockAction = action;

    const product = products.find(p => p.id === productId);
    const modalTitle = document.getElementById('stockModalTitle');
    const actionText = document.getElementById('stockActionText');
    const productName = document.getElementById('stockProductName');
    const currentAmount = document.getElementById('stockCurrentAmount');
    const amountInput = document.getElementById('stockAmount');

    if (action === 'add') {
        modalTitle.textContent = 'เพิ่ม Stock';
        actionText.textContent = 'เพิ่ม';
    } else {
        modalTitle.textContent = 'ลด Stock';
        actionText.textContent = 'ลด';
    }

    productName.textContent = product.name;
    currentAmount.textContent = product.stock;

    amountInput.value = '';
    
    // Show modal
    window.showModal('stockModal');

    setTimeout(() => {
        amountInput.focus();
    }, 100);
}

function confirmStockUpdate() {
    const amount = parseInt(document.getElementById('stockAmount').value) || 0;
    const product = products.find(p => p.id === currentStockProductId);

    if (!product || amount <= 0) {
        alert('กรุณาใส่จำนวนที่ถูกต้อง');
        return;
    }

    let newStock;
    if (currentStockAction === 'add') {
        newStock = (typeof product.stock === 'number' && !isNaN(product.stock) ? product.stock : 0) + amount;
    } else {
        newStock = (typeof product.stock === 'number' && !isNaN(product.stock) ? product.stock : 0) - amount;
        if (newStock < 0) {
            alert('ไม่สามารถลด Stock ต่ำกว่า 0 ได้');
            return;
        }
    }

    updateProductInFirestore(product.id, { stock: newStock });

    // Hide modal
    window.hideModal('stockModal');
    
    // Update UI
    window.updateCartUI();

    const action = currentStockAction === 'add' ? 'เพิ่ม' : 'ลด';
    alert(`${action} Stock สำเร็จ! ${amount} ถุง`);

    // Check low stock
    window.checkLowStock();
}

// Export functions
export {
    initialize,
    updateProducts,
    showAddProductModal,
    editProduct,
    handleImageUpload,
    removeImage,
    handleSaveProduct,
    saveProductData,
    deleteProduct,
    showStockModal,
    confirmStockUpdate
}; 