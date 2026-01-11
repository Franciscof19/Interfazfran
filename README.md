This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Interfazfran

Proyecto Themis

Este proyecto integra frontend (React/Next.js), backend (Node/Express opcional) y PostgREST conectado a PostgreSQL.

🚀 Arranque rápido

1. Requisitos previos

Node.js y npm instalados

PostgreSQL corriendo en el puerto 5434 con la base de datos themis

PostgREST descargado en la carpeta postgrestREST

2. Instalación de dependencias

npm install

3. Arrancar todo junto

npm run start:all

Esto levanta:

Frontend React/Next.js en http://localhost:3000

Backend Node/Express (si existe en carpeta server)

PostgREST en http://localhost:3001 (o el puerto configurado en postgrest.conf)

4. Verificar API

Abre en el navegador:

http://localhost:3001/users

Deberías ver los registros de la tabla users.

⚙️ Configuración de PostgREST

Archivo postgrest.conf:

db-uri = "postgres://postgres:1234@localhost:5434/themis"
db-schema = "public"
db-anon-role = "web_anon"
server-port = 3001

Crear rol web_anon

Dentro de psql:

CREATE ROLE web_anon NOLOGIN;
GRANT USAGE ON SCHEMA public TO web_anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO web_anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO web_anon;

📂 Estructura del proyecto

/themis-root
  ├── client/        # Frontend React/Next.js
  ├── server/        # Backend Node/Express (opcional)
  ├── postgrestREST/ # Binario y config de PostgREST
  ├── package.json   # Scripts para arrancar todo
  └── README.md      # Documentación del proyecto

🧪 Ejemplo de tabla users

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  last_login TIMESTAMP
);

INSERT INTO users (username, password, role)
VALUES ('oriana', '$2b$10$Qw8758nqnTIlDK1Ax7A2e.eiaC71zs8JPrsx4.4h4iEWv1/fp1bTG', 'admin');

🎯 Flujo de trabajo

Arranca PostgreSQL con Homebrew (brew services start postgresql@14).

Arranca PostgREST con npm run start:all.

Abre el frontend en http://localhost:3000.

El frontend consume datos desde http://localhost:3001.

¡Listo! Con esto puedes levantar todo tu proyecto Themis en un solo comando.