import { createBrowserRouter } from "react-router-dom";
// import WorldcupPage from "./pages/WorldcupPage";
// import ResultPage from "./pages/ResultPage";
import RoadMap from "./pages/roadMapPage";
import ResultPage from "./pages/ResultPage";

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
        path: "/roadmap",
        element: <RoadMap />,
    },
    {
        path: "/roadmap/results",
        element: <ResultPage />,
    },
]);

export default router;
