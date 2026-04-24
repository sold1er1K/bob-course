// Проверяем авторизацию
const token = localStorage.getItem('token');
const createAdBtn = document.getElementById('createAdBtn');

// Элементы для авторизованных и гостей
const userMenu = document.getElementById('userMenu');
const guestMenu = document.getElementById('guestMenu');

async function loadUserData() {
    if (!token) {
        if (userMenu) userMenu.style.display = 'none';
        if (guestMenu) guestMenu.style.display = 'flex';
        if (createAdBtn) createAdBtn.style.display = 'none';
        return;
    }
    
    try {
        const res = await fetch('/profile/api/user', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
            const user = await res.json();
            document.getElementById('userName').textContent = user.name;
            if (user.avatar_url) {
                document.getElementById('userAvatar').src = user.avatar_url + '?t=' + new Date().getTime();
            }
            if (userMenu) userMenu.style.display = 'flex';
            if (guestMenu) guestMenu.style.display = 'none';
            if (createAdBtn) createAdBtn.style.display = 'inline-block';
            
            // Показываем кнопку админ-панели только для админов (role_id = 2)
            const adminLink = document.getElementById('adminPanelLink');
            if (adminLink && user.role_id === 2) {
                adminLink.style.display = 'block';
                adminLink.href = '/admin';
            }
        } else {
            localStorage.removeItem('token');
            if (userMenu) userMenu.style.display = 'none';
            if (guestMenu) guestMenu.style.display = 'flex';
            if (createAdBtn) createAdBtn.style.display = 'none';
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

async function loadCars(filters = {}) {
    const container = document.getElementById('carsList');
    container.innerHTML = '<div class="loading">Загрузка объявлений...</div>';
    
    try {
        // Строим URL с параметрами фильтрации
        let url = '/api/cars';
        const params = new URLSearchParams();
        if (filters.brand) params.append('brand', filters.brand);
        if (filters.model) params.append('model', filters.model);
        if (filters.priceFrom) params.append('priceFrom', filters.priceFrom);
        if (filters.priceTo) params.append('priceTo', filters.priceTo);
        
        if (params.toString()) {
            url += '?' + params.toString();
        }
        
        const res = await fetch(url);
        
        if (!res.ok) {
            throw new Error('Ошибка загрузки');
        }
        
        const cars = await res.json();
        
        if (!cars.length) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 0px 20px;">
                    <div style="font-size: 64px; margin-bottom: 20px;">🚗</div>
                    <div style="font-size: 24px; font-weight: 600; color: #333; margin-bottom: 10px;">Нет объявлений</div>
                    <div style="font-size: 16px; color: #666;">Будьте первым, кто подаст объявление!</div>
                    ${token ? '<div style="margin-top: 20px;"><a href="/create-ad" style="display: inline-block; background: #e63946; color: white; padding: 12px 30px; border-radius: 25px; text-decoration: none;">➕ Подать объявление</a></div>' : ''}
                </div>
            `;
            return;
        }
        
        container.innerHTML = cars.map(car => `
            <div class="car-card" onclick="viewCar(${car.id})">
                <img class="car-image" src="${car.main_photo || '/images/default-car.jpg'}" alt="${car.brand} ${car.model}" onerror="this.src='/images/default-car.jpg'">
                <div class="car-info">
                    <div class="car-title">${car.brand} ${car.model}</div>
                    <div class="car-price">${Number(car.price).toLocaleString()} BYN</div>
                    <div class="car-details">${car.year} год • ${Number(car.mileage).toLocaleString()} км</div>
                    <div class="car-details">👤 ${car.owner_name || 'Продавец'}</div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Ошибка загрузки объявлений:', error);
        container.innerHTML = '<div class="error-message">❌ Ошибка загрузки объявлений. Попробуйте позже.</div>';
    }
}

function searchCars() {
    const filters = {
        brand: document.getElementById('brandFilter')?.value,
        model: document.getElementById('modelFilter')?.value,
        priceFrom: document.getElementById('priceFrom')?.value,
        priceTo: document.getElementById('priceTo')?.value
    };
    
    // Удаляем пустые фильтры
    Object.keys(filters).forEach(key => {
        if (!filters[key]) delete filters[key];
    });
    
    loadCars(filters);
}

function viewCar(id) {
    window.location.href = `/car/${id}`;
}

function toggleDropdown() {
    const menu = document.getElementById('dropdownMenu');
    if (menu) {
        menu.classList.toggle('show');
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    window.location.href = '/';
}

// Закрыть dropdown при клике вне
document.addEventListener('click', (e) => {
    const menu = document.getElementById('dropdownMenu');
    const userMenuEl = document.getElementById('userMenu');
    if (menu && userMenuEl && !userMenuEl.contains(e.target)) {
        menu.classList.remove('show');
    }
});

// Добавляем обработчик Enter на поля фильтров
document.addEventListener('DOMContentLoaded', () => {
    const filterInputs = ['brandFilter', 'modelFilter', 'priceFrom', 'priceTo'];
    filterInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    searchCars();
                }
            });
        }
    });
});


// Дублирующая обработка для кнопок входа/регистрации
document.addEventListener('DOMContentLoaded', () => {
    // Проверяем, что кнопки существуют и добавляем явные обработчики
    const loginBtn = document.querySelector('.login-btn');
    const registerBtn = document.querySelector('.register-btn');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '/login';
        });
    }
    
    if (registerBtn) {
        registerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '/login';
        });
    }
});

// Загружаем данные
loadUserData();
loadCars();

