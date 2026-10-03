# Страница отзывов «Тёплый свет»

Статическая страница для GitHub Pages. Игровую сборку и черновик Яндекс Игр она не затрагивает.

Форма подключена к [Formspree](https://formspree.io/forms/mzeznykb/submissions). Отзывы поступают в раздел Submissions кабинета владельца, а игрокам аккаунт не нужен. В HTML не указаны имя и почта игрока; личные данные в тексте лучше не присылать.

GitHub Pages уже настроен на **GitHub Actions**. Workflow `feedback-pages.yml` публикует только эту папку по адресу `https://v-kozintsev.github.io/teply-svet/` после изменения файлов страницы в `main`.

Проверка локально: `python -m http.server 4180 --directory feedback-site`, затем открыть `http://localhost:4180/`. Не отправляйте тестовый отзыв с личными данными.
