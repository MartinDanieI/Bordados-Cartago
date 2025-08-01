// js/producto.js

document.addEventListener('DOMContentLoaded', async () => {
    
    // --- 1. LEER EL "TIQUETE" DE LA URL ---
    const params = new URLSearchParams(window.location.search);
    const productSlug = params.get('product');

    if (!productSlug) {
        document.body.innerHTML = "<h1>Producto no especificado.</h1>";
        return;
    }

    try {
        // --- 2. PEDIR LA INFO DE ESE PRODUCTO AL "PUENTE" ---
        const response = await fetch(`/.netlify/functions/getProducts?file=${productSlug}.md`);
        if (!response.ok) throw new Error("El producto no se encontró.");
        
        const productContent = await response.text();

        // --- 3. USAR EL MISMO "LECTOR" DE DATOS QUE EN MAIN.JS ---
        function parseFrontMatter(content) {
            const data = { sizes: [], colors: [] };
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
                    const key = keyMatch[1];
                    const value = keyMatch[2].trim();
                    if (value) {
                        data[key] = value.replace(/"/g, '');
                        currentList = null;
                    } else {
                        currentList = key;
                        data[currentList] = [];
                    }
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
                } else if (trimmedLine.includes(':') && currentList === 'colors' && lastColorObject) {
                    const parts = trimmedLine.split(':');
                    const key = parts[0].trim();
                    let value = parts.slice(1).join(':').trim();
                    if (key === 'hex' && !value.startsWith('#')) value = '#' + value;
                    lastColorObject[key] = value;
                }
            });
            return data;
        }

        const productData = parseFrontMatter(productContent);
        
        // --- 4. RELLENAR LA PLANTILLA HTML CON LOS DATOS ---
        document.getElementById('product-title-page').textContent = productData.title;
        document.getElementById('product-title').textContent = productData.title;
        document.getElementById('product-code').textContent = productData.code;
        document.getElementById('clothingImage').src = productData.image;
        document.getElementById('image-hover').src = productData.image_hover || productData.image;
        document.getElementById('product-description').textContent = productData.description;
        document.getElementById('price-public').textContent = `$${Number(productData.price || 0).toLocaleString('es-CO')}`;

        // Renderizar Tallas
        const sizesContainer = document.getElementById('sizes-list');
        if (productData.sizes && productData.sizes.length > 0) {
            sizesContainer.innerHTML = productData.sizes.map(size => 
                `<div class="size-option border border-gray-300 rounded-md py-2 px-4 cursor-pointer hover:bg-gray-200">${size}</div>`
            ).join('');
        }
        
        // Renderizar Colores
        const colorsContainer = document.getElementById('colors-list');
        if (productData.colors && productData.colors.length > 0) {
            colorsContainer.innerHTML = productData.colors.map(color => `
                <div class="color-option border-2 border-transparent rounded-full p-1 cursor-pointer hover:border-gray-400" title="${color.name}">
                    <span style="background-color: ${color.hex};" class="block w-8 h-8 rounded-full"></span>
                </div>
            `).join('');
        }
        
    } catch (error) {
        console.error("Error al cargar el producto:", error);
        document.body.innerHTML = `<h1>Error al cargar el producto.</h1><p>${error.message}</p>`;
    }
});