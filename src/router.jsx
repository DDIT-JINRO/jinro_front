import { createBrowserRouter } from "react-router-dom";
// import WorldcupPage from "./pages/WorldcupPage";
// import ResultPage from "./pages/ResultPage";
import RoadMap from "./pages/roadMapPage";

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
]);

export default router;
