let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

let appliedCoupon = null;
let discountAmount = 0;

function getStoredImagePath(imagePath) {
    if (!imagePath) return '';

    if (
        imagePath.startsWith('http://') ||
        imagePath.startsWith('https://') ||
        imagePath.startsWith('file://') ||
        imagePath.startsWith('data:') ||
        imagePath.startsWith('blob:')
    ) {
        return imagePath;
    }

    return new URL(imagePath, window.location.href).href;
}

function showCouponMessage(message, color = '#006400') {
    const couponSection = document.getElementById('coupon');
    if (!couponSection) return;

    let couponMessage = document.getElementById('couponMessage');
    if (!couponMessage) {
        couponMessage = document.createElement('p');
        couponMessage.id = 'couponMessage';
        couponMessage.style.marginTop = '10px';
        couponMessage.style.marginBottom = '0';
        couponMessage.style.fontSize = '14px';
        couponMessage.style.fontWeight = '500';
        couponSection.appendChild(couponMessage);
    }

    couponMessage.innerText = message;
    couponMessage.style.color = color;
    couponMessage.style.fontSize = '14px';
    couponMessage.style.fontWeight = '500';
}

function addToCart(event, name, price, image) {
    event.preventDefault();

    let cart = JSON.parse(localStorage.getItem('cartItems')) || [];

    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: name,
            price: price,
            quantity: 1,
            image: getStoredImagePath(image)
        });
    }

    localStorage.setItem('cartItems', JSON.stringify(cart));

    alert("Item added to cart!");
}

function addProductPageToCart(event, name, price, image) {
    event.preventDefault();

    const qtyInput = document.getElementById('product-qty');
    const quantity = parseInt(qtyInput.value) || 1;

    let cart = JSON.parse(localStorage.getItem('cartItems')) || [];
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            name: name,
            price: price,
            quantity: quantity,
            image: getStoredImagePath(image)
        });
    }

    localStorage.setItem('cartItems', JSON.stringify(cart));

    alert("Item added to cart!");

    window.location.href = '../HTML/cart.html';
}

// Function to render the cart items as table rows
function renderCart() {
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    cartItemsContainer.innerHTML = ''; // Clear existing content

    // Handle empty cart state
    if (cartItems.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="6" style="text-align:center; padding:20px; color:#B22222; font-weight:600; font-size:20px;">
                Your cart is currently empty.
            </td>
        `;
        cartItemsContainer.appendChild(row);

        document.getElementById('cartSubtotal').innerText = `AED 0.00`;
        document.getElementById('cartTotal').innerText = `AED 0.00`;

        const deliveryElement = document.getElementById('deliveryFee');
        if (deliveryElement) {
            deliveryElement.innerText = `AED 0.00`;
        }

        // Disable checkout button if present
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.disabled = true;
            checkoutBtn.style.opacity = '0.5';
            checkoutBtn.style.cursor = 'not-allowed';
        }

        appliedCoupon = null;
        discountAmount = 0;

        const couponInput = document.querySelector('#coupon input');
        const couponBtn = document.querySelector('#coupon button');
        if (couponInput) {
            couponInput.disabled = false;
            couponInput.value = '';
        }
        if (couponBtn) {
            couponBtn.disabled = false;
            couponBtn.style.opacity = '1';
            couponBtn.style.cursor = 'pointer';
        }

        showCouponMessage('');

        return;
    }

    cartItems.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><a href="#" onclick="deleteItem(${index})"><i class="fa-solid fa-circle-xmark"></i></a></td>
            <td><img src="${getStoredImagePath(item.image)}" alt="${item.name}" style="width: 80px;"></td>
            <td>${item.name}</td>
            <td>AED ${item.price.toFixed(2)}</td>
            <td><input type="number" value="${item.quantity}" min="1" onchange="updateQuantity(${index}, this.value)"></td>
            <td>AED ${(item.price * item.quantity).toFixed(2)}</td>
        `;
        cartItemsContainer.appendChild(row);
    });

    updateTotal();

    // Re-enable checkout button when cart has items
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.disabled = false;
        checkoutBtn.style.opacity = '1';
        checkoutBtn.style.cursor = 'pointer';
    }
}

// Function to update the quantity
function updateQuantity(index, value) {
    cartItems[index].quantity = parseInt(value) || 1; // Ensure quantity is at least 1
    renderCart();
}

// Function to delete an item from the cart
function deleteItem(index) {
    cartItems.splice(index, 1);
    renderCart();
}

// Coupons
function applyCoupon() {
    const couponInput = document.querySelector('#coupon input');
    const couponBtn = document.querySelector('#coupon button');

    if (!couponInput) return;

    const code = couponInput.value.trim().toUpperCase();

    if (appliedCoupon) {
        showCouponMessage('A coupon has already been applied.', '#B22222');
        return;
    }

    if (code === 'SAVE10') {
        appliedCoupon = 'SAVE10';
        updateTotal();
        showCouponMessage('Coupon applied successfully. 10% discount added.', '#006400');

        if (couponBtn) {
            couponBtn.disabled = true;
            couponBtn.style.opacity = '0.5';
            couponBtn.style.cursor = 'not-allowed';
        }

        couponInput.disabled = true;
    } else {
        showCouponMessage('Invalid coupon code.', '#B22222');
    }
}

function updateTotal() {
    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

    discountAmount = appliedCoupon === 'SAVE10' ? subtotal * 0.10 : 0;

    const deliveryFee = cartItems.length > 0 ? 5 : 0;

    const total = subtotal - discountAmount + deliveryFee;

    document.getElementById('cartSubtotal').innerText = `AED ${subtotal.toFixed(2)}`;

    const deliveryElement = document.getElementById('deliveryFee');
    if (deliveryElement) {
        deliveryElement.innerText = `AED ${deliveryFee.toFixed(2)}`;
    }

    document.getElementById('cartTotal').innerText = `AED ${total.toFixed(2)}`;
}

const couponBtn = document.querySelector('#coupon button');
const couponInput = document.querySelector('#coupon input');

if (couponBtn) {
    couponBtn.addEventListener('click', applyCoupon);
}

if (couponInput) {
    couponInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            applyCoupon();
        }
    });
}

renderCart();