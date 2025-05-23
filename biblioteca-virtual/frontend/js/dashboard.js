document.addEventListener('DOMContentLoaded', () => {
    // Verifica autenticação
    checkAuthentication();
    
    // Carrega os empréstimos do usuário
    loadUserLoans();
    
    // Configura o logout
    document.getElementById('logout').addEventListener('click', logout);
});

function checkAuthentication() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
    }
}

async function loadUserLoans() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/loans', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Failed to fetch loans');
        
        const loans = await response.json();
        displayLoans(loans);
    } catch (error) {
        console.error('Error loading loans:', error);
        document.getElementById('loans-container').innerHTML = `
            <p class="error">Erro ao carregar empréstimos: ${error.message}</p>
        `;
    }
}

function displayLoans(loans) {
    const container = document.getElementById('loans-container');
    
    if (loans.length === 0) {
        container.innerHTML = '<p>Você não tem empréstimos ativos.</p>';
        return;
    }
    
    let html = '<div class="loans-grid">';
    loans.slice(0, 3).forEach(loan => {
        html += `
            <div class="loan-card">
                <h4>${loan.Book.title}</h4>
                <p>Autor: ${loan.Book.author}</p>
                <p>Data de devolução: ${new Date(loan.dueDate).toLocaleDateString()}</p>
                <p>Status: ${loan.status}</p>
            </div>
        `;
    });
    html += '</div>';
    
    if (loans.length > 3) {
        html += `<a href="loans.html" class="btn">Ver todos</a>`;
    }
    
    container.innerHTML = html;
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = '../index.html';
}