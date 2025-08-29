import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCategories, selectJobsByCategory } from "../../api/worldcup/worldcupApi";
import { useModal } from "../../context/ModalContext.jsx";
import '../../css/worldcup/CategorySelector.css';

export default function CategorySelector() {
    const [categories, setCategories] = useState([]);
    const [selected, setSelected] = useState("");
    const [round, setRound] = useState(32);
    const navigate = useNavigate();
    const { showAlert } = useModal();

    useEffect(() => {
        getCategories(round)
            .then((data) => {
                setCategories(data);
            })
            .catch((err) => console.error("카테고리 로드 실패:", err));
    }, [round]);

    const handleSubmit = () => {
        if (!selected) {
            showAlert(
                "카테고리를 선택하세요.",
                "유형을 선택하지 않으면 다음 단계로 넘어갈 수 없습니다.", // 메시지2 추가
                () => {} // 확인 버튼 클릭 시 실행할 동작 (없으면 빈 함수)
            );
            return;
        }

        selectJobsByCategory(selected)
            .then((data) => {
                const shuffled = data.jobsVOList.sort(() => Math.random() - 0.5);
                const trimmed = shuffled.slice(0, round);
                const comCode = data.comCodeVO;
                navigate("/worldcup/tournament", {
                    state: {
                        jobs: trimmed,
                        categoryId: selected,
                        round: round,
                        comCode : comCode
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
                        <div className="category-modal__image" >
                        </div>
                    </div>
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
