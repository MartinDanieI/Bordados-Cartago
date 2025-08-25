// Asegúrate de que este código se ejecuta después de que el DOM esté completamente cargado.
document.addEventListener('DOMContentLoaded', () => {

    // Simulación de los datos del producto.
    // En una aplicación real, estos datos se cargarían desde un servidor o una base de datos,
    // posiblemente usando el ID del producto de la URL.
    const productData = {
        title: 'Guayabera maga larga / maga corta',
        code: '2009',
        fabric: 'Camisa',
        description: 'Técnica calado plumilla. Una prenda elegante y sofisticada, perfecta para cualquier ocasión.',
        image: 'https://placehold.co/600x800/F7F7F7/000000?text=Guayabera+Principal', // Placeholder image
        hoverImage: 'https://placehold.co/600x400/F7F7F7/000000?text=Guayabera+Detalle', // Placeholder for detail image
        retailPriceCOP: 320000,
        wholesalePriceCOP: 255000,
        retailPriceUSD: 80,
        wholesalePriceUSD: 63,
        sizes: ['S', 'M', 'L', 'XL'],
        colors: [
            { hex: '#F7F7F7', name: 'Blanco Crudo' },
            { hex: '#5C6F3F', name: 'Verde Oliva' },
            { hex: '#F47B20', name: 'Naranja' },
            { hex: '#34C759', name: 'Verde Menta' },
            { hex: '#6DD400', name: 'Verde Brillante' }
        ],
    };

    // Referencias a los elementos del DOM.
    // Usamos una función auxiliar para obtener elementos y manejar nulos de forma segura.
    const getElement = (id) => {
        const element = document.getElementById(id);
        if (!element) {
            console.error(`Error: Elemento con ID '${id}' no encontrado en el DOM.`);
        }
        return element;
    };

    const productTitlePage = getElement('product-title-page');
    const clothingImage = getElement('clothingImage');
    const imageHover = getElement('image-hover');
    const productTitle = getElement('product-title');
    const productCode = getElement('product-code');
    const productFabric = getElement('product-fabric');
    const productDescription = getElement('product-description');
    const priceRetail = getElement('price-retail');
    const priceWholesale = getElement('price-wholesale');
    const sizesList = getElement('sizes-list');
    const colorsList = getElement('colors-list');

    const btnShowCop = getElement('btn-show-cop');
    const btnShowUsd = getElement('btn-show-usd');

    let currentCurrency = 'COP'; // Estado inicial de la moneda

    /**
     * Formatea un número como un valor de moneda.
     * @param {number} price - El precio a formatear.
     * @param {string} curr - El código de moneda (ej. 'COP', 'USD').
     * @returns {string} El precio formateado.
     */
    const formatPrice = (price, curr) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: curr,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    /**
     * Actualiza la visualización de los precios en la página.
     */
    const updatePriceDisplay = () => {
        if (priceRetail && priceWholesale && btnShowCop && btnShowUsd) {
            if (currentCurrency === 'COP') {
                priceRetail.textContent = formatPrice(productData.retailPriceCOP, 'COP');
                priceWholesale.textContent = formatPrice(productData.wholesalePriceCOP, 'COP');
                btnShowCop.classList.add('bg-blue-600', 'text-white', 'shadow-md');
                btnShowCop.classList.remove('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
                btnShowUsd.classList.remove('bg-blue-600', 'text-white', 'shadow-md');
                btnShowUsd.classList.add('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
            } else {
                priceRetail.textContent = formatPrice(productData.retailPriceUSD, 'USD');
                priceWholesale.textContent = formatPrice(productData.wholesalePriceUSD, 'USD');
                btnShowUsd.classList.add('bg-blue-600', 'text-white', 'shadow-md');
                btnShowUsd.classList.remove('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
                btnShowCop.classList.remove('bg-blue-600', 'text-white', 'shadow-md');
                btnShowCop.classList.add('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
            }
        }
    };

    /**
     * Rellena la información del producto en el DOM.
     */
    const populateProductDetails = () => {
        if (productTitlePage) productTitlePage.textContent = `FLOR BORDADOS Y CALADOS - ${productData.title}`;
        if (clothingImage) {
            clothingImage.src = productData.image;
            clothingImage.alt = productData.title;
        }
        if (imageHover) {
            imageHover.src = productData.hoverImage;
            imageHover.alt = `Detalle de ${productData.title}`;
        }
        if (productTitle) productTitle.textContent = productData.title;
        if (productCode) productCode.textContent = productData.code;
        if (productFabric) productFabric.textContent = productData.fabric;
        if (productDescription) productDescription.textContent = productData.description;

        // Limpiar y añadir tallas
        if (sizesList) {
            sizesList.innerHTML = '';
            productData.sizes.forEach(size => {
                const span = document.createElement('span');
                span.className = 'px-4 py-2 bg-gray-200 text-gray-800 rounded-full text-sm font-medium';
                span.textContent = size;
                sizesList.appendChild(span);
            });
        }

        // Limpiar y añadir colores
        if (colorsList) {
            colorsList.innerHTML = '';
            productData.colors.forEach(color => {
                const div = document.createElement('div');
                div.className = 'w-10 h-10 rounded-full border-2 border-gray-300 shadow-sm cursor-pointer hover:scale-110 transition-transform duration-200';
                div.style.backgroundColor = color.hex;
                div.title = color.name;
                colorsList.appendChild(div);
            });
        }

        updatePriceDisplay(); // Inicializar la visualización de precios
    };

    // Event Listeners para los botones de moneda
    if (btnShowCop) {
        btnShowCop.addEventListener('click', () => {
            currentCurrency = 'COP';
            updatePriceDisplay();
        });
    }

    if (btnShowUsd) {
        btnShowUsd.addEventListener('click', () => {
            currentCurrency = 'USD';
            updatePriceDisplay();
        });
    }

    // Llamar a la función para poblar los detalles del producto cuando el DOM esté listo
    populateProductDetails();

    // Lógica para el menú móvil y el selector de idioma (manteniendo la que ya tenías)
    const menuButton = getElement('menu-button');
    const mobileMenu = getElement('mobile-menu');
    const languageMenuButton = getElement('language-menu-button');
    const languageMenu = getElement('language-menu');
    const currentLangMobile = getElement('current-lang-mobile');

    if (menuButton) {
        menuButton.addEventListener('click', () => {
            if (mobileMenu) mobileMenu.classList.toggle('hidden');
        });
    }

    if (languageMenuButton) {
        languageMenuButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Evitar que el clic cierre inmediatamente el menú
            if (languageMenu) languageMenu.classList.toggle('hidden');
        });
    }

    // Cerrar el menú de idioma si se hace clic fuera de él
    document.addEventListener('click', (event) => {
        if (languageMenu && !languageMenu.contains(event.target) && languageMenuButton && !languageMenuButton.contains(event.target)) {
            languageMenu.classList.add('hidden');
        }
    });

    // Función para cambiar el idioma (asumiendo que ya tienes una implementación para esto)
    window.setLanguage = (lang) => {
        console.log(`Cambiando idioma a: ${lang}`);
        if (currentLangMobile) {
            currentLangMobile.textContent = lang.toUpperCase();
        }
        // Aquí iría tu lógica real para cambiar el idioma de los textos data-i18n
        // Por ejemplo, cargar un archivo JSON de traducciones y actualizar el texto de los elementos
        if (languageMenu) languageMenu.classList.add('hidden'); // Cerrar el menú después de seleccionar
    };
});
