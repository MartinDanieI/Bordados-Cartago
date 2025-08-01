// Función para obtener el valor de un parámetro de la URL
function getUrlParameter(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    const regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
    const results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

// Función principal para cargar y renderizar el producto
async function loadProductDetails() {
    // 1. Obtener el nombre del producto de la URL
    const productName = getUrlParameter('product');

    if (!productName) {
        document.getElementById('product-title').textContent = 'Producto no encontrado.';
        return;
    }

    try {
        // 2. Construir la ruta al archivo Markdown y solicitarlo
        const productFilePath = `_productos/${productName}.md`;
        const response = await fetch(productFilePath);

        if (!response.ok) {
            throw new Error(`Error al cargar el producto: ${response.statusText}`);
        }

        const mdContent = await response.text();

        // 3. Extraer el front matter YAML y la descripción
        const yamlDelimiter = '---';
        const yamlStart = mdContent.indexOf(yamlDelimiter) + yamlDelimiter.length;
        const yamlEnd = mdContent.indexOf(yamlDelimiter, yamlStart);
        const yamlContent = mdContent.substring(yamlStart, yamlEnd).trim();
        const descriptionContent = mdContent.substring(yamlEnd + yamlDelimiter.length).trim();

        // Usaremos la función de parseo simple que te di antes
        const productData = parseYaml(yamlContent);

        // 4. Rellenar el HTML con los datos
        document.getElementById('product-title-page').textContent = productData.title;
        document.getElementById('product-title').textContent = productData.title;
        document.getElementById('product-code').textContent = `Código: ${productData.code}`;
        document.getElementById('product-price').textContent = `$${productData.price.toLocaleString('es-CO')}`;
        document.getElementById('product-description').textContent = descriptionContent;
        document.getElementById('product-main-image').src = productData.image;

        // 5. Renderizar las tallas
        const sizesList = document.getElementById('sizes-list');
        sizesList.innerHTML = '';
        productData.sizes.forEach(size => {
            const span = document.createElement('span');
            span.textContent = size;
            span.className = 'size-tag border border-gray-400 p-2 rounded-full'; // Clases de Tailwind
            sizesList.appendChild(span);
        });

        // 6. Renderizar los colores
        const colorsList = document.getElementById('colors-list');
        colorsList.innerHTML = '';
        productData.colors.forEach(color => {
            const span = document.createElement('span');
            span.textContent = color.name;
            span.className = 'color-swatch border border-gray-400 p-2 rounded-full w-8 h-8'; // Clases de Tailwind
            span.style.backgroundColor = color.hex;
            span.title = color.name;
            colorsList.appendChild(span);
        });

    } catch (error) {
        console.error("Error al cargar los detalles del producto:", error);
        document.getElementById('product-title-page').textContent = 'Error';
        document.getElementById('product-title').textContent = 'Error al cargar el producto.';
    }
}

// Función simple para parsear el YAML (MEJOR USAR LIBRERÍA EN PRODUCCIÓN)
function parseYaml(yamlStr) {
    const lines = yamlStr.split('\n');
    const data = {};
    let listKey = null;

    lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine === '') return;

        if (trimmedLine.endsWith(':')) {
            const key = trimmedLine.slice(0, -1).trim();
            listKey = key;
            if (trimmedLine.includes('colors:')) {
                data.colors = [];
            } else if (trimmedLine.includes('sizes:')) {
                data.sizes = [];
            } else {
                data[key] = {};
            }
        } else if (trimmedLine.startsWith('-')) {
            const value = trimmedLine.slice(1).trim();
            if (data[listKey]) {
                if (listKey === 'colors') {
                    const nameMatch = value.match(/name: "(.*)"/);
                    const hexMatch = value.match(/hex: "(.*)"/);
                    if (nameMatch && hexMatch) {
                        data.colors.push({ name: nameMatch[1], hex: hexMatch[1] });
                    }
                } else if (listKey === 'sizes') {
                    data.sizes.push(value);
                }
            }
        } else {
            const [key, ...valueParts] = trimmedLine.split(':');
            const value = valueParts.join(':').trim();
            data[key.trim()] = isNaN(value) ? value.replace(/"/g, '') : (value.includes('.') ? parseFloat(value) : parseInt(value, 10));
            listKey = null;
        }
    });
    return data;
}

// Llama a la función al cargar la página
window.addEventListener('DOMContentLoaded', loadProductDetails);