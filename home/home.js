document.addEventListener('DOMContentLoaded', () => {
    const themeToggleButton = document.getElementById('theme-toggle-bottom');
    const themeIcon = document.getElementById('theme-icon-bottom');

    // Проверка, существуют ли элементы, чтобы избежать ошибок
    if (!themeToggleButton || !themeIcon) {
        console.error('Theme toggle button or icon not found on the home page!');
        return;
    }

    // Получаем текущую тему из localStorage или устанавливаем 'dark' по умолчанию
    let currentTheme = localStorage.getItem('theme') || 'dark';

    // Функция, которая применяет тему к странице
    const applyTheme = (theme) => {
        // Сначала удаляем оба класса, чтобы избежать конфликтов
        document.body.classList.remove('dark-theme', 'light-theme');
        // Добавляем нужный класс
        document.body.classList.add(`${theme}-theme`);

        // Меняем иконку в кнопке
        themeIcon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';

        // Сохраняем выбор пользователя
        localStorage.setItem('theme', theme);
    };

    // Вешаем обработчик клика на кнопку
    themeToggleButton.addEventListener('click', () => {
        // Меняем тему на противоположную
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        // Применяем новую тему
        applyTheme(currentTheme);
    });

    // Применяем тему при первой загрузке страницы
    applyTheme(currentTheme);
});