document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) return;
  
  // Search books
  const searchForm = document.getElementById('searchForm');
  if (searchForm) {
    searchForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const query = document.getElementById('searchQuery').value;
      
      try {
        const res = await fetch(`/api/books/search?query=${encodeURIComponent(query)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const books = await res.json();
        displaySearchResults(books);
      } catch (error) {
        console.error('Error:', error);
      }
    });
  }
  
  // Display book details
  if (window.location.pathname.includes('book-detail.html')) {
    const bookId = new URLSearchParams(window.location.search).get('id');
    fetchBookDetails(bookId);
    
    const borrowBtn = document.getElementById('borrowBtn');
    if (borrowBtn) {
      borrowBtn.addEventListener('click', () => borrowBook(bookId));
    }
  }
});

function displaySearchResults(books) {
  const resultsDiv = document.getElementById('searchResults');
  resultsDiv.innerHTML = '';
  
  if (books.length === 0) {
    resultsDiv.innerHTML = '<p>Nenhum livro encontrado.</p>';
    return;
  }
  
  books.forEach(book => {
    const bookCard = document.createElement('div');
    bookCard.className = 'book-card';
    bookCard.innerHTML = `
      <h3>${book.title}</h3>
      <p>Autor: ${book.author}</p>
      <p>Gênero: ${book.genre}</p>
      <a href="book-detail.html?id=${book.id}" class="btn">Detalhes</a>
    `;
    resultsDiv.appendChild(bookCard);
  });
}

async function fetchBookDetails(bookId) {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/books/${bookId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const book = await res.json();
    const bookDetail = document.getElementById('bookDetail');
    bookDetail.innerHTML = `
      <h2>${book.title}</h2>
      <p><strong>Autor:</strong> ${book.author}</p>
      <p><strong>ISBN:</strong> ${book.isbn}</p>
      <p><strong>Gênero:</strong> ${book.genre}</p>
      <p><strong>Disponíveis:</strong> ${book.quantity}</p>
      <p><strong>Descrição:</strong> ${book.description || 'N/A'}</p>
    `;
  } catch (error) {
    console.error('Error:', error);
  }
}

async function borrowBook(bookId) {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/loans/${bookId}/borrow`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (res.ok) {
      alert('Livro emprestado com sucesso!');
      window.location.href = 'dashboard.html';
    } else {
      const error = await res.json();
      alert(error.message || 'Erro ao emprestar livro');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}