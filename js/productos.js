// Obtener referencias a los elementos HTML
        const imageContainer = document.querySelector('.image-container');
        const clothingImage = document.getElementById('clothingImage');
        const magnifier = document.getElementById('magnifier');

        // Factor de zoom para la lupa (ej: 2 significa 200% de zoom)
        const zoomFactor = 2;

        // Ancho y alto de la lupa
        // Es importante obtener estos valores después de que la lupa se haya renderizado
        // o establecer un tamaño fijo en CSS si no hay problemas de responsividad.
        // Para asegurar que se obtienen los valores correctos, se pueden inicializar
        // en el evento mouseenter o usar un tamaño fijo definido en CSS.
        // Aquí los inicializamos con un valor por defecto que se actualizará.
        let magnifierWidth = 150; // Valor por defecto del CSS
        let magnifierHeight = 150; // Valor por defecto del CSS

        // Evento cuando el cursor entra en el contenedor de la imagen
        imageContainer.addEventListener('mouseenter', () => {
            // Actualizar el ancho y alto de la lupa al entrar, por si acaso
            magnifierWidth = magnifier.offsetWidth;
            magnifierHeight = magnifier.offsetHeight;

            magnifier.classList.add('show'); // Muestra la lupa
            // Establece la imagen de fondo de la lupa con la misma imagen principal
            magnifier.style.backgroundImage = `url('${clothingImage.src}')`;
            // Establece el tamaño de la imagen de fondo de la lupa (imagen original * zoomFactor)
            // Esto es crucial para el efecto de lupa
            magnifier.style.backgroundSize =
                (clothingImage.naturalWidth * zoomFactor) + 'px ' +
                (clothingImage.naturalHeight * zoomFactor) + 'px';
        });

        // Evento cuando el cursor se mueve sobre el contenedor de la imagen
        imageContainer.addEventListener('mousemove', (e) => {
            // Obtener la posición del contenedor de la imagen en la ventana
            const rect = imageContainer.getBoundingClientRect();

            // Calcular la posición del cursor relativa al contenedor de la imagen
            // e.clientX/Y son las coordenadas del cursor en la ventana
            // rect.left/top son las coordenadas del borde superior/izquierdo del contenedor
            let x = e.clientX - rect.left;
            let y = e.clientY - rect.top;

            // Asegurarse de que el cursor esté dentro de los límites de la imagen
            if (x < 0) x = 0;
            if (y < 0) y = 0;
            if (x > rect.width) x = rect.width;
            if (y > rect.height) y = rect.height;

            // Posicionar la lupa centrada en el cursor
            // La lupa se mueve con el cursor
            magnifier.style.left = x + 'px';
            magnifier.style.top = y + 'px';

            // Calcular la posición de la imagen de fondo dentro de la lupa
            // Esto desplaza la imagen de fondo para mostrar la sección correcta ampliada
            // Se usa la relación entre el tamaño natural de la imagen y su tamaño actual en pantalla
            const scaleX = clothingImage.naturalWidth / clothingImage.offsetWidth;
            const scaleY = clothingImage.naturalHeight / clothingImage.offsetHeight;

            let backgroundX = (-x * zoomFactor * scaleX) + (magnifierWidth / 2);
            let backgroundY = (-y * zoomFactor * scaleY) + (magnifierHeight / 2);

            magnifier.style.backgroundPosition = `${backgroundX}px ${backgroundY}px`;
        });

        // Evento cuando el cursor sale del contenedor de la imagen
        imageContainer.addEventListener('mouseleave', () => {
            magnifier.classList.remove('show'); // Oculta la lupa
        });