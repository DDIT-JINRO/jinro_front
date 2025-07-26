import { createBrowserRouter } from "react-router-dom";
import AptiTestPage from "./pages/aptitestPage";
// import WorldcupPage from "./pages/WorldcupPage";
// import ResultPage from "./pages/ResultPage";

const router = createBrowserRouter([
    // {
    //     path: "/worldcup",
    //     element: <WorldcupPage />,
    // },
    // {
    //     path: "/worldcup/result",
    //     element: <ResultPage />,
    // },
    {
        path: "/aptiTest/:qno",
        element: <AptiTestPage />
    }
]);

export default router;
