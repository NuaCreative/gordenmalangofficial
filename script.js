/* =========================================================
   1. KATEGORI UTAMA (FETCH DATA) & FILTER SUB-KATEGORI
========================================================= */

// Fungsi untuk memuat file HTML eksternal
async function loadCategoryContent(category) {
    const container = document.getElementById(category + '-content');

    // Cegah error jika fungsi dipanggil di halaman selain katalog
    if (!container) return;

    // Jika konten sudah pernah dimuat, jangan load ulang
    if (container.innerHTML.trim() !== "") return;

    try {
        const response = await fetch(`${category}.html`);

        if (!response.ok) {
            throw new Error('Gagal memuat file');
        }

        const html = await response.text();
        container.innerHTML = html;

    } catch (error) {
        console.error('Error:', error);

        container.innerHTML =
            '<p style="text-align:center; padding:20px;">' +
            'Gagal memuat produk. Pastikan Anda menjalankan ini lewat Local Server.' +
            '</p>';
    }
}


// Berpindah kategori utama
// Gorden, Vitrase, Blinds, Add Ons
function switchCategory(category, event) {

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    if (event) {
        event.currentTarget.classList.add('active');
    }

    document.querySelectorAll('.category-content').forEach(content => {
        content.classList.remove('active');
    });

    const targetContent =
        document.getElementById(category + '-content');

    if (targetContent) {
        targetContent.classList.add('active');
    }

    loadCategoryContent(category);
}


// Muat semua kategori saat halaman dibuka
document.addEventListener("DOMContentLoaded", () => {

    if (document.getElementById('gorden-content')) {

        loadCategoryContent('gorden');
        loadCategoryContent('vitrase');
        loadCategoryContent('blind');
        loadCategoryContent('rel');

    }

});


// Filter Sub-Kategori Gorden
// Semua, Basic, Favorit, Premium
function filterSubCategory(subCategory, event) {

    if (!event) return;

    const parent =
        event.currentTarget.parentElement;

    const buttons =
        parent.querySelectorAll('.sub-btn');

    buttons.forEach(btn => {
        btn.classList.remove('active');
    });

    event.currentTarget.classList.add('active');

    const cards =
        document.querySelectorAll(
            '#gorden-content .product-card'
        );

    cards.forEach(card => {

        const cardSub =
            card.getAttribute('data-sub');

        if (
            subCategory === 'all' ||
            cardSub === subCategory
        ) {

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

    const inputElement =
        document.getElementById('searchInput');

    if (!inputElement) return;

    const input =
        inputElement.value
            .toLowerCase()
            .trim();

    const cards =
        document.querySelectorAll('.product-card');


    // Jika pencarian kosong
    if (input === "") {

        cards.forEach(card => {
            card.style.display = "";
        });

        document
            .querySelectorAll('.category-content')
            .forEach(content => {
                content.style.display = "";
            });

        return;
    }


    // Sembunyikan semua kategori
    document
        .querySelectorAll('.category-content')
        .forEach(content => {
            content.style.display = "none";
        });


    // Cari produk
    cards.forEach(card => {

        const titleElement =
            card.querySelector('h3');

        const specElement =
            card.querySelector('.spec');

        const title =
            titleElement
                ? titleElement.textContent.toLowerCase()
                : "";

        const spec =
            specElement
                ? specElement.textContent.toLowerCase()
                : "";


        if (
            title.includes(input) ||
            spec.includes(input)
        ) {

            card.style.display = "block";

            const parentCategory =
                card.closest('.category-content');

            if (parentCategory) {
                parentCategory.style.display = "block";
            }

        } else {

            card.style.display = "none";

        }

    });
}


/* =========================================================
   3. PRODUCT DETAIL MODAL
========================================================= */

let currentProductImages = [];
let currentProductIndex = 0;


// Buka detail produk
function openProduct(card) {

    if (!card) return;

    try {

        currentProductImages =
            JSON.parse(
                card.getAttribute("data-images")
            );

    } catch (error) {

        console.error(
            "Data gambar produk tidak valid:",
            error
        );

        currentProductImages = [];

    }


    currentProductIndex = 0;


    const name =
        card.getAttribute("data-name") || "";

    const category =
        card.getAttribute("data-category") || "";

    const description =
        card.getAttribute("data-description") || "";

    const price =
        card.getAttribute("data-price") || "";


    const modalName =
        document.getElementById("modalName");

    const modalCategory =
        document.getElementById("modalCategory");

    const modalDescription =
        document.getElementById("modalDescription");

    const modalPrice =
        document.getElementById("modalPrice");

    const modalWhatsapp =
        document.getElementById("modalWhatsapp");


    if (modalName) {
        modalName.textContent = name;
    }

    if (modalCategory) {
        modalCategory.textContent = category;
    }

    if (modalDescription) {
        modalDescription.textContent = description;
    }

    if (modalPrice) {
        modalPrice.textContent = price;
    }


    // WhatsApp
    if (modalWhatsapp) {

        const whatsappText =
            `Halo, saya tertarik dengan produk ${name} (${category})`;

        modalWhatsapp.href =
            `https://wa.me/6282211332228?text=${encodeURIComponent(
                whatsappText
            )}`;

    }


    createThumbnails();
    showProductImage(0);


    const productModal =
        document.getElementById("productModal");

    if (productModal) {

        productModal.classList.add("active");

        document.body.style.overflow = "hidden";

    }

}


// Tutup modal produk
function closeProduct() {

    const productModal =
        document.getElementById("productModal");

    if (productModal) {
        productModal.classList.remove("active");
    }

    document.body.style.overflow = "";

}


// Menampilkan gambar produk
function showProductImage(index) {

    if (
        !currentProductImages ||
        currentProductImages.length === 0
    ) {
        return;
    }


    if (index < 0) {

        index =
            currentProductImages.length - 1;

    }


    if (
        index >= currentProductImages.length
    ) {

        index = 0;

    }


    currentProductIndex = index;


    const modalMainImage =
        document.getElementById("modalMainImage");

    const imageCounter =
        document.getElementById("imageCounter");


    if (modalMainImage) {

        modalMainImage.src =
            currentProductImages[index];

    }


    if (imageCounter) {

        imageCounter.textContent =
            `${index + 1} / ${currentProductImages.length}`;

    }


    updateThumbnail();

}


// Gambar berikutnya / sebelumnya
function changeProductImage(direction) {

    showProductImage(
        currentProductIndex + direction
    );

}


// Membuat thumbnail
function createThumbnails() {

    const container =
        document.getElementById("productThumbnails");

    if (!container) return;

    container.innerHTML = "";


    currentProductImages.forEach(
        (image, index) => {

            const thumbnail =
                document.createElement("div");

            thumbnail.className =
                "product-thumbnail";


            thumbnail.innerHTML =
                `<img src="${image}" alt="Foto ${index + 1}">`;


            thumbnail.onclick =
                function () {
                    showProductImage(index);
                };


            container.appendChild(thumbnail);

        }
    );

}


// Update thumbnail aktif
function updateThumbnail() {

    const thumbnails =
        document.querySelectorAll(
            ".product-thumbnail"
        );


    thumbnails.forEach(
        (thumbnail, index) => {

            thumbnail.classList.toggle(
                "active",
                index === currentProductIndex
            );

        }
    );

}


/* =========================================================
   4. SIGNATURE COLLECTION SLIDER
   RESPONSIVE DESKTOP + MOBILE
========================================================= */

let slideIndex = 0;
let sliderInterval = null;


function getSliderElements() {

    return {

        track:
            document.getElementById('sliderTrack'),

        container:
            document.querySelector('.slider-container'),

        cards:
            document.querySelectorAll('.slide-card'),

        dots:
            document.querySelectorAll('.dot')

    };

}


/* ---------------------------------------------------------
   UPDATE ACTIVE CARD
--------------------------------------------------------- */

function updateActiveCard() {

    const {
        cards,
        dots
    } = getSliderElements();


    if (!cards.length) return;


    cards.forEach(
        (card, index) => {

            card.classList.toggle(
                'active',
                index === slideIndex
            );

        }
    );


    dots.forEach(
        (dot, index) => {

            dot.classList.toggle(
                'active',
                index === slideIndex
            );

        }
    );

}


/* ---------------------------------------------------------
   POSISI CARD DI TENGAH
--------------------------------------------------------- */

function positionSlider(animate = true) {

    const {
        track,
        container,
        cards
    } = getSliderElements();


    if (
        !track ||
        !container ||
        !cards.length
    ) {
        return;
    }


    const activeCard =
        cards[slideIndex];


    if (!activeCard) return;


    /*
     * Posisi card berdasarkan ukuran
     * sebenarnya dari browser.
     */

    const containerWidth =
        container.clientWidth;

    const cardWidth =
        activeCard.offsetWidth;

    const cardLeft =
        activeCard.offsetLeft;


    /*
     * Titik tengah card
     */

    const cardCenter =
        cardLeft +
        (cardWidth / 2);


    /*
     * Titik tengah container
     */

    const containerCenter =
        containerWidth / 2;


    /*
     * Jarak perpindahan
     */

    const translateX =
        containerCenter -
        cardCenter;


    /*
     * Animasi
     */

    track.style.transition =
        animate
            ? "transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)"
            : "none";


    track.style.transform =
        `translateX(${translateX}px)`;


    updateActiveCard();

}


/* ---------------------------------------------------------
   UPDATE SLIDER
--------------------------------------------------------- */

function updateSlider() {

    positionSlider(true);

}


/* ---------------------------------------------------------
   SLIDE BERIKUTNYA
--------------------------------------------------------- */

function nextSlide() {

    const {
        cards
    } = getSliderElements();


    if (!cards.length) return;


    slideIndex++;


    /*
     * Kembali ke awal setelah
     * mencapai slide terakhir.
     */

    if (
        slideIndex >= cards.length
    ) {

        slideIndex = 0;

    }


    updateSlider();

}


/* ---------------------------------------------------------
   DOT SLIDER
--------------------------------------------------------- */

function currentSlide(index) {

    const {
        cards
    } = getSliderElements();


    if (!cards.length) return;


    if (
        index < 0 ||
        index >= cards.length
    ) {
        return;
    }


    slideIndex = index;


    updateSlider();


    /*
     * Reset autoplay
     */

    restartSlider();

}


/* ---------------------------------------------------------
   START AUTOPLAY
--------------------------------------------------------- */

function startSlider() {

    const {
        cards
    } = getSliderElements();


    if (
        !cards.length ||
        cards.length <= 1
    ) {
        return;
    }


    stopSlider();


    sliderInterval =
        setInterval(
            nextSlide,
            3500
        );

}


/* ---------------------------------------------------------
   STOP AUTOPLAY
--------------------------------------------------------- */

function stopSlider() {

    if (sliderInterval) {

        clearInterval(
            sliderInterval
        );

        sliderInterval = null;

    }

}


/* ---------------------------------------------------------
   RESTART AUTOPLAY
--------------------------------------------------------- */

function restartSlider() {

    stopSlider();

    startSlider();

}


/* ---------------------------------------------------------
   SWIPE MOBILE
--------------------------------------------------------- */

let touchStartX = 0;
let touchEndX = 0;


function handleSwipe() {

    const swipeDistance =
        touchEndX -
        touchStartX;


    /*
     * Geser kiri
     */

    if (
        swipeDistance < -50
    ) {

        nextSlide();

        restartSlider();

    }


    /*
     * Geser kanan
     */

    else if (
        swipeDistance > 50
    ) {

        const {
            cards
        } = getSliderElements();


        if (!cards.length) return;


        slideIndex--;


        if (
            slideIndex < 0
        ) {

            slideIndex =
                cards.length - 1;

        }


        updateSlider();

        restartSlider();

    }

}


/* ---------------------------------------------------------
   INITIALIZE SLIDER
--------------------------------------------------------- */

function initializeSlider() {

    const {
        track,
        container,
        cards
    } = getSliderElements();


    if (
        !track ||
        !container ||
        !cards.length
    ) {
        return;
    }


    slideIndex = 0;


    /*
     * Tunggu browser selesai
     * menghitung ukuran card.
     */

    requestAnimationFrame(
        () => {

            positionSlider(false);

            startSlider();

        }
    );

}


/* ---------------------------------------------------------
   WINDOW RESIZE
--------------------------------------------------------- */

window.addEventListener(
    'resize',
    function () {

        positionSlider(false);

    }
);


/* ---------------------------------------------------------
   DOM READY
--------------------------------------------------------- */

document.addEventListener(
    'DOMContentLoaded',
    function () {

        initializeSlider();


        const {
            container
        } = getSliderElements();


        if (!container) return;


        /*
         * TOUCH START
         */

        container.addEventListener(
            'touchstart',
            function (event) {

                touchStartX =
                    event.changedTouches[0]
                        .screenX;

            },
            {
                passive: true
            }
        );


        /*
         * TOUCH END
         */

        container.addEventListener(
            'touchend',
            function (event) {

                touchEndX =
                    event.changedTouches[0]
                        .screenX;

                handleSwipe();

            },
            {
                passive: true
            }
        );


        /*
         * PAUSE AUTOPLAY SAAT MOUSE
         * BERADA DI AREA SLIDER
         */

        container.addEventListener(
            'mouseenter',
            function () {

                stopSlider();

            }
        );


        container.addEventListener(
            'mouseleave',
            function () {

                startSlider();

            }
        );

    }
);


/* =========================================================
   5. REELS SLIDER / PROJECT KAMI
========================================================= */

let currentReelIndex = 0;


function slideReels(direction) {

    const reelsTrack =
        document.getElementById(
            'reelsTrack'
        );

    const cards =
        document.querySelectorAll(
            '.clean-card'
        );


    if (
        !reelsTrack ||
        cards.length === 0
    ) {
        return;
    }


    const cardWidth =
        cards[0].offsetWidth + 24;


    const maxIndex =
        cards.length - 1;


    currentReelIndex += direction;


    if (
        currentReelIndex < 0
    ) {

        currentReelIndex = 0;

    }


    if (
        currentReelIndex > maxIndex
    ) {

        currentReelIndex =
            maxIndex;

    }


    const moveAmount =
        -currentReelIndex *
        cardWidth;


    reelsTrack.style.transform =
        `translateX(${moveAmount}px)`;

}


/* =========================================================
   6. PRODUCT CARD EVENT
========================================================= */

document.addEventListener(
    "click",
    function (event) {

        /*
         * Tombol detail tidak boleh
         * memicu klik parent product-card.
         */

        if (
            event.target.closest(
                ".product-card .btn-detail"
            )
        ) {

            event.stopPropagation();

        }

    }
);


/* =========================================================
   7. LIGHTBOX ZOOM
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const modalMainImage =
            document.getElementById(
                "modalMainImage"
            );

        const lightboxModal =
            document.getElementById(
                "lightboxModal"
            );

        const lightboxImg =
            document.getElementById(
                "lightboxImg"
            );


        if (
            !modalMainImage ||
            !lightboxModal ||
            !lightboxImg
        ) {
            return;
        }


        /*
         * Cursor zoom
         */

        modalMainImage.style.cursor =
            "zoom-in";


        /*
         * Buka lightbox
         */

        modalMainImage.addEventListener(
            "click",
            function () {

                lightboxImg.src =
                    this.src;


                lightboxImg.classList.remove(
                    "zoomed"
                );


                lightboxImg.style.transform =
                    "scale(1)";


                lightboxModal.classList.add(
                    "active"
                );

            }
        );


        /*
         * Zoom klik
         */

        lightboxImg.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                this.classList.toggle(
                    "zoomed"
                );

            }
        );


        /*
         * Zoom menggunakan mouse wheel
         */

        let currentScale = 1;


        lightboxModal.addEventListener(
            "wheel",
            function (event) {

                event.preventDefault();


                if (
                    event.deltaY < 0
                ) {

                    currentScale =
                        Math.min(
                            currentScale + 0.25,
                            3
                        );

                } else {

                    currentScale =
                        Math.max(
                            currentScale - 0.25,
                            1
                        );

                }


                lightboxImg.style.transform =
                    `scale(${currentScale})`;

            },
            {
                passive: false
            }
        );

    }
);


/* =========================================================
   8. CLOSE LIGHTBOX
========================================================= */

function closeLightbox() {

    const lightboxModal =
        document.getElementById(
            "lightboxModal"
        );

    const lightboxImg =
        document.getElementById(
            "lightboxImg"
        );


    if (lightboxModal) {

        lightboxModal.classList.remove(
            "active"
        );

    }


    if (lightboxImg) {

        lightboxImg.style.transform =
            "scale(1)";

    }

}


/* =========================================================
   9. KEYBOARD NAVIGATION MODAL
========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        const productModal =
            document.getElementById(
                "productModal"
            );


        /*
         * Jika modal produk sedang terbuka
         */

        if (
            productModal &&
            productModal.classList.contains(
                "active"
            )
        ) {

            if (
                event.key === "ArrowRight"
            ) {

                changeProductImage(1);

            }


            if (
                event.key === "ArrowLeft"
            ) {

                changeProductImage(-1);

            }


            if (
                event.key === "Escape"
            ) {

                closeProduct();

            }

        }


        /*
         * ESC untuk Instagram modal
         */

        if (
            event.key === "Escape"
        ) {

            closeIgModal();

            closeLightbox();

        }

    }
);


/* =========================================================
   10. INSTAGRAM REELS MODAL
========================================================= */

function openIgModal(igUrl) {

    const modal =
        document.getElementById(
            'igModal'
        );

    const iframe =
        document.getElementById(
            'modalIgIframe'
        );


    if (
        !modal ||
        !iframe ||
        !igUrl
    ) {
        return;
    }


    let embedUrl = igUrl;


    if (
        !embedUrl.endsWith('/')
    ) {

        embedUrl += '/';

    }


    embedUrl += 'embed';


    iframe.src =
        embedUrl;


    modal.classList.add(
        'active'
    );


    document.body.style.overflow =
        'hidden';

}


/* ---------------------------------------------------------
   CLOSE INSTAGRAM MODAL
--------------------------------------------------------- */

function closeIgModal() {

    const modal =
        document.getElementById(
            'igModal'
        );

    const iframe =
        document.getElementById(
            'modalIgIframe'
        );


    if (
        modal &&
        iframe
    ) {

        modal.classList.remove(
            'active'
        );


        iframe.src = '';


        document.body.style.overflow =
            '';

    }

}