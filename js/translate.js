document.addEventListener('DOMContentLoaded', async () => {
    let translations = {};

    try {
        const response = await fetch('/lang/translations.json');
        translations = await response.json();
    } catch (error) {
        console.error('Could not load translations:', error);
        return;
    }

    const langMenuButton = document.getElementById('language-menu-button');
    const langMenu = document.getElementById('language-menu');
    const currentLangMobile = document.getElementById('current-lang-mobile');

    const setLanguage = (language) => {
        localStorage.setItem('language', language);
        document.documentElement.lang = language;

        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[language] && translations[language][key]) {
                element.innerHTML = translations[language][key];
            }
        });

        // Actualiza el texto del botón en móvil
        if (currentLangMobile) {
            currentLangMobile.textContent = language.toUpperCase();
        }

        // Cierra el menú desplegable después de seleccionar un idioma
        if (langMenu) {
            langMenu.classList.add('hidden');
        }
    };

    window.setLanguage = setLanguage;

    // Lógica para abrir/cerrar el menú de idiomas en móvil
    if (langMenuButton && langMenu) {
        langMenuButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Evita que el clic se propague y cierre el menú inmediatamente
            langMenu.classList.toggle('hidden');
        });
    }

    // Cierra el menú si se hace clic fuera de él
    document.addEventListener('click', (event) => {
        if (langMenu && !langMenu.classList.contains('hidden') && !langMenu.contains(event.target) && !langMenuButton.contains(event.target)) {
            langMenu.classList.add('hidden');
        }
    });
    
    const savedLanguage = localStorage.getItem('language') || 'es';
    setLanguage(savedLanguage);
});