# Социальная сеть

<img width="1904" height="1080" alt="Скриншот 06-05-2026 175805" src="https://github.com/user-attachments/assets/8a1b01b1-7f3e-4118-9a53-9319f65f5f1c" />
<br>

Полнофункциональная социальная сеть в стиле Twitter/X. Пользователи могут публиковать посты с изображениями, лайкать, комментировать, репостить, подписываться друг на друга и получать уведомления.

---

## Технологии

### Frontend
| Технология | Назначение |
|---|---|
| React 19 + TypeScript | UI-фреймворк |
| Redux Toolkit + RTK Query | Управление состоянием и API-запросы |
| React Router v7 | Клиентская маршрутизация |
| Vite | Сборщик и dev-сервер |
| Tailwind CSS v4 | Стилизация |
| HeroUI | Библиотека компонентов |
| Framer Motion | Анимации и жесты (zoom/pan в просмотрщике) |
| React Hook Form | Управление формами |

### Backend
| Технология | Назначение |
|---|---|
| Node.js 20 + Express.js | HTTP-сервер и API |
| Prisma ORM | Работа с базой данных |
| MongoDB | База данных (replica set) |
| JSON Web Tokens (JWT) | Аутентификация |
| Multer | Загрузка файлов (аватары, фото постов) |
| bcryptjs | Хэширование паролей |

### Инфраструктура
| Технология | Назначение |
|---|---|
| Docker + Docker Compose | Контейнеризация всех сервисов |
| Nginx | Раздача собранного фронтенда в Docker |

---

## Возможности

- **Аутентификация** — регистрация и вход по email/паролю, JWT-токены
- **Посты** — создание текстовых постов с прикреплением до 5 фотографий (через кнопку или вставкой из буфера Ctrl+V), лайки, комментарии, репосты, удаление
- **Просмотр фото** — полноэкранный просмотрщик с зумом колёсиком мыши и кнопками, перетаскиванием при увеличении, навигацией стрелками и закрытием по Escape
- **Приватность** — посты могут быть публичными, только для подписчиков или приватными
- **Хэштеги и упоминания** — автоматическое распознавание `#тег` и `@пользователь` в тексте
- **Подписки** — подписка/отписка на других пользователей, страницы подписчиков и подписок
- **Профиль** — аватар, имя, биография, местоположение, дата рождения
- **Закладки** — сохранение постов
- **Поиск** — поиск по пользователям, постам и хэштегам
- **Уведомления** — лайки, комментарии, репосты, упоминания, подписки

---

## Структура проекта

```
/
├── Express-api/          # Backend (Node.js + Express)
│   ├── controllers/      # Логика обработки запросов
│   ├── middleware/        # JWT-аутентификация
│   ├── prisma/           # Схема базы данных и клиент Prisma
│   ├── routes/           # Маршруты API
│   ├── uploads/          # Загруженные файлы (создаётся автоматически)
│   ├── app.js
│   ├── Dockerfile
│   └── docker-compose.yml
│
└── React-client/         # Frontend (React + TypeScript)
    ├── src/
    │   ├── app/          # RTK Query сервисы, store, типы
    │   ├── components/   # Переиспользуемые компоненты
    │   ├── features/     # Redux-слайсы
    │   ├── pages/        # Страницы приложения
    │   └── utils/
    ├── Dockerfile
    └── nginx.conf
```

---

## Запуск проекта

### Способ 1: Docker Compose (рекомендуется)

Самый простой способ — всё запускается одной командой.

**Требования:** [Docker Desktop](https://www.docker.com/products/docker-desktop/)

```bash
cd Express-api
docker-compose up --build
```

После запуска:

| Сервис | Адрес |
|---|---|
| Фронтенд | http://localhost:80 |
| API | http://localhost:3000 |
| MongoDB | localhost:27017 |

Остановка:
```bash
docker-compose down
```

---

### Способ 2: Локально без Docker

**Требования:**
- Node.js 20+
- MongoDB с replica set (см. ниже)

#### Шаг 1. Запустить MongoDB

Проще всего запустить MongoDB в Docker отдельно:

```bash
docker run -d \
  --name mongo \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=monty \
  -e MONGO_INITDB_ROOT_PASSWORD=pass \
  prismagraphql/mongo-single-replica:5.0.3
```

> Prisma требует MongoDB в режиме replica set — обычный `mongo` образ без репликации не подойдёт.

Альтернатива — бесплатный кластер в [MongoDB Atlas](https://www.mongodb.com/atlas).

#### Шаг 2. Настроить переменные окружения

Создать файл `Express-api/.env`:

```env
DATABASE_URL="mongodb://monty:pass@localhost:27017/mydatabase?authSource=admin&directConnection=true"
SECRET_KEY="замените_на_случайную_строку"
```

#### Шаг 3. Запустить backend

```bash
cd Express-api
npm install
npx prisma generate
npm run dev
```

API будет доступен по адресу: http://localhost:3000

#### Шаг 4. Запустить frontend (в новом терминале)

```bash
cd React-client
npm install
npm run dev
```

Фронтенд будет доступен по адресу: http://localhost:5173

---

## API

Все маршруты (кроме `/register` и `/login`) требуют заголовок:

```
Authorization: Bearer <JWT-токен>
```

| Метод | Маршрут | Описание |
|---|---|---|
| POST | `/api/register` | Регистрация |
| POST | `/api/login` | Вход |
| GET | `/api/current` | Текущий пользователь |
| GET | `/api/users/:id` | Профиль пользователя |
| PUT | `/api/users/:id` | Обновление профиля |
| GET | `/api/posts` | Лента постов |
| POST | `/api/posts` | Создать пост (multipart/form-data) |
| GET | `/api/posts/:id` | Пост по ID |
| DELETE | `/api/posts/:id` | Удалить пост |
| POST | `/api/likes` | Лайкнуть пост |
| DELETE | `/api/likes/:id` | Убрать лайк |
| POST | `/api/comments` | Добавить комментарий |
| DELETE | `/api/comments/:id` | Удалить комментарий |
| POST | `/api/follow` | Подписаться |
| DELETE | `/api/unfollow/:id` | Отписаться |
| POST | `/api/bookmarks` | Добавить в закладки |
| DELETE | `/api/bookmarks/:id` | Убрать из закладок |
| GET | `/api/search/users` | Поиск пользователей |
| GET | `/api/search/posts` | Поиск постов |
| GET | `/api/notifications` | Уведомления |
