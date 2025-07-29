/**
 * 튜토리얼 모달을 여는 버튼 컴포넌트
 * @param {function} onClick - 버튼 클릭 시 호출될 함수
 */
function TutorialBtn({ onClick }) {
  return (
    <button
      className="tutorial-icon-btn"
      onClick={onClick}
    >
      <i className="fa-solid fa-question"></i>
    </button>
  );
}

export default TutorialBtn;
