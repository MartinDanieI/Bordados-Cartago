// js/main.js - VERSIÓN COMPLETA Y FINAL

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

    if (mobileMenu) mobileMenu.addEventListener('click', e => e.stopPropagation());
    if (langMenu) langMenu.addEventListener('click', e => e.stopPropagation());
    
    // ================================================
    // 3. LÓGICA PARA CARGAR PRODUCTOS (VERSIÓN CORREGIDA Y ROBUSTA)
    // ================================================
    async function cargarProductos() {
    // Usamos el "puente" seguro de Netlify Functions
    const apiURL = '/.netlify/functions/getProducts';
    try {
        const response = await fetch(apiURL);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error en el servidor (Netlify Function): ${errorData.error || response.statusText}`);
        }
        
        const files = await response.json();
        if (!Array.isArray(files)) {
            throw new Error(files.message || "La respuesta no es una lista de productos válida. Revisa el Token de GitHub.");
        }

        const contenedorHombres = document.getElementById('productos-hombres');
        const contenedorMujeres = document.getElementById('productos-mujeres');

        if (contenedorHombres) contenedorHombres.innerHTML = '';
        if (contenedorMujeres) contenedorMujeres.innerHTML = '';

        for (const file of files) {
            if (file.type !== 'file' || !file.download_url) continue;

            const productResponse = await fetch(file.download_url);
            const productContent = await productResponse.text();

            // --- FUNCIÓN DE LECTURA "A PRUEBA DE BALAS" ---
            function parseFrontMatter(content) {
                const data = {};
                const frontMatterMatch = content.match(/---([\s\S]*?)---/);
                if (!frontMatterMatch) return data;
                
                const frontMatter = frontMatterMatch[1];
                
                // Expresiones regulares para cada tipo de dato
                const simpleRegex = /^(\w+):\s*"?([^"]*)"?$/gm;
                const sizeRegex = /-\s*size:\s*(.*)/g;
                const colorRegex = /-\s*name:\s*(.*)\n\s*hex:\s*(.*)/g;

                // Extraer campos simples
                let match;
                while ((match = simpleRegex.exec(frontMatter)) !== null) {
                    data[match[1]] = match[2];
                }

                // Extraer tallas y colores
                data.sizes = Array.from(frontMatter.matchAll(sizeRegex), m => m[1].trim().replace(/"/g, ''));
                data.colors = Array.from(frontMatter.matchAll(colorRegex), m => ({
                    name: m[1].replace(/"/g, '').trim(),
                    hex: m[2].trim()
                }));
                
                return data;
            }

            const productData = parseFrontMatter(productContent);
            
            let sizesHTML = '';
            if (productData.sizes && productData.sizes.length > 0) {
                 sizesHTML = `<p class="w-full text-xs text-gray-700 font-bold mt-2" data-i18n="sizes">Tallas:</p><div class="flex flex-wrap justify-center gap-1 mt-1">${productData.sizes.map(size => `<div class="border border-gray-400 rounded text-xs px-2 py-0.5">${size}</div>`).join('')}</div>`;
            }

            let colorsHTML = '';
            if (productData.colors && productData.colors.length > 0) {
                colorsHTML = `<p class="w-full text-xs text-gray-700 font-bold mt-2" data-i18n="colors">Colores:</p><div class="flex flex-wrap justify-center gap-2 mt-1">${productData.colors.map(color => `<div title="${color.name}"><span style="background-color: ${color.hex};" class="block w-5 h-5 rounded-full border border-gray-400"></span></div>`).join('')}</div>`;
            }

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
                        <p class="text-xs mt-1"><b data-i18n="code">Código:</b> ${productData.code || 'N/A'}</p>
                        ${sizesHTML}
                        ${colorsHTML}
                        <a href="./productos.html?product=${file.name.replace('.md', '')}" class="mt-auto block w-full text-center text-xs font-semibold bg-gray-900 text-white rounded-md py-2 hover:bg-gray-700" data-i18n="more_info">Más Información</a>
                    </div>
                    <div class="mt-3 text-left">
                        <h3 class="text-sm font-semibold uppercase text-gray-900">${productData.title || 'Producto sin nombre'}</h3>
                        <p class="text-xs text-gray-600 mt-1 normal-case">${productData.description || ''}</p>
                        <p class="text-sm font-bold mt-1 text-black-600">$${Number(productData.price || 0).toLocaleString('es-CO')} COP</p>
                    </div>
                </div>`;

            if (productData.category === 'Hombres' && contenedorHombres) {
                contenedorHombres.innerHTML += productCardHTML;
            } else if (productData.category === 'Mujeres' && contenedorMujeres) {
                contenedorMujeres.innerHTML += productCardHTML;
            }
        }
        setLanguage(localStorage.getItem('language') || 'es');
    } catch (error) {
        console.error("Error definitivo al cargar productos:", error);
        const productContainer = document.getElementById('productos-hombres') || document.getElementById('productos-mujeres');
        if(productContainer) productContainer.innerHTML = `<p class="col-span-full text-center text-red-500">Error al cargar productos: ${error.message}</p>`;
    }
}

    // ================================================
    // 4. INICIO
    // ================================================
    const savedLanguage = localStorage.getItem('language') || 'es';
    setLanguage(savedLanguage);
    await cargarProductos();
});