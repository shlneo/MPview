# MPView

Десктоп-приложение (Windows) для управления и запуска broadcast-HUD оверлеев для CS2 — по аналогии с тем, как выглядят HUD-панели на профессиональных трансляциях.

Сейчас в репозитории собран только каркас (навигация между разделами: HUDs, Players, Teams, Matches, Live Game Data, Spectator Binds). Логика наполнения разделов данными будет добавляться следующими шагами.

Общее устройство проекта описано отдельно в [ARCHITECTURE.md](./ARCHITECTURE.md) — начните с него, если непонятно, что где лежит и почему.

## Стек

- [Electron](https://www.electronjs.org/) — обёртка десктоп-приложения
- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) — интерфейс
- [Vite](https://vitejs.dev/) / [electron-vite](https://electron-vite.org/) — сборка и dev-сервер
- [Tailwind CSS](https://tailwindcss.com/) v4 — стили
- [react-router-dom](https://reactrouter.com/) — навигация между разделами

## Требования

- **Windows 10/11**
- **Node.js 20+** (проверялось на Node 24) — скачать с [nodejs.org](https://nodejs.org/)
- npm (устанавливается вместе с Node.js)

Проверить, что всё установлено:

```powershell
node -v
npm -v
```

## Установка с нуля

1. Склонировать/скопировать репозиторий и перейти в его папку:

   ```powershell
   cd D:\work\MPveiw
   ```

2. Установить зависимости:

   ```powershell
   npm install
   ```

3. Если после установки папка `node_modules\electron\dist` пустая (бинарник Electron не скачался автоматически — так бывает при обрыве сети во время `npm install`), докачать его вручную:

   ```powershell
   node node_modules/electron/install.js
   ```

   Проверить, что бинарник появился:

   ```powershell
   dir node_modules\electron\dist\electron.exe
   ```

## Запуск в режиме разработки

```powershell
npm run dev
```

Откроется окно приложения с горячей перезагрузкой: изменения в коде `src/renderer` подхватываются сразу без перезапуска, изменения в `src/main` и `src/preload` — с автоматическим перезапуском окна.

Чтобы закрыть — просто закройте окно приложения (процесс `electron-vite dev` завершится сам).

### Известная особенность окружения

Если приложение падает с ошибкой вида:

```
TypeError: Cannot read properties of undefined (reading 'isPackaged')
```

— значит в переменных окружения терминала уже стоит `ELECTRON_RUN_AS_NODE=1` (остаётся, например, от другого Electron-приложения, запустившего этот терминal). Из-за неё `electron.exe` запускается как обычный Node.js, а не как Electron, и модуль `electron` не даёт доступа к `app`. Проверить:

```powershell
echo $env:ELECTRON_RUN_AS_NODE
```

Если выводит `1` — снять переменную перед запуском:

```powershell
Remove-Item Env:ELECTRON_RUN_AS_NODE
npm run dev
```

## Сборка production-версии

```powershell
npm run build
```

Соберёт main/preload/renderer в папку `out/`. Для получения полноценного `.exe`-инсталлятора сюда потребуется добавить [electron-builder](https://www.electron.build/) — это отдельный шаг, пока не настроен.

## Полезные команды

| Команда | Что делает |
|---|---|
| `npm run dev` | Запуск в режиме разработки с hot-reload |
| `npm run build` | Production-сборка в `out/` |
| `npm run preview` | Запуск уже собранной (`out/`) версии без dev-сервера |

## Структура проекта

Подробно — в [ARCHITECTURE.md](./ARCHITECTURE.md).
