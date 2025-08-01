import { valueMap } from "../../data/aptiTest/aptitestData.js";

export const useTestList = () => {
    const getValue = (qno, ageGroup) => {
        return valueMap[qno]?.[ageGroup] ?? null;
    }

    const getTitle = (qno) => {
        let title = "";
        if (qno == 1) {
            title = "직업 흥미 검사(K)";
        } else if (qno == 2) {
            title = "직업 흥미 검사(H)";
        } else if (qno == 3) {
            title = "직업 가치관 검사";
        } else if (qno == 4) {
            title = "직업 적성 검사";
        } else if (qno == 5) {
            title = "직업 가치관 검사";
        } else if (qno == 6) {
            title = "진로 개발 준비도 검사";
        } else if (qno == 7) {
            title = "이공계 전공 적합도 검사";
        } else {
            title = "주요 능력 효능감 검사";
        }

        return title;
    }

    return {
        getValue: getValue,
        getTitle: getTitle,
    }

}


