// js/producto.js (Versión Final y Sincronizada)

document.addEventListener('DOMContentLoaded', () => {

    // --- FUNCIÓN PARA LEER EL PARÁMETRO DE LA URL ---
    function getUrlParameter(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        const regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
        const results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    // --- FUNCIÓN PARA "LEER" LOS DATOS DEL ARCHIVO .MD ---
    function parseFrontMatter(content) {
        const data = {};
        const frontMatterMatch = content.match(/---([\s\S]*?)---/);
        if (!frontMatterMatch) return data;
        const frontMatter = frontMatterMatch[1];
        const lines = frontMatter.split('\n');

        let currentList = null;
        let lastColorObject = null;

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();
            if (trimmedLine === '') return;
            const keyMatch = trimmedLine.match(/^([a-zA-Z_]+):(.*)/);
            if (keyMatch && !trimmedLine.startsWith('-')) {
                const key = keyMatch[1]; const value = keyMatch[2].trim();
                if (value) { data[key] = value.replace(/"/g, ''); currentList = null; } 
                else { currentList = key; data[currentList] = []; }
            } else if (trimmedLine.startsWith('-')) {
                if (currentList === 'sizes') {
                    data.sizes.push(trimmedLine.substring(1).trim());
                } else if (currentList === 'colors') {
                    const nameMatch = lines[index].match(/-\s*name:\s*(.*)/);
                    const hexMatch = lines[index + 1] ? lines[index + 1].match(/\s*hex:\s*(.*)/) : null;
                    if (nameMatch && hexMatch) {
                        let hex = hexMatch[1].trim();
                        if (!hex.startsWith('#')) hex = '#' + hex;
                        data.colors.push({ name: nameMatch[1].trim(), hex });
                    }
                }
            }
        });
        return data;
    }
    // --- FUNCIÓN PRINCIPAL PARA CARGAR Y MOSTRAR EL PRODUCTO ---
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

            // --- RELLENAR LA PLANTILLA CON LOS DATOS (IDS SINCRONIZADOS) ---
            document.title = `${productData.title} | FLOR BORDADOS Y CALADOS`;
            document.getElementById('product-title').textContent = productData.title;
            document.getElementById('product-code').textContent = productData.code;
            document.getElementById('clothingImage').src = productData.image;
            document.getElementById('image-hover').src = productData.image_hover || productData.image;
            document.getElementById('product-description').textContent = productData.description;
            document.getElementById('price-public').textContent = `$${Number(productData.price || 0).toLocaleString('es-CO')}`;
            document.getElementById('product-fabric').textContent = productData.type || "100% Lino";

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