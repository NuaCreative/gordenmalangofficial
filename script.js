/* =========================================================
   1. KATEGORI UTAMA (FETCH DATA) & FILTER SUB-KATEGORI 
========================================================= */

// Fungsi untuk memuat file HTML eksternal
async function loadCategoryContent(category) {
    const container = document.getElementById(category + '-content');
    
    // Cegah error jika fungsi dipanggil di halaman selain katalog
    if (!container) return; 

    // Jika konten sudah pernah dimuat, jangan load ulang (agar lebih cepat)
    if (container.innerHTML.trim() !== "") return;

    try {
        const response = await fetch(`${category}.html`);
        if (!response.ok) throw new Error('Gagal memuat file');
        
        const html = await response.text();
        container.innerHTML = html;
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = '<p style="text-align:center; padding: 20px;">Gagal memuat produk. Pastikan Anda menjalankan ini lewat Local Server.</p>';
    }
}

// Berpindah kategori utama (Gorden, Vitrase, Blinds, Add Ons)
function switchCategory(category, event) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if (event) event.currentTarget.classList.add('active');

    document.querySelectorAll('.category-content').forEach(content => content.classList.remove('active'));
    
    const targetContent = document.getElementById(category + '-content');
    if (targetContent) {
        targetContent.classList.add('active');
    }

    // Panggil fungsi load untuk menarik file HTML-nya
    loadCategoryContent(category);
}

// Muat SEMUA tab secara otomatis di latar belakang saat halaman dibuka
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById('gorden-content')) {
        loadCategoryContent('gorden');
        loadCategoryContent('vitrase');
        loadCategoryContent('blind');
        loadCategoryContent('rel');
    }
});

// Filter Sub-Kategori Gorden (Semua, Basic, Favorit, Premium)
function filterSubCategory(subCategory, event) {
    const buttons = event.currentTarget.parentElement.querySelectorAll('.sub-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');

    const cards = document.querySelectorAll('#gorden-content .product-card');

    cards.forEach(card => {
        const cardSub = card.getAttribute('data-sub');

        if (subCategory === 'all' || cardSub === subCategory) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
}

/* =========================================================
   2. PENCARIAN / FILTER PRODUK REAL-TIME
========================================================= */

function filterProducts() {
    let input = document.getElementById('searchInput').value.toLowerCase().trim();
    let cards = document.querySelectorAll('.product-card');

    // Jika kolom pencarian dikosongkan, kembalikan tampilan normal (sesuai tab aktif)
    if (input === "") {
        cards.forEach(card => card.style.display = ""); 
        document.querySelectorAll('.category-content').forEach(content => {
            content.style.display = ""; // Hapus style paksaan pencarian
        });
        return;
    }

    // Sembunyikan semua wadah kategori untuk sementara waktu saat mencari
    document.querySelectorAll('.category-content').forEach(content => {
        content.style.display = "none"; 
    });

    // Mulai mencari produk
    cards.forEach(card => {
        let titleElement = card.querySelector('h3');
        let specElement = card.querySelector('.spec');
        
        let title = titleElement ? titleElement.textContent.toLowerCase() : "";
        let spec = specElement ? specElement.textContent.toLowerCase() : "";
        
        if (title.includes(input) || spec.includes(input)) {
            card.style.display = "block"; // Munculkan produk yang cocok
            
            // Munculkan wadah kategori dari produk yang cocok tersebut
            let parentCategoryContent = card.closest('.category-content');
            if (parentCategoryContent) {
                parentCategoryContent.style.display = "block"; 
            }
        } else {
            card.style.display = "none"; // Sembunyikan yang tidak cocok
        }
    });
}

/* =========================================================
   3. PRODUCT DETAIL MODAL
========================================================= */

let currentProductImages = [];
let currentProductIndex = 0;

function openProduct(card) {
    currentProductImages = JSON.parse(card.getAttribute("data-images"));
    currentProductIndex = 0;

    const name = card.getAttribute("data-name");
    const category = card.getAttribute("data-category");
    const description = card.getAttribute("data-description");
    const price = card.getAttribute("data-price");

    const modalName = document.getElementById("modalName");
    const modalCategory = document.getElementById("modalCategory");
    const modalDescription = document.getElementById("modalDescription");
    const modalPrice = document.getElementById("modalPrice");
    const modalWhatsapp = document.getElementById("modalWhatsapp");

    if (modalName) modalName.textContent = name;
    if (modalCategory) modalCategory.textContent = category;
    if (modalDescription) modalDescription.textContent = description;
    if (modalPrice) modalPrice.textContent = price;

    if (modalWhatsapp) {
        const whatsappText = `Halo, saya tertarik dengan produk ${name} (${category})`;
        modalWhatsapp.href = `https://wa.me/6282211332228?text=${encodeURIComponent(whatsappText)}`;
    }

    createThumbnails();
    showProductImage(0);

    const productModal = document.getElementById("productModal");
    if (productModal) {
        productModal.classList.add("active");
        document.body.style.overflow = "hidden";
    }
}

function closeProduct() {
    const productModal = document.getElementById("productModal");
    if (productModal) {
        productModal.classList.remove("active");
    }
    document.body.style.overflow = "";
}

function showProductImage(index) {
    if (currentProductImages.length === 0) return;

    if (index < 0) {
        index = currentProductImages.length - 1;
    }
    if (index >= currentProductImages.length) {
        index = 0;
    }

    currentProductIndex = index;
    const modalMainImage = document.getElementById("modalMainImage");
    const imageCounter = document.getElementById("imageCounter");

    if (modalMainImage) modalMainImage.src = currentProductImages[index];
    if (imageCounter) imageCounter.textContent = `${index + 1} / ${currentProductImages.length}`;

    updateThumbnail();
}

function changeProductImage(direction) {
    showProductImage(currentProductIndex + direction);
}

function createThumbnails() {
    const container = document.getElementById("productThumbnails");
    if (!container) return;

    container.innerHTML = "";

    currentProductImages.forEach((image, index) => {
        const thumbnail = document.createElement("div");
        thumbnail.className = "product-thumbnail";
        thumbnail.innerHTML = `<img src="${image}" alt="Foto ${index + 1}">`;

        thumbnail.onclick = function () {
            showProductImage(index);
        };

        container.appendChild(thumbnail);
    });
}

function updateThumbnail() {
    const thumbnails = document.querySelectorAll(".product-thumbnail");
    thumbnails.forEach((thumbnail, index) => {
        thumbnail.classList.toggle("active", index === currentProductIndex);
    });
}

/* =========================================================
   4. AUTO SLIDER HOME (Infinite Loop 3 Cards)
========================================================= */

let slideIndex = 0;
const track = document.getElementById('sliderTrack');
const originalCards = document.querySelectorAll('.slide-card');
const dots = document.querySelectorAll('.dot');

if (track && originalCards.length > 0) {
    const firstCardClone = originalCards[0].cloneNode(true);
    const secondCardClone = originalCards[1] ? originalCards[1].cloneNode(true) : null;
    
    track.appendChild(firstCardClone);
    if (secondCardClone) track.appendChild(secondCardClone);
}

const allCards = document.querySelectorAll('.slide-card');

function updateSlider() {
    if (!track || allCards.length === 0) return;
    
    const offset = -slideIndex * (100 / 3);
    track.style.transition = "transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)";
    track.style.transform = `translateX(${offset}%)`;
    
    const activeIndex = slideIndex % originalCards.length;
    
    allCards.forEach((card, i) => {
        card.classList.toggle('active', i === slideIndex + 1);
    });
    
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === activeIndex);
    });
}

function nextSlide() {
    if (!track || originalCards.length === 0) return;
    
    slideIndex++;
    updateSlider();

    if (slideIndex >= originalCards.length) {
        setTimeout(() => {
            track.style.transition = "none";
            slideIndex = 0;
            const offset = -slideIndex * (100 / 3);
            track.style.transform = `translateX(${offset}%)`;
            
            allCards.forEach((card, i) => {
                card.classList.toggle('active', i === 1);
            });
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === 0);
            });
        }, 600);
    }
}

function currentSlide(n) {
    slideIndex = n;
    updateSlider();
}

if (track && originalCards.length > 0) {
    setInterval(nextSlide, 3500);
}

/* =========================================================
   5. REELS SLIDER / PROJECT KAMI
========================================================= */

let currentReelIndex = 0;

function slideReels(direction) {
    const reelsTrack = document.getElementById('reelsTrack');
    const cards = document.querySelectorAll('.clean-card');
    
    if (!reelsTrack || cards.length === 0) return;

    const cardWidth = cards[0].offsetWidth + 24; 
    const maxIndex = cards.length - 1;

    currentReelIndex += direction;

    if (currentReelIndex < 0) {
        currentReelIndex = 0;
    } else if (currentReelIndex > maxIndex) {
        currentReelIndex = maxIndex;
    }

    const moveAmount = -currentReelIndex * cardWidth;
    reelsTrack.style.transform = `translateX(${moveAmount}px)`;
}

/* =========================================================
   6. FITUR LIGHTBOX ZOOM & EVENT LISTENERS
========================================================= */

// A. Menghentikan klik tombol WhatsApp di kartu (Event Delegation)
document.addEventListener("click", function (event) {
    // Memastikan klik pada tombol .btn-detail tidak memicu modal parent
    if (event.target.closest(".product-card .btn-detail")) {
        event.stopPropagation();
    }
});

document.addEventListener("DOMContentLoaded", function () {
    // B. Setup Lightbox Zoom
    const modalMainImage = document.getElementById("modalMainImage");
    const lightboxModal = document.getElementById("lightboxModal");
    const lightboxImg = document.getElementById("lightboxImg");

    if (modalMainImage && lightboxModal && lightboxImg) {
        modalMainImage.style.cursor = "zoom-in";

        modalMainImage.addEventListener("click", function () {
            lightboxImg.src = this.src;
            lightboxImg.classList.remove("zoomed");
            lightboxImg.style.transform = "scale(1)";
            lightboxModal.classList.add("active");
        });

        lightboxImg.addEventListener("click", function (e) {
            e.stopPropagation();
            this.classList.toggle("zoomed");
        });

        let currentScale = 1;
        lightboxModal.addEventListener("wheel", function (e) {
            e.preventDefault();
            if (e.deltaY < 0) {
                currentScale = Math.min(currentScale + 0.25, 3);
            } else {
                currentScale = Math.max(currentScale - 0.25, 1);
            }
            lightboxImg.style.transform = `scale(${currentScale})`;
        });
    }
});

// Fungsi Tutup Lightbox Fullscreen
function closeLightbox() {
    const lightboxModal = document.getElementById("lightboxModal");
    const lightboxImg = document.getElementById("lightboxImg");
    
    if (lightboxModal) {
        lightboxModal.classList.remove("active");
    }
    if (lightboxImg) {
        lightboxImg.style.transform = "scale(1)";
    }
}

// Navigasi Keyboard Modal (Kiri, Kanan, ESC)
document.addEventListener("keydown", function (event) {
    const modal = document.getElementById("productModal");
    if (!modal || !modal.classList.contains("active")) return;

    if (event.key === "ArrowRight") changeProductImage(1);
    if (event.key === "ArrowLeft") changeProductImage(-1);
    if (event.key === "Escape") closeProduct();
});

/* =========================================================
   7. MODAL FULLSCREEN INSTAGRAM REELS
========================================================= */

function openIgModal(igUrl) {
    const modal = document.getElementById('igModal');
    const iframe = document.getElementById('modalIgIframe');

    if (modal && iframe && igUrl) {
        let embedUrl = igUrl;
        if (!embedUrl.endsWith('/')) embedUrl += '/';
        embedUrl += 'embed';

        iframe.src = embedUrl;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; 
    }
}

function closeIgModal() {
    const modal = document.getElementById('igModal');
    const iframe = document.getElementById('modalIgIframe');

    if (modal && iframe) {
        modal.classList.remove('active');
        iframe.src = ''; 
        document.body.style.overflow = ''; 
    }
}

document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        closeIgModal();
    }
});