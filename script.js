// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            this.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }

    // Menu navigation
    const menuNavBtns = document.querySelectorAll('.menu-nav-btn');
    const menuCategories = document.querySelectorAll('.menu-category');

    if (menuNavBtns.length > 0) {
        menuNavBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove active class from all buttons
                menuNavBtns.forEach(b => b.classList.remove('active'));

                // Add active class to clicked button
                this.classList.add('active');

                const category = this.getAttribute('data-category');

                // Show/hide categories based on selection
                if (category === 'all') {
                    menuCategories.forEach(cat => cat.style.display = 'block');
                } else {
                    menuCategories.forEach(cat => {
                        if (cat.querySelector('h3').textContent.toLowerCase().includes(category)) {
                            cat.style.display = 'block';
                        } else {
                            cat.style.display = 'none';
                        }
                    });
                }
            });
        });
    }

    // Reservation form submission
    const reservationForm = document.getElementById('reservation-form');
    if (reservationForm) {
        reservationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                name: reservationForm.querySelector('[name="name"]').value,
                email: reservationForm.querySelector('[name="email"]').value,
                phone: reservationForm.querySelector('[name="phone"]').value,
                guests: parseInt(reservationForm.querySelector('[name="guests"]').value),
                date: reservationForm.querySelector('[name="date"]').value,
                time: reservationForm.querySelector('[name="time"]').value,
                specialRequests: reservationForm.querySelector('[name="special-requests"]').value
            };

            try {
                const response = await fetch('/api/reservations', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    alert('Reservation created successfully!');
                    reservationForm.reset();
                } else {
                    const error = await response.json();
                    alert('Failed to create reservation: ' + error.error);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while creating the reservation');
            }
        });
    }

    // Contact form submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const formData = new FormData(contactForm);
            try {
                const response = await fetch('http://localhost:3000/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(Object.fromEntries(formData))
                });
                const data = await response.json();
                alert('Thank you for your message! We will get back to you soon.');
                contactForm.reset();
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while sending your message');
            }
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Adjust for navbar height
                    behavior: 'smooth'
                });

                // Close mobile menu if open
                if (mobileMenuBtn && mobileMenuBtn.classList.contains('active')) {
                    mobileMenuBtn.classList.remove('active');
                    navLinks.classList.remove('active');
                }
            }
        });
    });

    // Order Page Functionality
    if (window.location.pathname.includes('order.html')) {
        initializeOrderPage();
    }
});

function initializeOrderPage() {
    // Toggle between delivery and pickup tabs
    document.querySelectorAll('.order-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            document.querySelectorAll('.order-tab').forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            this.classList.add('active');

            // Hide all tab content
            document.querySelectorAll('.delivery-info').forEach(content => content.classList.remove('active'));
            // Show the selected tab content
            document.getElementById(this.dataset.tab + '-tab').classList.add('active');

            // Update delivery fee based on selected option
            updateOrderSummary();
        });
    });

    // Quantity controls
    document.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const itemId = this.dataset.id;
            const input = document.querySelector(`.quantity-input[data-id="${itemId}"]`);
            const currentValue = parseInt(input.value);

            if (this.classList.contains('plus')) {
                input.value = currentValue + 1;
            } else if (this.classList.contains('minus') && currentValue > 0) {
                input.value = currentValue - 1;
            }

            // Trigger change event to update cart
            const event = new Event('change');
            input.dispatchEvent(event);
        });
    });

    // Input change handler
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', function() {
            // Update the cart whenever quantity changes
            updateCart();

            // Add visual feedback
            if (parseInt(this.value) > 0) {
                const menuItem = this.closest('.menu-item');
                menuItem.classList.add('selected');

                // Add a brief animation effect
                menuItem.style.animation = 'none';
                setTimeout(() => {
                    menuItem.style.animation = 'pulseGreen 0.5s';
                }, 10);
            } else {
                const menuItem = this.closest('.menu-item');
                menuItem.classList.remove('selected');
            }
        });
    });

    // Validate delivery form fields when they change
    const deliveryForm = document.getElementById('delivery-form');
    if (deliveryForm) {
        const formInputs = deliveryForm.querySelectorAll('input[required]');
        formInputs.forEach(input => {
            input.addEventListener('change', validateForms);
        });
    }

    // Validate pickup form fields when they change
    const pickupForm = document.getElementById('pickup-form');
    if (pickupForm) {
        const formInputs = pickupForm.querySelectorAll('input[required], select[required]');
        formInputs.forEach(input => {
            input.addEventListener('change', validateForms);
        });
    }

    // Checkout button handler
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', async () => {
            const activeTab = document.querySelector('.order-tab.active').dataset.tab;
            const form = document.getElementById(activeTab + '-form');
            
            if (!form) {
                alert('Please select a delivery method');
                return;
            }

            const formData = {
                orderType: activeTab,
                name: form.querySelector('[name="name"]').value,
                email: form.querySelector('[name="email"]').value,
                phone: form.querySelector('[name="phone"]').value,
                items: getCartItems(),
                subtotal: parseFloat(document.querySelector('.subtotal .amount').textContent.replace('$', '')),
                deliveryFee: parseFloat(document.querySelector('.delivery-fee .amount').textContent.replace('$', '')),
                tax: parseFloat(document.querySelector('.tax .amount').textContent.replace('$', '')),
                total: parseFloat(document.querySelector('.total .amount').textContent.replace('$', ''))
            };

            if (activeTab === 'delivery') {
                formData.address = form.querySelector('[name="address"]').value;
                formData.city = form.querySelector('[name="city"]').value;
                formData.postalCode = form.querySelector('[name="postal"]').value;
                formData.deliveryNotes = form.querySelector('[name="delivery-notes"]').value;
            } else {
                formData.pickupTime = form.querySelector('[name="pickup-time"]').value;
            }

            try {
                const response = await fetch('/api/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    alert('Order placed successfully!');
                    form.reset();
                    clearCart();
                } else {
                    const error = await response.json();
                    alert('Failed to place order: ' + error.error);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while placing the order');
            }
        });
    }

    // Initialize the cart on page load
    updateCart();
}

function updateCart() {
    const cartItems = document.querySelector('.cart-items');
    const emptyCart = document.querySelector('.empty-cart');
    let cartHtml = '';
    let subtotal = 0;

    // Get all items with quantity > 0
    const items = Array.from(document.querySelectorAll('.quantity-input')).filter(input => parseInt(input.value) > 0);

    if (items.length === 0) {
        if (emptyCart) {
            emptyCart.style.display = 'block';
        }
        document.querySelector('.checkout-btn').disabled = true;
    } else {
        if (emptyCart) {
            emptyCart.style.display = 'none';
        }
        document.querySelector('.checkout-btn').disabled = false;

        items.forEach(item => {
            const quantity = parseInt(item.value);
            const price = parseFloat(item.dataset.price);
            const name = item.dataset.name;
            const itemTotal = quantity * price;
            subtotal += itemTotal;

            cartHtml += `
                <div class="cart-item">
                    <div class="cart-item-details">
                        <span class="cart-item-name">${name}</span>
                        <span class="cart-item-quantity">x${quantity}</span>
                    </div>
                    <span class="cart-item-price">$${itemTotal.toFixed(2)}</span>
                </div>
            `;
        });
    }

    if (cartItems) {
        cartItems.innerHTML = cartHtml;
        if (emptyCart && items.length === 0) {
            cartItems.appendChild(emptyCart);
        }
    }

    updateOrderSummary(subtotal);
    validateForms();
}

function updateOrderSummary(subtotal = 0) {
    const isDelivery = document.querySelector('.order-tab[data-tab="delivery"]').classList.contains('active');
    const deliveryFee = isDelivery ? 5.00 : 0.00;
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + deliveryFee + tax;

    // Update the summary display
    document.querySelector('.subtotal .amount').textContent = `$${subtotal.toFixed(2)}`;
    document.querySelector('.delivery-fee .amount').textContent = `$${deliveryFee.toFixed(2)}`;
    document.querySelector('.tax .amount').textContent = `$${tax.toFixed(2)}`;
    document.querySelector('.total .amount').textContent = `$${total.toFixed(2)}`;
}

function validateForms() {
    // Check if cart has items
    const hasItems = Array.from(document.querySelectorAll('.quantity-input'))
        .some(input => parseInt(input.value) > 0);

    if (!hasItems) {
        document.querySelector('.checkout-btn').disabled = true;
        return false;
    }

    // Check which form is active
    const isDelivery = document.querySelector('.order-tab[data-tab="delivery"]').classList.contains('active');
    let valid = true;

    if (isDelivery) {
        // Validate delivery form
        const form = document.getElementById('delivery-form');
        const requiredFields = form.querySelectorAll('input[required]');

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                valid = false;
                field.classList.add('invalid');
            } else {
                field.classList.remove('invalid');
            }
        });
    } else {
        // Validate pickup form
        const form = document.getElementById('pickup-form');
        const requiredFields = form.querySelectorAll('input[required], select[required]');

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                valid = false;
                field.classList.add('invalid');
            } else {
                field.classList.remove('invalid');
            }
        });
    }

    // Enable/disable checkout button based on validation
    document.querySelector('.checkout-btn').disabled = !valid;
    return valid;
}

function getCartItems() {
    const items = [];
    document.querySelectorAll('.quantity-input').forEach(input => {
        if (parseInt(input.value) > 0) {
            items.push({
                name: input.dataset.name,
                price: parseFloat(input.dataset.price),
                quantity: parseInt(input.value)
            });
        }
    });
    return items;
}

function clearCart() {
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.value = '0';
    });
    updateCartSummary();
}

function updateCartSummary() {
    const items = getCartItems();
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = 5.00; // Example delivery fee
    const tax = subtotal * 0.1; // 10% tax

    document.querySelector('.subtotal .amount').textContent = `$${subtotal.toFixed(2)}`;
    document.querySelector('.delivery-fee .amount').textContent = `$${deliveryFee.toFixed(2)}`;
    document.querySelector('.tax .amount').textContent = `$${tax.toFixed(2)}`;
    document.querySelector('.total .amount').textContent = `$${(subtotal + deliveryFee + tax).toFixed(2)}`;

    const checkoutBtn = document.querySelector('.checkout-btn');
    checkoutBtn.disabled = items.length === 0;
}
