import { createBrowserRouter } from "react-router-dom";
import WorldcupPage from "./pages/WorldcupPage";
import ResultPage from "./pages/ResultPage";

const router = createBrowserRouter([
    {
        path: "/worldcup",
        element: <WorldcupPage />,
    },
    {
        path: "/worldcup/result",
        element: <ResultPage />,
    },
]);

export default router;
