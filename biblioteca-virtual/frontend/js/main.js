document.addEventListener('DOMContentLoaded', () => {
    // Verifica autenticação
    const token = localStorage.getItem('token');
    if (token) {
        // Atualiza navegação para usuários logados
        const nav = document.querySelector('header nav');
        if (nav) {
            nav.innerHTML = `
                <a href="views/dashboard.html">Meu Painel</a>
                <a href="views/search.html">Buscar Livros</a>
                <a href="#" id="logout">Sair</a>
            `;
            
            document.getElementById('logout').addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('token');
                window.location.href = '../index.html';
            });
        }
    }
});