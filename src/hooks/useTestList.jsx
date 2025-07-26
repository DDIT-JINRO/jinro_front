import { valueMap } from "../data/AptitestData";

export const useTestList = () => {
    const getValue = (qno, ageGroup) => {
        return valueMap[qno]?.[ageGroup] ?? null;
    }

    return {
        getValue: getValue,
    }

}
