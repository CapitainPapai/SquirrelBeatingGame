# Tauri v2 — нативная версия Squirrel Beating Game

Один и тот же веб-код игры упаковывается в приложения для **Windows, macOS, Linux, Android и iOS**.
Оболочка тонкая: системный WebView + Rust, поэтому бандлы получаются ~5–10 МБ вместо 100+ МБ у Electron.

```
tauri/
├── package.json              скрипты и @tauri-apps/cli
├── scripts/prepare-web.mjs   копирует игру из корня репозитория в tauri/web
├── web/                      сгенерированная веб-копия (в git не попадает)
├── src-tauri/
│   ├── Cargo.toml            Rust-зависимости (tauri, serde)
│   ├── build.rs
│   ├── tauri.conf.json       окно, CSP, bundle-настройки, версия
│   ├── capabilities/         разрешения (ядро + заголовок окна)
│   ├── icons/                иконки png/ico/icns
│   └── src/main.rs, lib.rs   команды сохранения и точка входа
└── ci/tauri-build.yml        готовый GitHub Actions workflow (скопировать в .github/workflows/)
```

Игра остаётся единственным источником правды в корне репозитория: `index.html`, `css/`, `js/`.
Папка `tauri/web` — просто дистрибутив, её собирает `prepare-web.mjs` перед каждой сборкой.

---

## 1. Что уже учтено в коде игры

| Что | Как решено |
| --- | --- |
| Сейвы | `js/storage.js` + Rust-команды: `localStorage` остаётся буфером, а мастер-копия пишется в файл приложения (`<AppData>/com.squirrelbeatinggame.app/save.json`). При старте файл поднимается обратно — старые сейвы веб-версии не теряются. |
| Service worker | В нативе не регистрируется (`isNative()`), плюс `sw.js` не копируется в сборку. |
| Плашка Netlify | Скрипт из сборки вырезается — она нужна только на хостинге. |
| Офлайн | Всё локально: ни одного сетевого запроса, шрифты системные, музыка синтезируется. |
| Экспорт/импорт | «Настройки → Сохранение»: выгрузка/загрузка JSON — перенос прогресса между устройствами. |
| Масштаб окна | Размер окна 520×900 (min 340×540), интерфейс адаптивный. |

## 2. Требования

- **Node.js 18+** — для CLI и скрипта подготовки веб-части.
- **Rust 1.77.2+** — [rustup.rs](https://rustup.rs). Windows: MSVC Build Tools. Linux: `libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev`. macOS: Xcode Command Line Tools.
- **Android**: JDK 17, Android Studio + SDK/NDK, `ANDROID_HOME`/`NDK_HOME`, Rust-таргеты `aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android`.
- **iOS**: Mac + Xcode 26, CocoaPods, Rust-таргеты `aarch64-apple-ios aarch64-apple-ios-sim x86_64-apple-ios`.

## 3. Быстрый старт

```bash
cd tauri
npm install              # ставит @tauri-apps/cli

npm run dev              # дев-окно с горячей перезагрузкой
npm run build            # установщики в src-tauri/target/release/bundle/
```

Собрать только свою платформу:

```bash
npx tauri build --bundles msi      # Windows
npx tauri build --bundles dmg      # macOS
npx tauri build --bundles deb,appimage
```

## 4. Android

```bash
cd tauri
rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android
npm run android:init          # создаёт src-tauri/gen/android (один раз)
npm run android:dev           # запуск на подключённом устройстве/эмуляторе
npm run android:apk           # тестовый .apk для установки «снаружи»
npm run android:aab           # .aab для Google Play
```

**Подпись APK/AAB.** Сгенерируй keystore один раз и сохрани навсегда (без него нельзя выпускать обновления):

```bash
keytool -genkey -v -keystore squirrel.keystore -alias squirrel \
  -keyalg RSA -keysize 2048 -validity 10000
```

Пропиши в `src-tauri/gen/android/keystore.properties` (файл в `.gitignore`):

```properties
password=ТВОЙ_ПАРОЛЬ
keyAlias=squirrel
storeFile=/абсолютный/путь/squirrel.keystore
```

**Вибрация.** В `src-tauri/gen/android/app/src/main/AndroidManifest.xml` внутри `<manifest>` добавь:

```xml
<uses-permission android:name="android.permission.VIBRATE" />
```

**Кнопка «назад».** По умолчанию Android-WebView закрывает приложение. Если нужен «первый back — в меню, второй — выход», добавь плагин `tauri-plugin-android-background` или небольшой Kotlin-хендлер в `MainActivity.onBackPressed()` — заготовка описана в разделе «Что стоит доработать».

## 5. iOS

```bash
cd tauri
rustup target add aarch64-apple-ios aarch64-apple-ios-sim x86_64-apple-ios
npm run ios:init              # создаёт src-tauri/gen/apple (один раз)
npm run ios:dev               # симулятор
npm run ios:build             # архив для App Store Connect
```

Без Mac собрать `.ipa` нельзя. Публикация: Apple Developer Program ($99/год), затем Xcode → Archive → App Store Connect.
Важно: Apple отклоняет «просто обёртку сайта» (Guideline 4.2) — здесь спасает полноценный офлайн-геймплей и нативные фичи (см. ниже).

**Звук в беззвучном режиме iOS.** По умолчанию WKWebView глушит Web Audio при включённом «переключателе звонка». Чтобы игра играла музыку всегда, в iOS-проекте (`src-tauri/gen/apple/…/AppDelegate.swift` или `Info.plist`) добавь:

```swift
import AVFoundation

try? AVAudioSession.sharedInstance().setCategory(.playback, mode: .default, options: [.mixWithOthers])
try? AVAudioSession.sharedInstance().setActive(true)
```

## 6. Проверка сборки

```bash
cd tauri && npx tauri info      # версии Rust, WebView, Android/iOS тулчейнов
```

Полезно знать:

- Windows: WebView2 уже есть в Win10/11; для старых систем в конфиге включён `downloadBootstrapper`.
- Linux: при артефактах отрисовки помогает `WEBKIT_DISABLE_COMPOSITING_MODE=1 ./squirrel-beating-game`.
- macOS: для публикации вне Mac App Store нужна нотаризация (`APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID` в env при `tauri build`).

## 7. Автоматическая сборка (CI)

`ci/tauri-build.yml` — готовый GitHub Actions workflow: собирает Windows `.msi/.exe`, macOS `.dmg`, Linux `.deb/.AppImage`, Android `.apk/.aab` и прикладывает артефакты к релизу при пуше тега `v*`.

```bash
mkdir -p ../.github/workflows
cp ci/tauri-build.yml ../.github/workflows/tauri-build.yml
```

Для подписанных Android-сборок добавь секреты репозитория: `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`.

## 8. Что стоит доработать (по желанию)

1. **Автообновления десктопа** — плагин `tauri-plugin-updater` + `latest.json` в релизе GitHub.
2. **Покупки/реклама** — плагины биллинга (Google Play Billing / StoreKit).
3. **Достижения и лидерборды** — Google Play Games Services / Game Center.
4. **Геймпад** — Gamepad API уже доступен в WebView, достаточно маппинга кнопок на удары.
5. **Скриншоты для сторов** — по 5–8 кадров 1080×1920 (портрет) и 1920×1080 (ландшафт).

## 9. Частые проблемы

| Симптом | Причина / лечение |
| --- | --- |
| Белое окно | Не собран `tauri/web`: запусти `npm run web:prepare` или проверь `beforeBuildCommand`. |
| `Error: Asset not found: index.html` | `frontendDist` указывает не туда — должен быть `../web`. |
| Сборка падает на `webkit2gtk` | Установи `libwebkit2gtk-4.1-dev` (Ubuntu 22.04+). |
| Android: `NDK not found` | Задай `NDK_HOME` и `ANDROID_HOME`, перезапусти терминал. |
| Android: `java version` error | Нужен именно JDK 17 (не 21+ и не 8). |
| iOS: пусто вместо звука | Проверь AVAudioSession (п. 5). |
| Прогресс не сохраняется в приложении | Проверь, что `src-tauri/src/lib.rs` собирается и в настройках игры отображается версия приложения (значит `window.__TAURI__` доступен). |
| macOS: «приложение повреждено» | Не нотаризовано — для локального запуска `xattr -cr /Applications/Squirrel\ Beating\ Game.app`. |
