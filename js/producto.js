// js/producto.js (Versión Corregida y Unificada)

document.addEventListener('DOMContentLoaded', () => {

    // --- FUNCIÓN PARA LEER EL "TIQUETE" DE LA URL ---
    function getUrlParameter(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        const regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
        const results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    // --- FUNCIÓN PARA "LEER" LOS DATOS DEL PRODUCTO ---
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
        data.colors = Array.from(frontMatter.matchAll(/-\s*name:\s*(.*?)\s*\n\s*hex:\s*#?(.*)/g), m => ({
            name: m[1].trim().replace(/"/g, ''),
            hex: '#' + m[2].trim()
        }));
        return data;
    }

    // --- FUNCIÓN PRINCIPAL PARA CARGAR EL PRODUCTO ---
    async function loadProductDetails() {
        const productSlug = getUrlParameter('product');

        if (!productSlug) {
            document.body.innerHTML = "<h1>Producto no especificado.</h1>";
            return;
        }

        try {
            const response = await fetch(`/.netlify/functions/getProducts?file=${productSlug}.md`);
            if (!response.ok) throw new Error("El producto no se encontró en el servidor.");
            
            const productContent = await response.text();
            const productData = parseFrontMatter(productContent);

            // --- RELLENAR LA PLANTILLA CON LOS DATOS ---
            document.getElementById('product-title-page').textContent = productData.title;
            document.getElementById('product-title').textContent = productData.title;
            document.getElementById('product-code').textContent = productData.code;
            document.getElementById('clothingImage').src = productData.image; // ID Corregido
            document.getElementById('image-hover').src = productData.image_hover || productData.image;
            document.getElementById('product-description').textContent = productData.description;
            document.getElementById('price-public').textContent = `$${Number(productData.price || 0).toLocaleString('es-CO')}`;
            
            const sizesContainer = document.getElementById('sizes-list');
            if (sizesContainer && productData.sizes && productData.sizes.length > 0) {
                sizesContainer.innerHTML = productData.sizes.map(size => 
                    `<div class="size-option border border-gray-300 rounded-md py-2 px-4 cursor-pointer hover:bg-gray-200">${size}</div>`
                ).join('');
            }
            
            const colorsContainer = document.getElementById('colors-list');
            if (colorsContainer && productData.colors && productData.colors.length > 0) {
                colorsContainer.innerHTML = productData.colors.map(color => `
                    <div class="color-option border-2 border-transparent rounded-full p-1 cursor-pointer hover:border-gray-400" title="${color.name}">
                        <span style="background-color: ${color.hex};" class="block w-8 h-8 rounded-full"></span>
                    </div>
                `).join('');
            }

            // Inicializa la lupa DESPUÉS de cargar la imagen
            initializeMagnifier();

        } catch (error) {
            console.error("Error al cargar el producto:", error);
            document.body.innerHTML = `<h1>Error al cargar el producto.</h1><p>${error.message}</p>`;
        }
    }

    // --- FUNCIÓN PARA INICIALIZAR LA LUPA ---
    function initializeMagnifier() {
        const imageContainer = document.querySelector('.image-container');
        const clothingImage = document.getElementById('clothingImage');
        // Crea el elemento de la lupa si no existe
        if (!document.getElementById('magnifier')) {
            const magnifierDiv = document.createElement('div');
            magnifierDiv.id = 'magnifier';
            magnifierDiv.className = 'magnifier';
            imageContainer.appendChild(magnifierDiv);
        }
        const magnifier = document.getElementById('magnifier');

        if (!imageContainer || !clothingImage || !magnifier) return;

        imageContainer.addEventListener('mouseenter', () => {
            magnifier.classList.add('show');
            magnifier.style.backgroundImage = `url('${clothingImage.src}')`;
            magnifier.style.backgroundSize = (clothingImage.naturalWidth * 2) + 'px ' + (clothingImage.naturalHeight * 2) + 'px';
        });

        imageContainer.addEventListener('mousemove', (e) => {
            const rect = imageContainer.getBoundingClientRect();
            let x = e.clientX - rect.left;
            let y = e.clientY - rect.top;

            magnifier.style.left = x + 'px';
            magnifier.style.top = y + 'px';

            let bgX = -x * 2 + (magnifier.offsetWidth / 2);
            let bgY = -y * 2 + (magnifier.offsetHeight / 2);
            magnifier.style.backgroundPosition = `${bgX}px ${bgY}px`;
        });

        imageContainer.addEventListener('mouseleave', () => {
            magnifier.classList.remove('show');
        });
    }

    // --- INICIO DE LA EJECUCIÓN ---
    loadProductDetails();
});