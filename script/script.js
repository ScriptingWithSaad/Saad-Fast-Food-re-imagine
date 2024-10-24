// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Item prices (in dollars)
    const itemPrices = {
        'burger': 8.99,
        'Cheese burger': 9.99,
        'Cheeseburger': 10.99,
        'Hamburger': 7.99,
        'hamburger': 7.99,
        'Pizza': 12.99,
        'cheeze pizza': 14.99,
        'Hot dog': 5.99,
        'roast chicken': 15.99,
        'Taco': 4.99,
        'sandwich': 6.99,
        'paratha roll': 7.99,
        'Tikke': 11.99,
        'onion rings': 4.99,
        'Nuggets': 8.99,
        'Noodle': 9.99,
        'kabab': 13.99,
        'Burrito': 10.99,
        'barbeque': 16.99,
        'Muffin': 3.99,
        'Muffin cake': 4.99,
        'Pancake': 6.99,
        'donuts': 3.99,
        'Divine Donuts': 4.99,
        'milkshakes': 5.99,
        'choclate Milkshake': 6.99,
        'stawberry Milkshake': 6.99,
        'cocala': 2.99
    };

    // Initialize cart state
    const cart = {
        items: {},
        total: 0,
        isVisible: false
    };

    // Create cart UI
    const cartUI = document.createElement('div');
    cartUI.className = 'cart-container';
    cartUI.innerHTML = `
        <div class="cart-icon">
            🛒 <span class="cart-count">0</span>
        </div>
        <div class="cart-content" style="display: none;">
            <div class="cart-header">
                <h3>Your Cart</h3>
                <span class="cart-total">Total: $0.00</span>
            </div>
            <div class="cart-items"></div>
            <button class="checkout-btn">Checkout</button>
        </div>
    `;
    
    document.querySelector('.callaction').appendChild(cartUI);

    // Hamburger Menu Functionality
    function createHamburger() {
        const hamburger = document.createElement('div');
        hamburger.className = 'hamburger';
        hamburger.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;
        
        const nav = document.querySelector('.Navigation-bar');
        nav.appendChild(hamburger);
        
        const menuList = document.querySelector('.list-styling');
        
        hamburger.addEventListener('click', function() {
            this.classList.toggle('active');
            menuList.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!menuList.contains(e.target) && !hamburger.contains(e.target)) {
                hamburger.classList.remove('active');
                menuList.classList.remove('active');
            }
        });

        // Close menu when clicking a link
        menuList.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                menuList.classList.remove('active');
            });
        });
    }

    // Initialize hamburger menu
    createHamburger();

    // Initialize Search
    const searchIcon = document.getElementById('searchIcon');
    const searchTab = document.getElementById('smallSearchTab');
    const searchInput = searchTab.querySelector('input');
    
    // Toggle search tab
    searchIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        searchTab.style.display = searchTab.style.display === 'none' ? 'block' : 'none';
        if (searchTab.style.display === 'block') {
            searchInput.focus();
        }
    });

    // Close search tab when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchTab.contains(e.target) && e.target !== searchIcon) {
            searchTab.style.display = 'none';
        }
    });

    // Search functionality
    searchTab.querySelector('form').addEventListener('submit', (e) => {
        e.preventDefault();
        const searchTerm = searchInput.value.toLowerCase();
        const cards = document.querySelectorAll('.cards');
        
        cards.forEach(card => {
            const cardText = card.textContent.toLowerCase();
            if (cardText.includes(searchTerm)) {
                card.style.display = 'block';
                card.style.animation = 'highlight 1s ease';
            } else {
                card.style.display = 'none';
            }
        });
    });

    // Add event listeners for cart icon
    const cartIcon = cartUI.querySelector('.cart-icon');
    const cartContent = cartUI.querySelector('.cart-content');
    
    cartIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        cart.isVisible = !cart.isVisible;
        cartContent.style.display = cart.isVisible ? 'block' : 'none';
    });

    // Modified click event listener for document
    document.addEventListener('click', (e) => {
        const isCartClick = cartUI.contains(e.target);
        const isQuantityBtn = e.target.classList.contains('quantity-btn');
        const isRemoveBtn = e.target.classList.contains('remove-btn');
        
        if (!isCartClick && !isQuantityBtn && !isRemoveBtn) {
            cart.isVisible = false;
            cartContent.style.display = 'none';
        }
    });

    // Stop propagation for cart content clicks
    cartContent.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Add functionality to cards
    document.querySelectorAll('.cards').forEach(card => {
        const itemName = card.querySelector('div:last-child').textContent.trim();
        const price = itemPrices[itemName] || 9.99;

        const priceElement = document.createElement('div');
        priceElement.className = 'item-price';
        priceElement.textContent = `$${price.toFixed(2)}`;
        card.insertBefore(priceElement, card.lastElementChild);

        const addButton = document.createElement('button');
        addButton.className = 'add-to-cart-btn';
        addButton.textContent = 'Add to Cart';
        
        addButton.addEventListener('click', (e) => {
            e.stopPropagation();
            addToCart(itemName, price);
        });
        
        card.appendChild(addButton);

        card.addEventListener('mouseover', () => {
            card.style.transform = 'translateY(-10px)';
            card.style.transition = 'transform 0.3s ease';
        });

        card.addEventListener('mouseout', () => {
            card.style.transform = 'translateY(0)';
        });
    });

    // Cart functions
    function addToCart(itemName, price) {
        if (cart.items[itemName]) {
            cart.items[itemName].quantity++;
        } else {
            cart.items[itemName] = {
                price: price,
                quantity: 1
            };
        }
        cart.total += price;
        updateCartUI();
        showNotification(`Added ${itemName} to cart!`);
    }

    function removeFromCart(itemName) {
        if (cart.items[itemName]) {
            cart.total -= cart.items[itemName].price * cart.items[itemName].quantity;
            delete cart.items[itemName];
            updateCartUI();
            showNotification(`Removed ${itemName} from cart`);
        }
    }

    function updateQuantity(itemName, change) {
        if (cart.items[itemName]) {
            cart.items[itemName].quantity += change;
            cart.total += cart.items[itemName].price * change;
            
            if (cart.items[itemName].quantity <= 0) {
                removeFromCart(itemName);
            } else {
                updateCartUI();
            }
        }
    }

    function updateCartUI() {
        const cartCount = cartUI.querySelector('.cart-count');
        const cartItems = cartUI.querySelector('.cart-items');
        const cartTotal = cartUI.querySelector('.cart-total');
        
        cartCount.textContent = Object.values(cart.items)
            .reduce((sum, item) => sum + item.quantity, 0);

        cartItems.innerHTML = '';
        Object.entries(cart.items).forEach(([itemName, item]) => {
            const itemTotal = item.price * item.quantity;
            
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <span>${itemName}</span>
                <div class="quantity-controls">
                    <button class="quantity-btn minus">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn plus">+</button>
                </div>
                <span class="item-total">$${itemTotal.toFixed(2)}</span>
                <button class="remove-btn">×</button>
            `;

            itemElement.querySelector('.minus').addEventListener('click', (e) => {
                e.stopPropagation();
                updateQuantity(itemName, -1);
            });
            
            itemElement.querySelector('.plus').addEventListener('click', (e) => {
                e.stopPropagation();
                updateQuantity(itemName, 1);
            });
            
            itemElement.querySelector('.remove-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                removeFromCart(itemName);
            });

            cartItems.appendChild(itemElement);
        });

        cartTotal.textContent = `Total: $${cart.total.toFixed(2)}`;
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Remove price and cart buttons from Food-Delivery section
    document.querySelectorAll('.Food-Delivery .cards').forEach(card => {
        const priceElement = card.querySelector('.item-price');
        if (priceElement) priceElement.remove();
        
        const cartButton = card.querySelector('.add-to-cart-btn');
        if (cartButton) cartButton.remove();
    });

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Mobile touch events
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    });

    document.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchEndX - touchStartX;
        
        if (Math.abs(diff) > swipeThreshold) {
            const hamburger = document.querySelector('.hamburger');
            const menuList = document.querySelector('.list-styling');
            const cartContent = document.querySelector('.cart-content');

            hamburger.classList.remove('active');
            menuList.classList.remove('active');
            cartContent.style.display = 'none';
        }
    }

    // Window resize handler
    window.addEventListener('resize', () => {
        const menuList = document.querySelector('.list-styling');
        const hamburger = document.querySelector('.hamburger');
        
        if (window.innerWidth > 480) {
            menuList.classList.remove('active');
            hamburger.classList.remove('active');
            menuList.style.display = 'block';
        } else {
            menuList.style.display = menuList.classList.contains('active') ? 'block' : 'none';
        }
    });

    // Add required CSS
    const styles = document.createElement('style');
    styles.textContent = `
        .cart-container {
            position: relative;
            margin-left: 20px;
        }
        
        .cart-icon {
            cursor: pointer;
            font-size: 1.5rem;
            position: relative;
        }
        
        .cart-count {
            position: absolute;
            top: -8px;
            right: -8px;
            background: #ff4d4d;
            color: white;
            border-radius: 50%;
            padding: 2px 6px;
            font-size: 0.8rem;
        }
        
        .cart-content {
            position: absolute;
            top: 100%;
            right: 0;
            background: white;
            padding: 1rem;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            min-width: 300px;
            z-index: 1000;
        }
        
        .cart-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
        }
        
        .cart-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        
        .quantity-controls {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .quantity-btn {
            background: #ff4d4d;
            color: white;
            border: none;
            border-radius: 4px;
            width: 24px;
            height: 24px;
            cursor: pointer;
        }
        
        .remove-btn {
            background: none;
            border: none;
            color: #ff4d4d;
            font-size: 18px;
            cursor: pointer;
        }
        
        .checkout-btn {
            width: 100%;
            padding: 0.5rem;
            background: #ff4d4d;
            color: white;
            border: none;
            border-radius: 4px;
            margin-top: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .checkout-btn:hover {
            background: #ff3333;
        }
        
         .add-to-cart-btn {
            background: #ff4d4d;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            margin-top: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .add-to-cart-btn:hover {
            background: #ff3333;
        }

        .item-price {
            color: #ff4d4d;
            font-weight: bold;
            margin: 10px 0;
        }
        
        .notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #ff4d4d;
            color: white;
            padding: 12px 24px;
            border-radius: 4px;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.3s ease;
            z-index: 1001;
        }
        
        .notification.show {
            opacity: 1;
            transform: translateY(0);
        }

        @keyframes highlight {
            0% { background-color: yellow; }
            100% { background-color: transparent; }
        }
    `;

    document.head.appendChild(styles);
});