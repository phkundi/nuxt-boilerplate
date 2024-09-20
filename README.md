# Nuxt Boilerplate

Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install the dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Local SSL

In some cases, you need to run the local server on a SSL connection. Here's how you can set it up:

**a. Install mkcert:**

- On macOS with Homebrew: `brew install mkcert`
- On Windows with Chocolatey: `choco install mkcert`
- On Linux, follow the instructions in the mkcert GitHub repository.

**b. Install the local CA in the system trust store:**

```bash
mkcert -install
```

**c. Create a certificate for localhost:**

```bash
mkcert localhost
```

**d. Place .pem files in project directory:**

Make sure that both .pem files are placed in the root folder of this project, at the same level as `nuxt.config.ts`

**e. Run server:**

Run the following command in your console to run the https development server on `https://localhost:3000`:

```bash
# npm
npm run dev:https

# pnpm
pnpm run dev:https

# yarn
yarn dev:https

# bun
bun run dev:https
```

## Development Server without https

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm run dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm run build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm run preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
