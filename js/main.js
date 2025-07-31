// js/main.js - El único script que necesitas (con la nueva sección de productos)

document.addEventListener('DOMContentLoaded', async () => {
    
    // ================================================
    // 1. LÓGICA DE TRADUCCIÓN (Tu código original)
    // ================================================
    let translations = {};
    try {
        const response = await fetch('/lang/translations.json');
        translations = await response.json();
    } catch (error) {
        console.error('No se pudieron cargar las traducciones:', error);
    }

    const setLanguage = (language) => {
        localStorage.setItem('language', language);
        document.documentElement.lang = language;
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[language] && translations[language][key]) {
                element.innerHTML = translations[language][key];
            }
        });

        const currentLangMobile = document.getElementById('current-lang-mobile');
        if (currentLangMobile) {
            currentLangMobile.textContent = language.toUpperCase();
        }
        
        const langMenu = document.getElementById('language-menu');
        if (langMenu) {
            langMenu.classList.add('hidden');
        }
    };
    
    window.setLanguage = setLanguage;

    // ================================================
    // 2. LÓGICA DE LOS MENÚS (Tu código original)
    // ================================================
    const menuButton = document.getElementById('menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const langMenuButton = document.getElementById('language-menu-button');
    const langMenu = document.getElementById('language-menu');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            mobileMenu.classList.toggle('hidden');
        });
    }

    if (langMenuButton && langMenu) {
        langMenuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            langMenu.classList.toggle('hidden');
        });
    }

    document.addEventListener('click', (event) => {
        if (mobileMenu && !mobileMenu.classList.contains('hidden') && !menuButton.contains(event.target)) {
            mobileMenu.classList.add('hidden');
        }
        if (langMenu && !langMenu.classList.contains('hidden') && !langMenuButton.contains(event.target)) {
            langMenu.classList.add('hidden');
        }
    });
    
    // ================================================
    // 3. LÓGICA PARA CARGAR PRODUCTOS (ESTO ES LO NUEVO)
    // ================================================
    async function cargarProductos() {
        const repoURL = 'https://api.github.com/repos/MartinDanieI/Bordados-Cartago/contents/_productos';

        try {
            const response = await fetch(repoURL);
            if (!response.ok) {
                if (response.status === 404) {
                    console.warn("La carpeta '_productos' no existe todavía. Publica tu primer producto desde el CMS para crearla.");
                    return; // No es un error crítico, simplemente no hay productos aún.
                }
                throw new Error(`Error al contactar GitHub: ${response.statusText}`);
            }
            const files = await response.json();

            const contenedorHombres = document.getElementById('productos-hombres');
            const contenedorMujeres = document.getElementById('productos-mujeres');

            if (contenedorHombres) contenedorHombres.innerHTML = '';
            if (contenedorMujeres) contenedorMujeres.innerHTML = '';

            for (const file of files) {
                if (file.type !== 'file' || !file.download_url) continue;

                const productResponse = await fetch(file.download_url);
                const productContent = await productResponse.text();

                // --- Extracción de datos mejorada ---
                const data = productContent.split('---')[1].split('\n').reduce((acc, line) => {
                    const parts = line.split(': ');
                    if (parts.length > 1) {
                        acc[parts[0].trim()] = parts.slice(1).join(': ').replace(/"/g, '').trim();
                    }
                    return acc;
                }, {});

                const product = {
                    title: data.title || 'Sin Título',
                    image: data.image || '',
                    image_hover: data.image_hover || data.image, // Usa la imagen principal si no hay de hover
                    price: data.price ? Number(data.price).toLocaleString('es-CO') : '0',
                    category: data.category || 'Hombres',
                    description: data.description || ''
                };

                // --- Creación de la tarjeta HTML ---
                const productCardHTML = `
                    <div class="group relative">
                        <div class="bg-gray-100 w-full aspect-[3/4] overflow-hidden rounded-lg shadow-md">
                            <img src="${product.image}" alt="${product.title}" class="w-full h-full object-contain p-0">
                        </div>
                        <div class="absolute inset-0 bg-gray-200 bg-opacity-95 flex flex-col justify-start items-center p-4 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 invisible group-hover:visible rounded-lg shadow-lg overflow-y-auto">
                            <div class="w-full mb-3 aspect-[16/9] flex justify-center items-center bg-gray-300 rounded-md">
                                <img src="${product.image_hover}" alt="Vista detallada de ${product.title}" class="w-full h-full object-contain p-1">
                            </div>
                            <h4 class="font-bold text-sm uppercase text-gray-800" data-i18n="details">Detalles</h4>
                            <a href="#" class="mt-auto block w-full text-center text-xs font-semibold bg-gray-900 text-white rounded-md py-2 hover:bg-gray-700" data-i18n="more_info">Más Información</a>
                        </div>
                        <div class="mt-3 text-left">
                            <h3 class="text-sm font-semibold uppercase text-gray-900">${product.title}</h3>
                            <p class="text-xs text-gray-600 mt-1 normal-case">${product.description}</p>
                            <p class="text-sm font-bold mt-1 text-black-600">$${product.price} COP</p>
                        </div>
                    </div>
                `;

                // --- Inserción en el contenedor correcto ---
                if (product.category === 'Hombres' && contenedorHombres) {
                    contenedorHombres.innerHTML += productCardHTML;
                } else if (product.category === 'Mujeres' && contenedorMujeres) {
                    contenedorMujeres.innerHTML += productCardHTML;
                }
            }
        } catch (error) {
            console.error("Error cargando los productos:", error);
            const contenedorHombres = document.getElementById('productos-hombres');
            if(contenedorHombres) contenedorHombres.innerHTML = `<p class="col-span-full text-center text-red-500">Error al cargar productos.</p>`;
        }
    }

    // ================================================
    // 4. INICIO
    // ================================================
    const savedLanguage = localStorage.getItem('language') || 'es';
    setLanguage(savedLanguage);
    cargarProductos(); // <-- Se añade la llamada a la nueva función
});
