document.addEventListener('DOMContentLoaded', () => {

        function getUrlParameter(name) {
            name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            const regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
            const results = regex.exec(location.search);
            return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        }
        
        async function loadProductDetails() {
            const productName = getUrlParameter('product');

            const titleElement = document.getElementById('product-title-page');
            const mainTitleElement = document.getElementById('product-title');
            const codeElement = document.getElementById('product-code');
            const sizesListElement = document.getElementById('sizes-list');
            const productFabricElement = document.getElementById('product-fabric');
            const descriptionElement = document.getElementById('product-description');
            const pricePublicElement = document.getElementById('price-public');
            const priceWholesaleElement = document.getElementById('price-wholesale');
            const colorsListElement = document.getElementById('colors-list');
            const mainImageElement = document.getElementById('clothingImage');
            const hoverImageElement = document.getElementById('image-hover');
            const contactButton = document.getElementById('contact-button');

            if (!productName) {
                mainTitleElement.textContent = 'Producto no encontrado.';
                titleElement.textContent = 'Producto no encontrado.';
                return;
            }

            try {
                const productFilePath = `_productos/${productName}.md`;
                const response = await fetch(productFilePath);

                if (!response.ok) {
                    throw new Error(`Error al cargar el producto: ${response.statusText}`);
                }

                const mdContent = await response.text();

                const yamlDelimiter = '---';
                const yamlStart = mdContent.indexOf(yamlDelimiter) + yamlDelimiter.length;
                const yamlEnd = mdContent.indexOf(yamlDelimiter, yamlStart);
                const yamlContent = mdContent.substring(yamlStart, yamlEnd).trim();
                const descriptionContent = mdContent.substring(yamlEnd + yamlDelimiter.length).trim();

                const productData = parseYaml(yamlContent);

                titleElement.textContent = productData.title || 'N/A';
                mainTitleElement.textContent = productData.title || 'N/A';
                codeElement.textContent = productData.code || 'N/A';

                // Renderizar las tallas
                if (productData.sizes && Array.isArray(productData.sizes)) {
                    sizesListElement.textContent = productData.sizes.join(' ');
                } else {
                    sizesListElement.textContent = 'N/A';
                }
                
                // Asumo que el material se puede pasar como un campo en el YAML si lo deseas
                // En tu ejemplo de Markdown no está, pero lo he añadido en la lógica.
                productFabricElement.textContent = productData.material || 'No especificado';
                descriptionElement.textContent = productData.description || descriptionContent || 'No hay descripción disponible.';

                // Manejar los precios si existen, si no, mostrar N/A
                pricePublicElement.textContent = productData.price ? `$${productData.price.toLocaleString('es-CO')}` : 'N/A';
                // Asumo que el precio al por mayor se puede pasar como un campo en el YAML
                priceWholesaleElement.textContent = productData.price_wholesale ? `$${productData.price_wholesale.toLocaleString('es-CO')}` : 'N/A';
                
                // Cargar imágenes
                if (productData.image) {
                    mainImageElement.src = productData.image;
                } else {
                    mainImageElement.src = 'https://placehold.co/500x700/cccccc/333333?text=Imagen+no+disponible';
                }
                mainImageElement.onerror = () => {
                    mainImageElement.src = 'https://placehold.co/500x700/cccccc/333333?text=Imagen+no+disponible';
                };
                
                if (productData.image_hover) {
                    hoverImageElement.src = productData.image_hover;
                } else {
                    hoverImageElement.src = 'https://placehold.co/600x400/cccccc/333333?text=Imagen+detalle+no+disponible';
                }
                hoverImageElement.onerror = () => {
                    hoverImageElement.src = 'https://placehold.co/600x400/cccccc/333333?text=Imagen+detalle+no+disponible';
                };

                // Renderizar los colores
                colorsListElement.innerHTML = '';
                if (productData.colors && Array.isArray(productData.colors)) {
                    productData.colors.forEach(color => {
                        const div = document.createElement('div');
                        div.className = 'color-option flex flex-col items-center text-center w-14';
                        
                        const spanColor = document.createElement('span');
                        spanColor.style.backgroundColor = color.hex;
                        spanColor.className = 'block w-10 h-10 rounded-full border-2 border-gray-300 hover:border-blue-500 cursor-pointer transition-all duration-200';
                        spanColor.title = color.name;
                        
                        const spanText = document.createElement('span');
                        spanText.textContent = color.name;
                        spanText.className = 'text-xs text-gray-600 mt-1';
                        
                        div.appendChild(spanColor);
                        div.appendChild(spanText);
                        colorsListElement.appendChild(div);
                    });
                }
                
                const whatsappMessage = encodeURIComponent(`Hola, me interesa el producto "${productData.title}" (Código: ${productData.code}).`);
                contactButton.href = `https://api.whatsapp.com/send?phone=573154423296&text=${whatsappMessage}`;

            } catch (error) {
                console.error("Error al cargar los detalles del producto:", error);
                mainTitleElement.textContent = 'Error al cargar el producto.';
                titleElement.textContent = 'Error';
                descriptionElement.textContent = 'No se pudo encontrar la información del producto.';
                mainImageElement.src = 'https://placehold.co/500x700/cccccc/333333?text=Error';
                hoverImageElement.src = 'https://placehold.co/600x400/cccccc/333333?text=Error';
            }
        }

        function parseYaml(yamlStr) {
            const data = {};
            let currentListKey = null;

            yamlStr.split('\n').forEach(line => {
                const trimmedLine = line.trim();
                if (!trimmedLine) return;

                if (trimmedLine.startsWith('-')) {
                    if (currentListKey === 'colors') {
                        const match = trimmedLine.match(/- name:\s*(.*?)\s*hex:\s*"(.*?)"/);
                        if (match) {
                             data.colors.push({ name: match[1], hex: match[2] });
                        } else {
                            // Intenta un formato diferente si el primero falla
                            const subParts = trimmedLine.slice(1).trim().split(':');
                            if(subParts[0].trim() === 'name') {
                                const name = subParts[1].trim().replace(/"/g, '');
                                const hexLine = line.split('\n')[1].trim();
                                const hexMatch = hexLine.match(/hex:\s*"(.*?)"/);
                                if(hexMatch) {
                                    data.colors.push({name, hex: hexMatch[1]});
                                }
                            }
                        }
                    } else if (currentListKey === 'sizes') {
                        const value = trimmedLine.slice(1).trim();
                        data.sizes.push(value);
                    }
                } else {
                    const parts = trimmedLine.split(':');
                    const key = parts[0].trim();
                    let value = parts.slice(1).join(':').trim();

                    if (key === 'sizes' || key === 'colors') {
                        data[key] = [];
                        currentListKey = key;
                    } else {
                        if (value.startsWith('"') && value.endsWith('"')) {
                            value = value.slice(1, -1);
                        } else if (value.startsWith("'") && value.endsWith("'")) {
                            value = value.slice(1, -1);
                        }
                        data[key] = isNaN(value) ? value : parseInt(value, 10);
                        currentListKey = null;
                    }
                }
            });
            return data;
        }

        loadProductDetails();
    });