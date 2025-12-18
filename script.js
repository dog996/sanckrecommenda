// 全局变量：购物车数据（存储在localStorage，刷新不丢失）
let cart = JSON.parse(localStorage.getItem('snackCart')) || [];

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 1. 移动端汉堡菜单切换
    initMobileMenu();
    // 2. 商品筛选功能（商品列表页）
    initProductFilter();
    // 3. 购物车功能（添加、删除、数量调整、总价计算）
    initCartFunctions();
    // 4. 下单表单验证（购物车页）
    initOrderFormValidation();
    // 5. 初始化购物车页面渲染
    renderCart();
});

// 1. 移动端汉堡菜单切换
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            // 无障碍：更新按钮aria-label
            const isActive = mainNav.classList.contains('active');
            this.setAttribute('aria-label', isActive ? '关闭导航菜单' : '打开导航菜单');
        });
    }
}

// 2. 商品筛选功能（分类+价格）
function initProductFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const priceFilters = document.querySelectorAll('.price-filter');
    const productCards = document.querySelectorAll('.product-card');

    // 分类筛选
    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // 切换按钮激活状态
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                const filter = this.getAttribute('data-filter');
                // 筛选商品
                productCards.forEach(card => {
                    const category = card.getAttribute('data-category');
                    if (filter === 'all' || category === filter) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // 价格筛选
    if (priceFilters.length > 0) {
        priceFilters.forEach(btn => {
            btn.addEventListener('click', function() {
                // 切换按钮激活状态
                priceFilters.forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                const minPrice = parseFloat(this.getAttribute('data-min'));
                const maxPrice = parseFloat(this.getAttribute('data-max'));
                // 筛选商品
                productCards.forEach(card => {
                    const price = parseFloat(card.querySelector('.product-price').textContent.slice(1));
                    if (price >= minPrice && price <= maxPrice) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }
}

// 3. 购物车功能
function initCartFunctions() {
    // 加入购物车按钮事件
    const addToCartBtns = document.querySelectorAll('.add-to-cart');
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const name = this.getAttribute('data-name');
            const price = parseFloat(this.getAttribute('data-price'));

            // 检查商品是否已在购物车
            const existingItem = cart.find(item => item.id === id);
            if (existingItem) {
                // 已存在则增加数量
                existingItem.quantity += 1;
            } else {
                // 不存在则添加新商品
                cart.push({
                    id: id,
                    name: name,
                    price: price,
                    quantity: 1,
                    img: `./images/snack${id}.jpg` // 图片路径对应商品ID
                });
            }

            // 保存到localStorage并更新购物车
            saveCart();
            renderCart();

            // 提示用户
            alert(`${name} 已加入购物车！`);
        });
    });

    // 购物车页面：数量调整按钮事件（事件委托，因为商品是动态渲染的）
    const cartItemsContainer = document.getElementById('cart-items');
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', function(e) {
            // 减少数量
            if (e.target.classList.contains('decrease-quantity')) {
                const id = e.target.closest('.cart-item').getAttribute('data-id');
                const item = cart.find(item => item.id === id);
                if (item.quantity > 1) {
                    item.quantity -= 1;
                } else {
                    // 数量为1时删除商品
                    cart = cart.filter(item => item.id !== id);
                }
                saveCart();
                renderCart();
            }

            // 增加数量
            if (e.target.classList.contains('increase-quantity')) {
                const id = e.target.closest('.cart-item').getAttribute('data-id');
                const item = cart.find(item => item.id === id);
                item.quantity += 1;
                saveCart();
                renderCart();
            }

            // 删除商品
            if (e.target.classList.contains('cart-item-delete')) {
                const id = e.target.closest('.cart-item').getAttribute('data-id');
                cart = cart.filter(item => item.id !== id);
                saveCart();
                renderCart();
            }
        });
    }
}

// 保存购物车到localStorage
function saveCart() {
    localStorage.setItem('snackCart', JSON.stringify(cart));
}

// 渲染购物车页面
function renderCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCart = document.getElementById('empty-cart');
    const totalPriceElement = document.getElementById('total-price');
    const finalPriceElement = document.getElementById('final-price');

    if (!cartItemsContainer || !totalPriceElement || !finalPriceElement) return;

    // 计算总价
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const finalPrice = totalPrice >= 30 ? totalPrice : totalPrice + 5; // 满30免邮，否则加5元运费

    // 更新总价显示
    totalPriceElement.textContent = `¥${totalPrice.toFixed(2)}`;
    finalPriceElement.textContent = `¥${finalPrice.toFixed(2)}`;

    // 显示/隐藏空购物车提示
    if (cart.length === 0) {
        if (emptyCart) emptyCart.style.display = 'block';
        cartItemsContainer.innerHTML = ''; // 清空购物车列表
        cartItemsContainer.appendChild(emptyCart);
    } else {
        if (emptyCart) emptyCart.style.display = 'none';
        // 渲染购物车商品列表
        let cartHtml = '';
        cart.forEach(item => {
            cartHtml += `
                <div class="cart-item" data-id="${item.id}" aria-label="购物车商品：${item.name}，数量${item.quantity}，单价${item.price}元">
                    <img src="${item.img}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">¥${item.price.toFixed(2)}</div>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn decrease-quantity" aria-label="减少数量">-</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" readonly>
                        <button class="quantity-btn increase-quantity" aria-label="增加数量">+</button>
                    </div>
                    <div class="cart-item-subtotal">¥${(item.price * item.quantity).toFixed(2)}</div>
                    <button class="cart-item-delete" aria-label="删除商品"><<i class="fas fa-trash"></</i></button>
                </div>
            `;
        });
        cartItemsContainer.innerHTML = cartHtml;
    }
}

// 4. 下单表单验证
function initOrderFormValidation() {
    const orderForm = document.getElementById('order-form');
    if (!orderForm) return;

    orderForm.addEventListener('submit', function(e) {
        e.preventDefault(); // 阻止默认提交

        let isValid = true;
        const name = document.getElementById('name').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const address = document.getElementById('address').value.trim();

        // 验证姓名
        const nameError = document.getElementById('name-error');
        if (name === '') {
            nameError.textContent = '姓名不能为空';
            isValid = false;
        } else {
            nameError.textContent = '';
        }

        // 验证电话（简单正则：11位数字）
        const phoneError = document.getElementById('phone-error');
        const phoneReg = /^1[3-9]\d{9}$/;
        if (phone === '') {
            phoneError.textContent = '电话不能为空';
            isValid = false;
        } else if (!phoneReg.test(phone)) {
            phoneError.textContent = '请输入有效的11位手机号';
            isValid = false;
        } else {
            phoneError.textContent = '';
        }

        // 验证地址
        const addressError = document.getElementById('address-error');
        if (address === '') {
            addressError.textContent = '地址不能为空';
            isValid = false;
        } else if (address.length < 5) {
            addressError.textContent = '地址不能少于5个字符';
            isValid = false;
        } else {
            addressError.textContent = '';
        }

        // 验证通过：提交订单（模拟）
        if (isValid && cart.length > 0) {
            alert(`订单提交成功！\n收货人：${name}\n电话：${phone}\n地址：${address}\n总价：${document.getElementById('final-price').textContent}\n感谢您的购买！`);
            // 清空购物车
            cart = [];
            saveCart();
            renderCart();
            // 重置表单
            orderForm.reset();
        } else if (cart.length === 0) {
            alert('购物车为空，无法提交订单！');
        }
    });
}
