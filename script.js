const apiKey = '909962d59009000c46f25e4888af0926';
const searchInput = document.getElementById('Input');
const displaySearchList = document.querySelector('.fav-container');

// Event listener pencarian
if (searchInput) {
  searchInput.addEventListener('input', findMovies);
}

// Rating
function getStarRating(vote) {
    if (!vote) return '<span class="rating-text">No rating</span>';
    
    const rating = vote / 2; // Konversi dari skala 10 ke 5
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let stars = '';
    
    // Bintang penuh
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    
    // Bintang setengah
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    // Bintang kosong
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars + `<span class="rating-text">(${vote.toFixed(1)}/10)</span>`;
}

// Cek apakah film sudah jadi favorit
function isFavorite(id) {
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  return favorites.includes(id.toString());
}

// Tambahkan film ke favorit
function addToFavorites(id) {
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  if (!favorites.includes(id.toString())) {
    favorites.push(id.toString());
    localStorage.setItem('favorites', JSON.stringify(favorites));
    alert('Film ditambahkan ke favorit!');
    if (searchInput) findMovies();
    else loadFavorites();
  }
}

// Hapus film dari favorit
function removeFromFavorites(id) {
  let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  console.log('Before:', favorites);
  favorites = favorites.filter(favId => favId.toString() !== id.toString());
  console.log('After:', favorites);
  localStorage.setItem('favorites', JSON.stringify(favorites));
  alert('Film dihapus dari favorit!');
  if (searchInput) findMovies();
  else loadFavorites();
}


// Fungsi pencarian film
async function findMovies() {
  const query = searchInput.value.trim();
  if (!query) {
    displaySearchList.innerHTML = '';
    return;
  }

  const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=id-ID&query=${encodeURIComponent(query)}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      displayMovieList(data.results);
    } else {
      displaySearchList.innerHTML = '<p>Film tidak ditemukan.</p>';
    }
  } catch (error) {
    console.error('Gagal fetch data:', error);
  }
}

// Tampilkan hasil pencarian
function displayMovieList(movies) {
  let output = '';
  movies.forEach(movie => {
    const poster = movie.poster_path
      ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
      : 'https://via.placeholder.com/200x300?text=No+Image';

    const link = `https://www.themoviedb.org/movie/${movie.id}`;
    const favorite = isFavorite(movie.id.toString());
    const rating = movie.vote_average ? `${movie.vote_average}/10` : 'N/A';
    const year = movie.release_date ? movie.release_date.split('-')[0] : 'Unknown';

    output += `
      <div class="fav-item">
        <a href="${link}" target="_blank">
          <div class="fav-poster">
            <img src="${poster}" alt="${movie.title}">
          </div>
        </a>
        <div class="fav-details">
          <p class="fav-movie-name">${movie.title} (${year})</span></p>
          <p class="star-rating">${getStarRating(movie.vote_average)}</p>
        <div class="fav-trash-icon">
        ${
            favorite
            ? `<i class="fa-solid fa-trash" onclick="removeFromFavorites('${movie.id}')"></i>`
            : `<i class="fa-solid fa-bookmark" style="cursor:pointer; color:black" onclick="addToFavorites('${movie.id}')"></i>`
        }
        </div>
        </div>
      </div>
    `;
  });

  displaySearchList.innerHTML = output;
}

// Tampilkan daftar favorit (untuk halaman Watchlist)
async function loadFavorites() {
  const container = document.querySelector('.fav-container');
  container.innerHTML = '';
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

  for (let id of favorites) {
    const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=id-ID`;

    try {
      const res = await fetch(url);
      const movie = await res.json();

      const poster = movie.poster_path
        ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
        : 'https://via.placeholder.com/200x300?text=No+Image';

      const year = movie.release_date ? movie.release_date.split('-')[0] : 'Unknown';
      const rating = movie.vote_average ? `${movie.vote_average}/10` : 'N/A';

      container.innerHTML += `
        <div class="fav-item">
          <a href="https://www.themoviedb.org/movie/${movie.id}" target="_blank">
            <div class="fav-poster">
              <img src="${poster}" alt="${movie.title}">
            </div>
          </a>
          <div class="fav-details">
            <p class="fav-movie-name">${movie.title} <span style="color:gray;">(${year})</span></p>
            <p class="star-rating">${getStarRating(movie.vote_average)}</p>
            <div class="fav-trash-icon">
            <i class="fa-solid fa-trash" onclick="removeFromFavorites('${movie.id}')"></i>
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      console.error('Gagal fetch favorit:', error);
    }
  }
}
