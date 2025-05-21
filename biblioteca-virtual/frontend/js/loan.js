document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token || !window.location.pathname.includes('dashboard.html')) return;
    
    // Carrega os empréstimos e notificações ao abrir a página
    fetchUserLoans();
    fetchNotifications();
    
    // Configura um temporizador para verificar empréstimos próximos do vencimento
    setInterval(checkDueLoans, 3600000); // Verifica a cada hora
});

/**
 * Busca todos os empréstimos do usuário
 */
async function fetchUserLoans() {
    try {
        showLoader('loans');
        
        const token = localStorage.getItem('token');
        const res = await fetch('/api/loans', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error('Falha ao carregar empréstimos');
        
        const loans = await res.json();
        displayLoans(loans);
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('loans').innerHTML = `
            <div class="error-message">
                <p>Erro ao carregar empréstimos: ${error.message}</p>
                <button onclick="fetchUserLoans()" class="btn">Tentar novamente</button>
            </div>
        `;
    } finally {
        hideLoader('loans');
    }
}

/**
 * Exibe os empréstimos na página
 */
function displayLoans(loans) {
    const loansDiv = document.getElementById('loans');
    loansDiv.innerHTML = '';
    
    if (loans.length === 0) {
        loansDiv.innerHTML = '<p class="no-items">Nenhum empréstimo ativo no momento.</p>';
        return;
    }
    
    loans.forEach(loan => {
        const loanCard = document.createElement('div');
        loanCard.className = `loan-card ${loan.status}`;
        
        const dueDate = new Date(loan.dueDate);
        const isOverdue = loan.status === 'active' && dueDate < new Date();
        
        loanCard.innerHTML = `
            <div class="loan-header">
                <h3>${loan.Book.title}</h3>
                <span class="loan-status ${loan.status}">${loan.status === 'active' ? 
                    (isOverdue ? 'ATRASADO' : 'EM ANDAMENTO') : 'FINALIZADO'}</span>
            </div>
            <div class="loan-details">
                <p><strong>Autor:</strong> ${loan.Book.author}</p>
                <p><strong>Data do empréstimo:</strong> ${new Date(loan.loanDate).toLocaleDateString()}</p>
                <p><strong>Data de devolução:</strong> ${dueDate.toLocaleDateString()}</p>
                ${loan.returnDate ? 
                    `<p><strong>Devolvido em:</strong> ${new Date(loan.returnDate).toLocaleDateString()}</p>` : ''}
                ${loan.fine > 0 ? 
                    `<p class="fine"><strong>Multa:</strong> $${loan.fine.toFixed(2)}</p>` : ''}
            </div>
            ${loan.status === 'active' ? `
                <div class="loan-actions">
                    <button class="btn return-btn" data-loan-id="${loan.id}">
                        Devolver Livro
                    </button>
                    ${isOverdue ? '<span class="overdue-warning">EM ATRASO!</span>' : ''}
                </div>
            ` : ''}
        `;
        
        loansDiv.appendChild(loanCard);
    });
    
    // Adiciona eventos aos botões de devolução
    document.querySelectorAll('.return-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const loanId = e.target.getAttribute('data-loan-id');
            returnBook(loanId);
        });
    });
}

/**
 * Processa a devolução de um livro
 */
async function returnBook(loanId) {
    if (!confirm('Tem certeza que deseja devolver este livro?')) return;
    
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/loans/${loanId}/return`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Erro ao devolver livro');
        }
        
        const result = await res.json();
        
        if (result.fine > 0) {
            alert(`Livro devolvido com sucesso! Multa aplicada: $${result.fine.toFixed(2)}`);
        } else {
            alert('Livro devolvido com sucesso!');
        }
        
        // Atualiza a lista de empréstimos
        fetchUserLoans();
    } catch (error) {
        console.error('Error:', error);
        alert(error.message);
    }
}

/**
 * Verifica empréstimos próximos do vencimento
 */
async function checkDueLoans() {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/loans', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) return;
        
        const loans = await res.json();
        const now = new Date();
        
        loans.forEach(loan => {
            if (loan.status === 'active') {
                const dueDate = new Date(loan.dueDate);
                const timeDiff = dueDate.getTime() - now.getTime();
                const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
                
                // Notifica se faltar 1 dia ou menos
                if (daysDiff <= 1) {
                    showNotification(`Lembrete: O livro "${loan.Book.title}" deve ser devolvido até ${dueDate.toLocaleDateString()}`);
                }
            }
        });
    } catch (error) {
        console.error('Erro ao verificar empréstimos:', error);
    }
}

/**
 * Busca as notificações do usuário
 */
async function fetchNotifications() {
    try {
        showLoader('notifications');
        
        const token = localStorage.getItem('token');
        const res = await fetch('/api/notifications', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error('Falha ao carregar notificações');
        
        const notifications = await res.json();
        displayNotifications(notifications);
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('notifications').innerHTML = `
            <div class="error-message">
                <p>Erro ao carregar notificações: ${error.message}</p>
                <button onclick="fetchNotifications()" class="btn">Tentar novamente</button>
            </div>
        `;
    } finally {
        hideLoader('notifications');
    }
}

/**
 * Exibe as notificações na página
 */
function displayNotifications(notifications) {
    const notificationsDiv = document.getElementById('notifications');
    notificationsDiv.innerHTML = '';
    
    if (notifications.length === 0) {
        notificationsDiv.innerHTML = '<p class="no-items">Nenhuma notificação no momento.</p>';
        return;
    }
    
    notifications.forEach(notification => {
        const notifCard = document.createElement('div');
        notifCard.className = `notification-card ${notification.type} ${notification.isRead ? 'read' : 'unread'}`;
        
        notifCard.innerHTML = `
            <div class="notification-content">
                <p>${notification.message}</p>
                <small>${new Date(notification.createdAt).toLocaleString()}</small>
            </div>
            <button class="mark-read-btn" data-notification-id="${notification.id}">
                ${notification.isRead ? '✔️ Lida' : 'Marcar como lida'}
            </button>
        `;
        
        notificationsDiv.appendChild(notifCard);
    });
    
    // Adiciona eventos aos botões de marcar como lida
    document.querySelectorAll('.mark-read-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const notificationId = e.target.getAttribute('data-notification-id');
            markNotificationAsRead(notificationId);
        });
    });
}

/**
 * Marca uma notificação como lida
 */
async function markNotificationAsRead(notificationId) {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/notifications/${notificationId}/read`, {
            method: 'PATCH',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!res.ok) throw new Error('Falha ao marcar notificação como lida');
        
        // Atualiza a lista de notificações
        fetchNotifications();
    } catch (error) {
        console.error('Error:', error);
        alert(error.message);
    }
}

/**
 * Exibe uma notificação temporária na tela
 */
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'floating-notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 5000);
}

/**
 * Mostra um indicador de carregamento
 */
function showLoader(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<div class="loader"></div>';
    }
}

/**
 * Esconde o indicador de carregamento
 */
function hideLoader(elementId) {
    const element = document.getElementById(elementId);
    if (element && element.querySelector('.loader')) {
        // Mantém o conteúdo atual se já tiver sido carregado
        if (element.children.length > 1) return;
    }
}