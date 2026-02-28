# 銘柄ポイント集計ツール

複数の推薦銘柄データを集計し、ポイントランキングを自動生成するWebツールです。

## 機能

### 集計
指定フォーマットのテキストを入力すると、銘柄ごとにポイントを集計してランキング表示します。

| 区分 | ポイント |
|------|----------|
| 候補銘柄 | 1pt |
| 1位 | 7pt |
| 2位 | 5pt |
| 3位 | 3pt |

### プロンプト
分析用プロンプトを表示します。次の月曜日の日付が自動的に埋め込まれます。

## 入力フォーマット

```
# 候補銘柄
- 銘柄A
- 銘柄B

# ベスト3
- 1位：銘柄A
- 2位：銘柄C
- 3位：銘柄B
```

## 技術スタック

- Vite + React + TypeScript
- Bootstrap 5.3
- Vitest + Testing Library

## 開発

```bash
# 依存インストール
docker run --rm -v $PWD:/app -w /app node:lts npm install

# 開発サーバー起動
docker run --rm -v $PWD:/app -w /app -p 5173:5173 node:lts npm run dev

# テスト
docker run --rm -v $PWD:/app -w /app node:lts npm test

# ビルド
docker run --rm -v $PWD:/app -w /app node:lts npm run build
```

## デプロイ

`main` ブランチへの push で GitHub Actions 経由で GitHub Pages に自動デプロイされます。
