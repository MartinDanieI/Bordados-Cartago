// js/main.js - VERSIÓN FINAL CON EL LECTOR DE DATOS CORRECTO

document.addEventListener('DOMContentLoaded', async () => {
    
    // --- LÓGICA DE TRADUCCIÓN Y MENÚS (Esto no cambia) ---
    let translations = {};
    try {
        const response = await fetch('/lang/translations.json');
        translations = await response.json();
    } catch (error) { console.error('Error cargando traducciones:', error); }

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
    
    const menuButton = document.getElementById('menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const langMenuButton = document.getElementById('language-menu-button');
    const langMenu = document.getElementById('language-menu');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', (e) => { e.stopPropagation(); mobileMenu.classList.toggle('hidden'); });
    }
    if (langMenuButton && langMenu) {
        langMenuButton.addEventListener('click', (e) => { e.stopPropagation(); langMenu.classList.toggle('hidden'); });
    }
    document.addEventListener('click', (event) => {
        if (mobileMenu && !mobileMenu.classList.contains('hidden') && !menuButton.contains(event.target)) { mobileMenu.classList.add('hidden'); }
        if (langMenu && !langMenu.classList.contains('hidden') && !langMenuButton.contains(event.target)) { langMenu.classList.add('hidden'); }
    });
    if (mobileMenu) mobileMenu.addEventListener('click', e => e.stopPropagation());
    if (langMenu) langMenu.addEventListener('click', e => e.stopPropagation());
    
    // ================================================
    // 3. LÓGICA PARA CARGAR PRODUCTOS (CON EL LECTOR FINAL)
    // ================================================
    async function cargarProductos() {
        const apiURL = '/.netlify/functions/getProducts';
        try {
            const response = await fetch(apiURL);
            if (!response.ok) throw new Error(`Error en la función de Netlify: ${response.statusText}`);
            const files = await response.json();
            if (!Array.isArray(files)) throw new Error(files.message || "La respuesta no es una lista de productos válida.");

            const contenedorHombres = document.getElementById('productos-hombres');
            const contenedorMujeres = document.getElementById('productos-mujeres');
            if (contenedorHombres) contenedorHombres.innerHTML = '';
            if (contenedorMujeres) contenedorMujeres.innerHTML = '';

            for (const file of files) {
                if (file.type !== 'file') continue;
                const productResponse = await fetch(file.download_url);
                const productContent = await productResponse.text();

                // --- FUNCIÓN DE LECTURA (NUEVA Y SIMPLIFICADA) ---
              function parseFrontMatter(content) {
    const data = {};
    const frontMatterMatch = content.match(/---([\s\S]*?)---/);
    if (!frontMatterMatch) return data;
    const frontMatter = frontMatterMatch[1];

    const simpleRegex = /^(\w+):\s*(.*)$/gm;
    let match;
    while ((match = simpleRegex.exec(frontMatter)) !== null) {
        data[match[1]] = match[2].trim().replace(/"/g, '');
    }

    data.sizes = Array.from(frontMatter.matchAll(/-\s*(S|M|L|XL|XXL)/g), m => m[1]);
    
    // ESTA ES LA LÓGICA CORREGIDA PARA LEER COLORES
    data.colors = Array.from(frontMatter.matchAll(/-\s*name:\s*(.*?)\s*\n\s*hex:\s*(.*)/g), m => {
        let hex = m[2].trim().replace(/"/g, '');
        if (!hex.startsWith('#')) {
            hex = '#' + hex; // Solo añade el # si falta
        }
        return {
            name: m[1].trim().replace(/"/g, ''),
            hex: hex
        };
    });
    
    return data;
}

                const productData = parseFrontMatter(productContent);
                
                let sizesHTML = '';
                if (productData.sizes && productData.sizes.length > 0) {
                     sizesHTML = `<p class="text-xs mt-1 text-gray-700"><b data-i18n="sizes">Tallas:</b> ${productData.sizes.join(', ')}</p>`;
                }

                let colorsHTML = '';
                if (productData.colors && productData.colors.length > 0) {
                    colorsHTML = `
                        <p class="text-xs text-gray-700 font-bold" data-i18n="colors">Colores:</p>
                        <div class="flex justify-center items-start space-x-1 mt-1">
                            ${productData.colors.map(color => `
                                <div class="flex flex-col items-center w-12">
                                    <span class="block w-6 h-6 rounded-full border border-gray-400" style="background-color: ${color.hex};"></span>
                                    <p class="text-[10px] mt-1 text-gray-600 leading-tight">${color.name}</p>
                                </div>
                            `).join('')}
                        </div>`;
                }

               const productCardHTML = `
    <div class="group relative image-background-container">
        <a href="./productos.html?product=${file.name.replace('.md', '')}">
            <div class="bg-gray-100 w-full aspect-[3/4] overflow-hidden rounded-lg shadow-md">
                <img src="${productData.image || ''}" alt="${productData.title || ''}" class="w-full h-full object-contain p-0">
            </div>
        </a>
        <div class="absolute inset-0 bg-gray-200 bg-opacity-95 flex flex-col justify-start items-center p-4 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 invisible group-hover:visible rounded-lg shadow-lg overflow-hidden">
            <div class="w-full mb-3 aspect-[16/9] flex justify-center items-center bg-gray-300 rounded-md">
                <img src="${productData.image_hover || productData.image}" alt="Vista detallada de ${productData.title || ''}" class="w-full h-full object-contain p-1">
            </div>
            <h4 class="font-bold text-sm uppercase text-gray-800" data-i18n="details">Detalles</h4>
            <p class="text-xs mt-2 text-gray-700"><b data-i18n="code">Código:</b> ${productData.code || 'N/A'}</p>
            ${sizesHTML}
            <div class="w-full mt-2">
                ${colorsHTML}
                <div class="w-full mt-2">
                    <a href="./productos.html?product=${file.name.replace('.md', '')}" class="mt-2 block text-center text-xs font-semibold bg-gray-900 text-white rounded-md py-2" data-i18n="more_info">Más Información</a>
                </div>
            </div>
        </div>
        <div class="mt-3 text-left">
            <h3 class="text-sm font-semibold uppercase text-gray-900">${productData.title || ''}</h3>
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
        }
    }

    // --- INICIO ---
    const savedLanguage = localStorage.getItem('language') || 'es';
    setLanguage(savedLanguage);
    await cargarProductos();
});