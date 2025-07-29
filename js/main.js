// js/main.js - El único script que necesitas (AHORA SÍ, CORREGIDO)

document.addEventListener('DOMContentLoaded', async () => {
    
    // ================================================
    // 1. LÓGICA DE TRADUCCIÓN
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
    // 2. LÓGICA DE LOS MENÚS
    // ================================================
    const menuButton = document.getElementById('menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const langMenuButton = document.getElementById('language-menu-button');
    const langMenu = document.getElementById('language-menu');

    // Abrir/Cerrar menú de navegación
    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', (e) => {
            e.stopPropagation(); // <-- ¡ESTA ERA LA LÍNEA QUE FALTABA!
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Abrir/Cerrar menú de idiomas
    if (langMenuButton && langMenu) {
        langMenuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            langMenu.classList.toggle('hidden');
        });
    }

    // Cierra los menús si se hace clic fuera
    document.addEventListener('click', (event) => {
        // Cierra menú de navegación si el clic es afuera
        if (mobileMenu && !mobileMenu.classList.contains('hidden') && !menuButton.contains(event.target)) {
            mobileMenu.classList.add('hidden');
        }
        // Cierra menú de idiomas si el clic es afuera
        if (langMenu && !langMenu.classList.contains('hidden') && !langMenuButton.contains(event.target)) {
            langMenu.classList.add('hidden');
        }
    });
    
    // ================================================
    // 3. INICIO
    // ================================================
    const savedLanguage = localStorage.getItem('language') || 'es';
    setLanguage(savedLanguage);
});