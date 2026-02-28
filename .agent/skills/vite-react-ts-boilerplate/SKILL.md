---
description: Vite + React + TypeScript + Docker プロジェクトのボイラープレートを作成する
---

# Vite React TypeScript ボイラープレート作成 Skill

新しいプロジェクトのボイラープレートを作成します。

## 技術スタック

- **ビルドツール**: Vite 6
- **フレームワーク**: React 19 + TypeScript
- **テスト**: Vitest + @testing-library/react
- **実行環境**: Docker (node:lts)
- **Linter**: ESLint (typescript-eslint)

## 手順

### Step 1: プロジェクト情報の確認

以下の情報をユーザーに確認（または会話から読み取る）:
- `PROJECT_NAME`: プロジェクト名（例: `stock-point-aggregator`）
- `PROJECT_TITLE`: HTMLのタイトルタグに使う日本語名（例: `銘柄ポイント集計ツール`）
- `PROJECT_DESC`: metaタグのdescription（例: `複数人の推薦銘柄を集計してランキングを自動生成するツール`）
- `VITE_BASE`: Viteのbaseパス（例: `/stock-point-aggregator/`）

### Step 2: 全ファイルの作成

以下のファイルを `/<PROJECT_ROOT>/` 直下に作成する。ファイルパスは全てWORKSPACEルートからの絶対パスで指定すること。

#### `package.json`
```json
{
  "name": "<PROJECT_NAME>",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "lucide-react": "^0.475.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.21.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.2.0",
    "@testing-library/user-event": "^14.6.1",
    "@types/react": "^19.0.10",
    "@types/react-dom": "^19.0.4",
    "@vitejs/plugin-react": "^4.3.4",
    "eslint": "^9.21.0",
    "eslint-plugin-react-hooks": "^5.1.0",
    "eslint-plugin-react-refresh": "^0.4.19",
    "globals": "^15.15.0",
    "jsdom": "^26.0.0",
    "typescript": "~5.7.2",
    "typescript-eslint": "^8.24.1",
    "vite": "^6.2.0",
    "vitest": "^3.0.0"
  }
}
```

#### `vite.config.ts`
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '<VITE_BASE>',
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

#### `tsconfig.json`
```json
{
    "compilerOptions": {
        "target": "ES2020",
        "useDefineForClassFields": true,
        "lib": ["ES2020", "DOM", "DOM.Iterable"],
        "module": "ESNext",
        "skipLibCheck": true,
        "moduleResolution": "bundler",
        "allowImportingTsExtensions": true,
        "resolveJsonModule": true,
        "isolatedModules": true,
        "noEmit": true,
        "jsx": "react-jsx",
        "strict": true,
        "noUnusedLocals": true,
        "noUnusedParameters": true,
        "noFallthroughCasesInSwitch": true
    },
    "include": ["src"],
    "references": [{ "path": "./tsconfig.node.json" }]
}
```

#### `tsconfig.node.json`
```json
{
    "compilerOptions": {
        "composite": true,
        "skipLibCheck": true,
        "module": "ESNext",
        "moduleResolution": "bundler",
        "allowSyntheticDefaultImports": true
    },
    "include": ["vite.config.ts"]
}
```

#### `eslint.config.js`
```js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
)
```

#### `.gitignore`
```
# Logs
logs
*.log
npm-debug.log*

# Node modules
node_modules/

# Production build output
dist/
dist-ssr/
build/

# Local environment variables
.env
.env.local
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.swp

# Testing
coverage/

# AI Assistant artifacts
.gemini/
```

#### `index.html`
```html
<!doctype html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="/vite.svg" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title><PROJECT_TITLE></title>
  <meta name="description" content="<PROJECT_DESC>" />
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

#### `src/main.tsx`
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

#### `src/index.css`
空ファイルで作成する（プロジェクト固有のスタイルは後から追加）:
```css
/* プロジェクト固有のスタイルをここに追加 */
```

#### `src/App.tsx`
ユーザーの要件に基づいたアプリケーション本体を実装する。
最低限の動作確認用プレースホルダーとして以下を使用:
```tsx
export default function App() {
  return (
    <div>
      <h1><PROJECT_TITLE></h1>
    </div>
  );
}
```

### Step 3: npm install を Docker で実行

// turbo
```bash
docker run --rm -v $PWD:/app -w /app node:lts npm install
```

プロジェクトのディレクトリ（`/<PROJECT_ROOT>/`）で実行すること。

### Step 4: ビルド確認を Docker で実行

// turbo
```bash
docker run --rm -v $PWD:/app -w /app node:lts npm run build
```

エラーがないことを確認する。エラーがあれば修正してから再実行する。

### Step 4.5: テストセットアップとサンプルテストの作成

以下の2ファイルを作成する。

#### `src/test/setup.ts`
```ts
import '@testing-library/jest-dom';
```

#### `src/test/App.test.tsx`
アプリの要件に応じた最低限のテストを作成する。
プレースホルダーとして以下を使用:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(document.body).toBeTruthy();
  });
});
```

テストを実行して通過することを確認する:

// turbo
```bash
docker run --rm -v $PWD:/app -w /app node:lts npm test
```

### Step 5: dev サーバーの起動

以下のコマンドでdev サーバーを起動する（バックグラウンドで実行）:
```bash
docker run --rm -v $PWD:/app -w /app -p 5173:5173 node:lts npm run dev
```

起動後、`http://localhost:5173/<PROJECT_NAME>/` にアクセスして動作確認する。

### Step 6: GitHub Actions ワークフローの作成

`.github/workflows/deploy.yml` を作成する。
`main` ブランチへの push 時に「テスト → ビルド → GitHub Pages デプロイ」を自動実行する。

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  test-and-build:
    name: Test & Build
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: lts/*
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    name: Deploy
    needs: test-and-build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

> **注意**: GitHub リポジトリの Settings → Pages → Source を **"GitHub Actions"** に設定すること。

デプロイ後のURL: `https://<GitHubユーザー名>.github.io/<PROJECT_NAME>/`

## 注意事項

- 全てのファイルはプロジェクトルートの絶対パスで作成すること
- `src/App.tsx` はプレースホルダーのままにし、実際のロジックは別タスクで実装すること
- Docker が利用可能な環境であること（`docker --version` で確認）
- `node_modules/` はコンテナ内にキャッシュされないため、プロジェクトルートに生成される
- GitHub Pages デプロイには `vite.config.ts` の `base` が `/<PROJECT_NAME>/` と一致している必要がある
