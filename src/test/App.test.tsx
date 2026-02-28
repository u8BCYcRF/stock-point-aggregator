import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App', () => {
    beforeEach(() => {
        render(<App />);
    });

    // --- タブ切り替え ---
    describe('タブ切り替え', () => {
        it('初期表示は「集計」タブ', () => {
            expect(screen.getByRole('heading', { name: '集計結果ランキング' })).toBeInTheDocument();
        });

        it('「プロンプト」タブをクリックするとプロンプト画面に切り替わる', () => {
            fireEvent.click(screen.getByRole('button', { name: /プロンプト/ }));
            expect(screen.getByRole('heading', { name: '分析プロンプト' })).toBeInTheDocument();
        });

        it('「集計」タブに戻ると集計画面が再表示される', () => {
            fireEvent.click(screen.getByRole('button', { name: /プロンプト/ }));
            fireEvent.click(screen.getByRole('button', { name: /集計/ }));
            expect(screen.getByRole('heading', { name: '集計結果ランキング' })).toBeInTheDocument();
        });
    });

    // --- 集計ロジック ---
    describe('集計ロジック', () => {
        const enterText = (text: string, index = 0) => {
            const textareas = screen.getAllByRole('textbox');
            fireEvent.change(textareas[index], { target: { value: text } });
        };

        const clickCalculate = () => {
            fireEvent.click(screen.getByRole('button', { name: /集計を実行する/ }));
        };

        it('候補銘柄は1ptが加算される', () => {
            enterText('# 候補銘柄\n- 三菱UFJ');
            clickCalculate();
            expect(screen.getByText('三菱UFJ')).toBeInTheDocument();
            // 合計ptのセルに1が表示される
            const rows = screen.getAllByRole('row');
            expect(rows[1]).toHaveTextContent('1');
        });

        it('1位は7pt、2位は5pt、3位は3ptが加算される', () => {
            enterText('# ベスト3\n- 1位：銘柄A\n- 2位：銘柄B\n- 3位：銘柄C');
            clickCalculate();
            // 銘柄Aが7pt（1位）
            const rowA = screen.getByText('銘柄A').closest('tr')!;
            expect(rowA).toHaveTextContent('7');
            // 銘柄Bが5pt（2位）
            const rowB = screen.getByText('銘柄B').closest('tr')!;
            expect(rowB).toHaveTextContent('5');
            // 銘柄Cが3pt（3位）
            const rowC = screen.getByText('銘柄C').closest('tr')!;
            expect(rowC).toHaveTextContent('3');
        });

        it('候補銘柄とベスト3の両方に登場した場合はポイントが合算される', () => {
            enterText('# 候補銘柄\n- 三菱UFJ\n\n# ベスト3\n- 1位：三菱UFJ');
            clickCalculate();
            // 1pt（候補）+ 7pt（1位）= 8pt
            const row = screen.getByText('三菱UFJ').closest('tr')!;
            expect(row).toHaveTextContent('8');
        });

        it('ポイントの高い順に並ぶ', () => {
            enterText('# ベスト3\n- 1位：銘柄A\n- 2位：銘柄B\n- 3位：銘柄C');
            clickCalculate();
            const rows = screen.getAllByRole('row');
            // ヘッダー行を除いた最初のデータ行が1位（銘柄A）
            expect(rows[1]).toHaveTextContent('銘柄A');
        });

        it('全角順位（１位）も正しく処理される', () => {
            enterText('# ベスト3\n- １位：全角テスト');
            clickCalculate();
            const row = screen.getByText('全角テスト').closest('tr')!;
            expect(row).toHaveTextContent('7');
        });

        it('全角コロン（：）も正しく処理される', () => {
            enterText('# ベスト3\n- 1位：全角コロン');
            clickCalculate();
            const row = screen.getByText('全角コロン').closest('tr')!;
            expect(row).toHaveTextContent('7');
        });

        it('複数の入力欄を追加できる', () => {
            fireEvent.click(screen.getByRole('button', { name: /入力欄を追加/ }));
            expect(screen.getByText('入力データ 2')).toBeInTheDocument();
        });

        it('入力欄を削除できる', () => {
            fireEvent.click(screen.getByRole('button', { name: /入力欄を追加/ }));
            const deleteButtons = screen.getAllByRole('button', { name: /削除/ });
            fireEvent.click(deleteButtons[0]);
            expect(screen.queryByText('入力データ 2')).not.toBeInTheDocument();
        });
    });

    // --- プロンプトタブ ---
    describe('プロンプトタブ', () => {
        beforeEach(() => {
            fireEvent.click(screen.getByRole('button', { name: /プロンプト/ }));
        });

        it('プロンプト本文が表示される', () => {
            expect(screen.getByText(/日本株の短期モメンタム/)).toBeInTheDocument();
        });

        it('日付プレースホルダーが実際の日付に置換されている', () => {
            // {DATE} が残っていないことを確認
            expect(screen.queryByText(/\{DATE\}/)).not.toBeInTheDocument();
        });

        it('日付に「からの週」が含まれている', () => {
            expect(screen.getByText(/からの週/)).toBeInTheDocument();
        });

        it('コピーボタンが表示される', () => {
            expect(screen.getByRole('button', { name: /コピー/ })).toBeInTheDocument();
        });
    });
});
