const token = localStorage.getItem('token');

if (!token) {
    window.location.href = '/login';
}

async function loadProfile() {
    try {
        const res = await fetch('/profile/api/user', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
            const user = await res.json();
            document.getElementById('displayName').textContent = user.name;
            document.getElementById('displayEmail').textContent = user.email;
            document.getElementById('displayRole').textContent = user.role_id === 1 ? 'Пользователь' : 'Администратор';
            
            if (user.avatar_url) {
                // Добавляем уникальный параметр для обновления кэша
                const avatarUrl = user.avatar_url + '?t=' + new Date().getTime();
                document.getElementById('profileAvatar').src = avatarUrl;
            }
        } else if (res.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

// Загрузка аватара
document.getElementById('avatarUpload')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('avatar', file);
    
    const statusDiv = document.getElementById('uploadStatus');
    statusDiv.textContent = 'Загрузка...';
    statusDiv.style.color = 'white';
    
    try {
        const res = await fetch('/api/upload/avatar', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        
        const data = await res.json();
        
        if (res.ok) {
            statusDiv.textContent = '✅ Аватар обновлен!';
            statusDiv.style.color = '#90ff90';
            // Обновляем аватар с новым timestamp
            const newAvatarUrl = data.avatarUrl + '?t=' + new Date().getTime();
            document.getElementById('profileAvatar').src = newAvatarUrl;
            
            // Обновляем аватар в localStorage для синхронизации
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            userData.avatar_url = data.avatarUrl;
            localStorage.setItem('userData', JSON.stringify(userData));
            
            // Обновляем аватар на главной странице (если открыта)
            if (window.opener) {
                window.opener.postMessage('avatarUpdated', '*');
            }
        } else {
            statusDiv.textContent = '❌ ' + (data.error || 'Ошибка');
            statusDiv.style.color = '#ff9090';
        }
    } catch (error) {
        statusDiv.textContent = '❌ Ошибка загрузки';
        statusDiv.style.color = '#ff9090';
    }
    
    setTimeout(() => {
        statusDiv.textContent = '';
    }, 3000);
});

loadProfile();