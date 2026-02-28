import { useState, useCallback, useMemo } from 'react';
import { Calculator, Trophy, List, Info, Plus, Trash2, ChevronRight, TrendingUp, FileText, Copy, Check } from 'lucide-react';
import { PROMPT_TEMPLATE } from './data/prompt';

interface ScoreItem {
    name: string;
    total: number;
    candidate: number;
    rank1: number;
    rank2: number;
    rank3: number;
    displayRank: number;
}

type Tab = '集計' | 'プロンプト';

/** 次の月曜日の日付を「YYYY年MM月DD日」形式で返す */
function getNextMondayLabel(): string {
    const today = new Date();
    const day = today.getDay();
    const daysUntilMonday = day === 0 ? 1 : day === 1 ? 7 : 8 - day;
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilMonday);
    const y = nextMonday.getFullYear();
    const m = nextMonday.getMonth() + 1;
    const d = nextMonday.getDate();
    return `${y}年${m}月${d}日`;
}

export default function App() {
    const [activeTab, setActiveTab] = useState<Tab>('集計');
    const [inputTexts, setInputTexts] = useState<string[]>(['']);
    const [results, setResults] = useState<ScoreItem[]>([]);
    const [copied, setCopied] = useState(false);

    const promptText = useMemo(
        () => PROMPT_TEMPLATE.replace('{DATE}', getNextMondayLabel()),
        []
    );

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(promptText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // clipboard API が利用できない環境
        }
    };

    const handleAddInput = () => {
        setInputTexts([...inputTexts, '']);
    };

    const handleRemoveInput = (index: number) => {
        const newInputs = inputTexts.filter((_, i) => i !== index);
        setInputTexts(newInputs.length > 0 ? newInputs : ['']);
    };

    const handleTextChange = (index: number, value: string) => {
        const newInputs = [...inputTexts];
        newInputs[index] = value;
        setInputTexts(newInputs);
    };

    const handleCalculate = useCallback(() => {
        const lines = inputTexts.join('\n').split('\n');
        let currentSection = '';
        const scores: Record<string, ScoreItem> = {};

        lines.forEach((rawLine) => {
            const line = rawLine.trim();
            if (!line) return;

            const sectionMatch = line.match(/^#\s+(.*)/);
            if (sectionMatch) {
                currentSection = sectionMatch[1].trim();
                return;
            }

            const listMatch = line.match(/^-\s+(.*)/);
            if (listMatch) {
                const content = listMatch[1].trim();

                if (currentSection.includes('候補銘柄')) {
                    if (!scores[content]) {
                        scores[content] = { name: content, total: 0, candidate: 0, rank1: 0, rank2: 0, rank3: 0, displayRank: 0 };
                    }
                    scores[content].candidate += 1;
                    scores[content].total += 1;
                } else if (currentSection.includes('ベスト3')) {
                    const rankMatch = content.match(/^([1-3１-３])位[：:]\s*(.*)/);
                    if (rankMatch) {
                        const rankStr = rankMatch[1].replace(/[１-３]/g, (s) =>
                            String.fromCharCode(s.charCodeAt(0) - 0xfee0)
                        );
                        const rank = parseInt(rankStr, 10);
                        const name = rankMatch[2].trim();

                        if (!scores[name]) {
                            scores[name] = { name, total: 0, candidate: 0, rank1: 0, rank2: 0, rank3: 0, displayRank: 0 };
                        }

                        if (rank === 1) { scores[name].rank1 += 7; scores[name].total += 7; }
                        else if (rank === 2) { scores[name].rank2 += 5; scores[name].total += 5; }
                        else if (rank === 3) { scores[name].rank3 += 3; scores[name].total += 3; }
                    }
                }
            }
        });

        const sortedResults = Object.values(scores).sort((a, b) => b.total - a.total);
        let currentRank = 1;
        sortedResults.forEach((result, index) => {
            if (index > 0 && result.total < sortedResults[index - 1].total) {
                currentRank = index + 1;
            }
            result.displayRank = currentRank;
        });

        setResults(sortedResults);
    }, [inputTexts]);

    const renderRankBadge = (rank: number) => {
        if (rank === 1) {
            return <span className="badge rounded-circle text-dark border border-warning" style={{ backgroundColor: '#ffecb3', width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{rank}</span>;
        }
        if (rank === 2) {
            return <span className="badge rounded-circle bg-secondary" style={{ width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{rank}</span>;
        }
        if (rank === 3) {
            return <span className="badge rounded-circle text-white" style={{ backgroundColor: '#fd7e14', width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{rank}</span>;
        }
        return <span className="fw-bold text-secondary">{rank}</span>;
    };

    const hasResults = results.length > 0 && results[0].total > 0;

    return (
        <div className="bg-light min-vh-100 pb-5">
            {/* ナビバー */}
            <nav className="navbar navbar-dark bg-primary shadow-sm">
                <div className="container py-1">
                    <span className="navbar-brand mb-0 h1 d-flex align-items-center gap-2 m-0">
                        <TrendingUp size={26} />
                        <span className="fw-bold">銘柄ポイント集計ツール</span>
                    </span>
                </div>
            </nav>

            {/* タブ */}
            <div className="bg-white border-bottom shadow-sm">
                <div className="container">
                    <ul className="nav nav-tabs border-0">
                        {(['集計', 'プロンプト'] as Tab[]).map((tab) => (
                            <li className="nav-item" key={tab}>
                                <button
                                    onClick={() => setActiveTab(tab)}
                                    className={`nav-link d-flex align-items-center gap-2 fw-semibold ${activeTab === tab ? 'active' : ''}`}
                                >
                                    {tab === '集計' ? <Calculator size={16} /> : <FileText size={16} />}
                                    {tab}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="container mt-4">

                {/* ====== 集計タブ ====== */}
                {activeTab === '集計' && (
                    <>
                        {/* 集計結果カード */}
                        <div className="card shadow-sm border-0 mb-4 rounded-3 overflow-hidden">
                            <div className="card-header bg-white py-3 d-flex align-items-center gap-2 border-bottom">
                                <Trophy size={20} className="text-warning" />
                                <h2 className="mb-0 h5 fw-bold text-dark">集計結果ランキング</h2>
                            </div>

                            <div className="card-body p-0">
                                {hasResults ? (
                                    <div className="table-responsive" style={{ maxHeight: 500 }}>
                                        <table className="table table-hover mb-0 align-middle">
                                            <thead className="table-light sticky-top shadow-sm" style={{ zIndex: 1 }}>
                                                <tr>
                                                    <th className="text-center text-secondary py-3 small" style={{ width: 80 }}>順位</th>
                                                    <th className="text-secondary py-3 small">銘柄名</th>
                                                    <th className="text-center text-primary py-3 small fw-bold">合計pt</th>
                                                    <th className="text-center text-secondary py-3 small">候補<br />(1pt)</th>
                                                    <th className="text-center text-secondary py-3 small">1位<br />(7pt)</th>
                                                    <th className="text-center text-secondary py-3 small">2位<br />(5pt)</th>
                                                    <th className="text-center text-secondary py-3 small">3位<br />(3pt)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {results.map((item, index) => (
                                                    <tr key={index}>
                                                        <td className="text-center py-2">
                                                            {renderRankBadge(item.displayRank)}
                                                        </td>
                                                        <td className="fw-medium text-dark">{item.name}</td>
                                                        <td className="text-center text-primary fw-bold fs-5" style={{ backgroundColor: 'rgba(13, 110, 253, 0.05)' }}>
                                                            {item.total}
                                                        </td>
                                                        <td className="text-center text-secondary">{item.candidate > 0 ? item.candidate : '—'}</td>
                                                        <td className="text-center text-secondary">{item.rank1 > 0 ? item.rank1 : '—'}</td>
                                                        <td className="text-center text-secondary">{item.rank2 > 0 ? item.rank2 : '—'}</td>
                                                        <td className="text-center text-secondary">{item.rank3 > 0 ? item.rank3 : '—'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-5 text-muted">
                                        <Trophy size={48} className="opacity-25 mb-3" />
                                        <h6 className="fw-bold">集計データがありません</h6>
                                        <p className="small mb-0">下部の入力欄にデータを入力し、「集計を実行する」ボタンを押してください。</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* データ入力カード */}
                        <div className="card shadow-sm border-0 rounded-3 overflow-hidden">
                            <div className="card-header bg-white py-3 d-flex align-items-center gap-2 border-bottom">
                                <List size={20} className="text-secondary" />
                                <h2 className="mb-0 h5 fw-bold text-dark">データ入力</h2>
                            </div>

                            <div className="card-body p-4">
                                <div className="alert alert-info d-flex gap-2 align-items-start border-0 bg-primary bg-opacity-10 text-primary-emphasis mb-4">
                                    <Info size={20} className="mt-1 flex-shrink-0" />
                                    <div className="small" style={{ lineHeight: '1.6' }}>
                                        指定のフォーマットのテキストを入力してください。<br />
                                        複数のデータをそのまま連続して貼り付けても、一括で合算集計されます。必要に応じて「入力欄を追加」して分けて入力することも可能です。
                                    </div>
                                </div>

                                <div className="d-flex flex-column gap-3">
                                    {inputTexts.map((text, index) => (
                                        <div key={index} className="p-3 bg-light border rounded">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <span className="fw-bold text-secondary small">入力データ {index + 1}</span>
                                                {inputTexts.length > 1 && (
                                                    <button
                                                        onClick={() => handleRemoveInput(index)}
                                                        className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 py-1 px-2 border-0"
                                                    >
                                                        <Trash2 size={16} />
                                                        <span className="small fw-bold">削除</span>
                                                    </button>
                                                )}
                                            </div>

                                            <textarea
                                                className="form-control"
                                                value={text}
                                                onChange={(e) => handleTextChange(index, e.target.value)}
                                                placeholder={'# 候補銘柄\r\n- 銘柄A\r\n\r\n# ベスト3\r\n- 1位：銘柄A'}
                                                style={{
                                                    height: 180,
                                                    resize: 'none',
                                                    fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                                                    fontSize: '0.875rem'
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="d-flex flex-column flex-md-row gap-3 mt-4">
                                    <button
                                        onClick={handleAddInput}
                                        className="btn btn-light border fw-bold d-flex align-items-center justify-content-center gap-2 py-2 flex-grow-1 text-secondary"
                                    >
                                        <Plus size={20} />
                                        入力欄を追加
                                    </button>

                                    <button
                                        onClick={handleCalculate}
                                        className="btn btn-primary fw-bold d-flex align-items-center justify-content-center gap-2 py-2"
                                        style={{ flex: 2 }}
                                    >
                                        集計を実行する
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ポイント凡例 */}
                        <div className="text-center mt-3">
                            <small className="text-muted">
                                <Calculator size={12} className="me-1" />候補銘柄: 1pt ｜ 1位: 7pt ｜ 2位: 5pt ｜ 3位: 3pt
                            </small>
                        </div>
                    </>
                )}

                {/* ====== プロンプトタブ ====== */}
                {activeTab === 'プロンプト' && (
                    <div className="card shadow-sm border-0 rounded-3 overflow-hidden">
                        <div className="card-header bg-white py-3 d-flex align-items-center justify-content-between border-bottom">
                            <div className="d-flex align-items-center gap-2">
                                <FileText size={20} className="text-secondary" />
                                <h2 className="mb-0 h5 fw-bold text-dark">分析プロンプト</h2>
                            </div>
                            <button
                                onClick={handleCopy}
                                className={`btn btn-sm d-flex align-items-center gap-1 fw-bold ${copied ? 'btn-success' : 'btn-outline-secondary'}`}
                            >
                                {copied ? <><Check size={14} />コピー済み</> : <><Copy size={14} />コピー</>}
                            </button>
                        </div>
                        <div className="card-body p-4">
                            <pre className="mb-0" style={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem', lineHeight: '1.7', fontFamily: 'inherit' }}>
                                {promptText}
                            </pre>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
