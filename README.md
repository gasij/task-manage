# NEXUS — Quantum Task Manager

Next.js версия хрустального task manager с WebGL-фоном Strands.

## Запуск

```bash
cd /Users/soprano/codework/irina
npm install
npm run dev
```
f
Откройте **только** [http://localhost:3000](http://localhost:3000) — не открывайте HTML-файлы напрямую.

Если видите 404 на `layout.css` / `main-app.js`:
1. Остановите сервер (Ctrl+C)
2. Удалите кэш: `rm -rf .next`
3. Запустите снова: `npm run dev`

## Стек

- Next.js 15 (App Router)
- React 19
- GSAP (анимации, Flip)
- OGL (Strands WebGL фон)

## Структура

- `src/app/` — layout, страница, глобальные стили
- `src/components/NexusApp.tsx` — основное приложение
- `src/components/Strands.tsx` — анимированный фон
- `legacy/index.html` — оригинальная одностраничная версия
