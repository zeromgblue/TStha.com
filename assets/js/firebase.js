// assets/js/firebase.js — TS Tha Firebase (CDN Compat Mode)

const firebaseConfig = {
  apiKey: "AIzaSyCU4MqvLOkjFYAtfIdkglbJb_8uN-kpgz4",
  authDomain: "ts-tha.firebaseapp.com",
  projectId: "ts-tha",
  storageBucket: "ts-tha.firebasestorage.app",
  messagingSenderId: "690905904969",
  appId: "1:690905904969:web:9536a732ff61350a1d8c98",
  measurementId: "G-BQNBW3NHQZ"
};

firebase.initializeApp(firebaseConfig);

const db      = firebase.firestore();
const auth    = firebase.auth();
const storage = firebase.storage();
const googleProvider = new firebase.auth.GoogleAuthProvider();

// ===== HELPERS =====
function generateOrderId() {
  const ts  = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `#TS-${ts}${rnd}`;
}

// ===== AUTH =====
async function loginWithGoogle() {
  const result = await auth.signInWithPopup(googleProvider);
  return result.user;
}

async function loginWithEmail(email, password) {
  const result = await auth.signInWithEmailAndPassword(email, password);
  return result.user;
}

async function registerWithEmail(email, password) {
  const result = await auth.createUserWithEmailAndPassword(email, password);
  return result.user;
}

function logoutUser() {
  return auth.signOut();
}

function onAuthChange(callback) {
  return auth.onAuthStateChanged(callback);
}

// ===== ORDERS =====
async function createOrder(orderData) {
  const orderId = generateOrderId();
  await db.collection("orders").add({
    orderId,
    ...orderData,
    status: "pending",
    trackingNumber: "",
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
  return orderId;
}

async function getOrderByOrderId(orderId) {
  const snap = await db.collection("orders").get();
  const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return all.find(o => o.orderId === orderId.trim()) || null;
}

async function getAllOrders() {
  const snap = await db.collection("orders").orderBy("createdAt", "desc").get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function updateOrderStatus(docId, status, trackingNumber = "") {
  await db.collection("orders").doc(docId).update({
    status,
    trackingNumber,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
}

// ===== PRODUCTS =====
async function getAllProducts() {
  const snap = await db.collection("products").get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function addProduct(productData, imageFile) {
  let imageUrl = productData.image || "";
  if (imageFile) {
    const ref  = storage.ref(`products/${Date.now()}_${imageFile.name}`);
    const snap = await ref.put(imageFile);
    imageUrl   = await snap.ref.getDownloadURL();
  }
  const ref = await db.collection("products").add({
    ...productData,
    image: imageUrl,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
  return ref.id;
}

async function deleteProduct(docId) {
  await db.collection("products").doc(docId).delete();
}
