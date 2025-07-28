import { createBrowserRouter } from "react-router-dom";
import WorldcupPage from "./pages/WorldcupPage";
import ResultPage from "./pages/ResultPage";
import RoadMap from "./pages/roadMapPage";
import ResultPage from "./pages/ResultPage";
import RoadmapResultPage from "./pages/roadmapResultPage";
import RoadmapErrorPage from "./pages/roadmapErrorPage";

const router = createBrowserRouter([
    {
        path: "/worldcup/tournament",
        element: <Tournament />,
    },
    {
        path: "/worldcup",
        element: <WorldcupPage />,
    },
    {
        path: "/worldcup/result",
        element: <ResultPage />,
    },
    {
        path: "/roadmap",
        element: <RoadmapPage />,
    },
    {
        path: "/roadmap/results",
        element: <RoadmapResultPage />,
    },
    {
        path: "/roadmap/error",
        element: <RoadmapErrorPage />,
    },
]);

export default router;
