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
    // 3. LÓGICA PARA CARGAR PRODUCTOS (ESTA ES LA PARTE ACTUALIZADA)
    // ================================================
    async function cargarProductos() {
        const repoURL = 'https://api.github.com/repos/MartinDanieI/Bordados-Cartago/contents/_productos';

        try {
            const response = await fetch(repoURL);
            if (!response.ok) {
                if (response.status === 404) {
                    console.warn("La carpeta '_productos' no existe todavía. Publica tu primer producto desde el CMS para crearla.");
                    return;
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

                // --- Función mejorada para extraer todos los datos, incluyendo listas ---
                function parseFrontMatter(content) {
                    const data = {};
                    const frontMatterMatch = content.match(/---([\s\S]*?)---/);
                    if (!frontMatterMatch) return data;
                    const frontMatter = frontMatterMatch[1];
                    
                    const simpleFields = ['title', 'image', 'image_hover', 'price', 'category', 'type', 'description', 'code'];
                    simpleFields.forEach(field => {
                        const regex = new RegExp(`^${field}:\\s*(.*)$`, 'm');
                        const match = frontMatter.match(regex);
                        if (match) data[field] = match[1].replace(/"/g, '').trim();
                    });

                    data.sizes = Array.from(frontMatter.matchAll(/-\s*size:\s*(.*)/g), m => m[1].trim().replace(/"/g, ''));
                    data.colors = Array.from(frontMatter.matchAll(/-\s*name:\s*(.*)\n\s*hex:\s*(.*)/g), m => ({
                        name: m[1].replace(/"/g, '').trim(),
                        hex: m[2].trim()
                    }));
                    
                    data.code = data.code || 'N/A';
                    return data;
                }

                const productData = parseFrontMatter(productContent);
                
                // --- Generar HTML para las Tallas (si existen) ---
                let sizesHTML = '';
                if (productData.sizes && productData.sizes.length > 0) {
                    sizesHTML = `
                        <p class="w-full text-xs text-gray-700 font-bold mt-2" data-i18n="sizes">Tallas:</p>
                        <div class="flex flex-wrap justify-center gap-1 mt-1">
                            ${productData.sizes.map(size => `<div class="border border-gray-400 rounded text-xs px-2 py-0.5">${size}</div>`).join('')}
                        </div>`;
                }

                // --- Generar HTML para los Colores (si existen) ---
                let colorsHTML = '';
                if (productData.colors && productData.colors.length > 0) {
                    colorsHTML = `
                        <p class="w-full text-xs text-gray-700 font-bold mt-2" data-i18n="colors">Colores:</p>
                        <div class="flex flex-wrap justify-center gap-2 mt-1">
                            ${productData.colors.map(color => `<div title="${color.name}"><span style="background-color: ${color.hex};" class="block w-5 h-5 rounded-full border border-gray-400"></span></div>`).join('')}
                        </div>`;
                }

                // --- Creación de la tarjeta HTML COMPLETA ---
                const productCardHTML = `
                    <div class="group relative">
                        <a href="./productos.html?product=${file.name.replace('.md', '')}">
                            <div class="bg-gray-100 w-full aspect-[3/4] overflow-hidden rounded-lg shadow-md">
                                <img src="${productData.image || ''}" alt="${productData.title || ''}" class="w-full h-full object-contain p-0">
                            </div>
                        </a>
                        <div class="absolute inset-0 bg-gray-200 bg-opacity-95 flex flex-col items-center p-3 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 invisible group-hover:visible rounded-lg shadow-lg overflow-y-auto">
                            <div class="w-full mb-2 aspect-video flex justify-center items-center bg-gray-300 rounded-md">
                                <img src="${productData.image_hover || productData.image}" alt="Vista detallada de ${productData.title || ''}" class="w-full h-full object-contain p-1">
                            </div>
                            <h4 class="font-bold text-sm uppercase text-gray-800" data-i18n="details">Detalles</h4>
                            <p class="text-xs mt-1"><b data-i18n="code">Código:</b> ${productData.code}</p>
                            ${sizesHTML}
                            ${colorsHTML}
                            <a href="./productos.html?product=${file.name.replace('.md', '')}" class="mt-auto block w-full text-center text-xs font-semibold bg-gray-900 text-white rounded-md py-2 hover:bg-gray-700" data-i18n="more_info">Más Información</a>
                        </div>
                        <div class="mt-3 text-left">
                            <h3 class="text-sm font-semibold uppercase text-gray-900">${productData.title || ''}</h3>
                            <p class="text-xs text-gray-600 mt-1 normal-case">${productData.description || ''}</p>
                            <p class="text-sm font-bold mt-1 text-black-600">$${Number(productData.price || 0).toLocaleString('es-CO')} COP</p>
                        </div>
                    </div>
                `;

                // --- Inserción en el contenedor correcto ---
                if (productData.category === 'Hombres' && contenedorHombres) {
                    contenedorHombres.innerHTML += productCardHTML;
                } else if (productData.category === 'Mujeres' && contenedorMujeres) {
                    contenedorMujeres.innerHTML += productCardHTML;
                }
            }

            // Vuelve a aplicar las traducciones después de añadir los nuevos productos
            setLanguage(localStorage.getItem('language') || 'es');

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
    cargarProductos(); // Se llama a la función para cargar productos
});