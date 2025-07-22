import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCategories, selectJobsByCategory } from "../api/worldcupApi";
import '../CategorySelector.css';

export default function CategorySelector() {
    const [categories, setCategories] = useState([]);
    const [selected, setSelected] = useState("");
    const [round, setRound] = useState(32);
    const navigate = useNavigate();

    useEffect(() => {
        getCategories(round)
            .then((data) => {
                console.log(data);
                setCategories(data);
            })
            .catch((err) => console.error("카테고리 로드 실패:", err));
    }, [round]);

    const handleSubmit = () => {
        if (!selected) {
            alert("카테고리를 선택하세요.");
            return;
        }

        selectJobsByCategory(selected)
            .then((data) => {
                const shuffled = data.sort(() => Math.random() - 0.5);
                const trimmed = shuffled.slice(0, round);
                navigate("/worldcup/tournament", {
                    state: {
                        jobs: trimmed,
                        categoryId: selected,
                        round: round,
                    },
                });
            })
            .catch((err) => console.error("직업 로드 실패:", err));
    };

    return (
        <div className="category-modal">
            <div className="category-modal__header">
                <div className="category-modal__title-area">
                    <div className="category-modal__title-row">
                        <div className="category-modal__icon" />
                        <div className="category-modal__image" />
                        <div className="category-modal__icon" />
                    </div>
                    <div className="category-modal__title">직업 월드컵</div>
                </div>
            </div>

            <div className="category-modal__filter-section">
                <div className="category-modal__filter-group">
                    <div className="category-modal__label">총 라운드를 선택하세요.</div>
                    <div className="category-modal__select-box">
                        <select value={round} onChange={(e) => setRound(Number(e.target.value))}>
                            <option value={32}>32강</option>
                            <option value={64}>64강</option>
                        </select>
                    </div>
                </div>

                <div className="category-modal__filter-group">
                    <div className="category-modal__label">직업 월드컵 유형을 선택하세요.</div>
                    <div className="category-modal__select-box">
                        <select value={selected} onChange={(e) => setSelected(e.target.value)}>
                            <option value="">-- 선택하세요 --</option>
                            {categories.map((cat) => (
                                <option key={cat.ccId} value={cat.ccId}>
                                    {cat.ccName}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="category-modal__buttons">
                <button className="category-modal__button category-modal__button--start" onClick={handleSubmit}>
                    시작하기
                </button>
            </div>
        </div>
    );
}
