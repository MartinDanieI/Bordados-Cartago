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

    // Si alguno de los elementos no existe, no hacemos nada.
    if (!imageContainer || !clothingImage || !magnifier) return;

    // Asegurarnos que la imagen principal esté cargada para tener sus dimensiones correctas
    clothingImage.addEventListener('load', () => {
        // Configuramos el tamaño de la imagen zoomeada dentro de la lupa
        const zoomFactor = 2; // Puedes cambiar este número para más o menos zoom (ej: 2.5)
        magnifier.style.backgroundSize = (clothingImage.naturalWidth * zoomFactor) + 'px ' + (clothingImage.naturalHeight * zoomFactor) + 'px';
    });

    imageContainer.addEventListener('mouseenter', () => {
        magnifier.classList.add('show');
        // Le ponemos la misma imagen de fondo a la lupa
        magnifier.style.backgroundImage = `url('${clothingImage.src}')`;
    });

    imageContainer.addEventListener('mousemove', (e) => {
        // Obtenemos la posición del cursor RELATIVA a la imagen
        const rect = clothingImage.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;

        // Posicionamos el centro de la lupa donde está el cursor
        magnifier.style.left = x + 'px';
        magnifier.style.top = y + 'px';

        // --- ESTA ES LA MATEMÁTICA CORREGIDA ---
        // Calculamos el porcentaje de la posición del cursor sobre la imagen
        const xPercent = (x / clothingImage.offsetWidth) * 100;
        const yPercent = (y / clothingImage.offsetHeight) * 100;

        // Movemos el fondo de la lupa a ese mismo porcentaje para que coincida
        magnifier.style.backgroundPosition = `${xPercent}% ${yPercent}%`;
    });

    imageContainer.addEventListener('mouseleave', () => {
        magnifier.classList.remove('show');
    });
}

    // --- INICIO DE LA EJECUCIÓN ---
    loadProductDetails();
});