import axios from "axios";
const backUrl = import.meta.env.VITE_BACK_END_URL;

const prefix = `${backUrl}/worldcup`;

const api = axios.create({
    baseURL: `${prefix}`,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
});

export const getCategories = (round) =>
    api.get("/selectCategories", { params: { round } }).then((res) => res.data);

export const selectJobsByCategory = (ccId) =>
    api.post("/selectJobsByCategory", { ccId }).then((res) => res.data);

export const selectJobById = async (jobCode) => {
    return api.post("/selectJobById", { jobCode })  // ⬅ return 추가
        .then((res) => {
            return res.data; // ⬅ 여기서도 return 해야함
        })
        .catch((err) => {
            console.error("selectJobById 실패:", err);
            return null;
        });
};
;

export const insertWorldcupResult = async (jobCode) => {
    return api.post("/insertWorldcupResult", { jobCode })  // ⬅ return 추가
        .then((res) => {
            return res.data; // ⬅ 여기서도 return 해야함
        })
        .catch((err) => {
            console.error("insertWorldcupResult 실패:", err);
            return null;
        });
};