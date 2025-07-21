import { getDocs, collection, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
// Admin Management Functions

// Global variables (will be set by initialize function)
let db, salesHistory, notificationHistory, notificationCount;
let clearNotificationHistoryFirestore;

// Initialize function to set global variables
function initialize(dbRef, salesHistoryRef, notificationHistoryRef, notificationCountRef, clearNotificationHistoryFirestoreRef) {
    db = dbRef;
    salesHistory = salesHistoryRef;
    notificationHistory = notificationHistoryRef;
    notificationCount = notificationCountRef;
    clearNotificationHistoryFirestore = clearNotificationHistoryFirestoreRef;
}

// Update sales history function
function updateSalesHistory(salesHistoryRef) {
    salesHistory = salesHistoryRef;
}

function handleAdminLogin() {
    const password = document.getElementById('adminPassword').value;
    if (password === 'admin123') {
        // Update currentMode (need to call from main app)
        if (typeof window.setCurrentMode === 'function') {
            window.setCurrentMode('admin');
        }
        
        document.getElementById('adminMode').classList.add('active');
        document.getElementById('userMode').classList.remove('active');
        document.getElementById('statusText').textContent = 'โหมดผู้ดูแล';
        
        // Update mode visibility (need to call from main app)
        if (typeof window.updateModeVisibility === 'function') {
            window.updateModeVisibility();
        }
        
        // Hide modal (need to call from main app)
        if (typeof window.hideModal === 'function') {
            window.hideModal('adminLoginModal');
        }
        
        document.getElementById('adminPassword').value = '';

    } else {
        alert('รหัสผ่านไม่ถูกต้อง');
        // Focus กลับที่ input field หลังจาก alert
        setTimeout(() => {
            document.getElementById('adminPassword').focus();
        }, 100);
    }
}

async function clearSalesHistory() {
    const btn = document.getElementById('clearSalesHistoryBtn');
    if (!confirm('คุณแน่ใจหรือไม่ที่จะล้างประวัติการขายทั้งหมด?')) return;
    btn.disabled = true;
    const oldText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner" style="margin-right:8px;width:18px;height:18px;vertical-align:middle;"></span>กำลังลบ...';
    
    // ลบทุก doc ใน salesHistory (Firestore)
    const querySnapshot = await getDocs(collection(db, 'salesHistory'));
    for (const docSnap of querySnapshot.docs) {
        await deleteDoc(doc(db, 'salesHistory', docSnap.id));
    }
    salesHistory = [];
    
    // Update UI (need to call from main app)
    if (typeof window.updateHistoryUI === 'function') {
        window.updateHistoryUI();
    }
    
    btn.disabled = false;
    btn.innerHTML = oldText;
    alert('ล้างประวัติการขายเรียบร้อยแล้ว');
}

async function clearNotificationHistory() {
    const btn = document.getElementById('clearNotifications');
    if (!confirm('คุณแน่ใจหรือไม่ที่จะล้างประวัติการแจ้งเตือนทั้งหมด?')) return;
    btn.disabled = true;
    const oldText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner" style="margin-right:8px;width:18px;height:18px;vertical-align:middle;"></span>กำลังลบ...';
    await clearNotificationHistoryFirestore();
    notificationHistory = [];
    notificationCount = 0;
    
    // Update notification bell (need to call from main app)
    if (typeof window.updateNotificationBell === 'function') {
        window.updateNotificationBell();
    }
    
    // Hide modal (need to call from main app)
    if (typeof window.hideModal === 'function') {
        window.hideModal('notificationHistoryModal');
    }
    
    btn.disabled = false;
    btn.innerHTML = oldText;
    alert('ล้างประวัติการแจ้งเตือนเรียบร้อยแล้ว');
}

function printHistoryPDF() {
    // print เฉพาะส่วนประวัติการขาย
    const printContents = document.getElementById('historyListPrintArea').innerHTML;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = `<h2 style='text-align:center;'>ประวัติการขาย</h2>` + printContents;
    window.print();
    document.body.innerHTML = originalContents;
    location.reload(); // reload เพื่อให้ event กลับมา
}

// Export functions
export {
    initialize,
    updateSalesHistory,
    handleAdminLogin,
    clearSalesHistory,
    clearNotificationHistory,
    printHistoryPDF
}; 