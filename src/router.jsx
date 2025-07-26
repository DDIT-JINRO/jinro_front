import { createBrowserRouter } from "react-router-dom";
import WorldcupPage from "./pages/worldcup/WorldcupPage";
import ResultPage from "./pages/worldcup/ResultPage";
import Tournament from "./components/worldcup/Tournament";
import RoadmapPage from "./pages/roadmap/roadMapPage";
import RoadmapResultPage from "./pages/roadmap/roadmapResultPage";
import RoadmapErrorPage from "./pages/roadmap/roadmapErrorPage";
import AptiTestPage from "./pages/aptitestPage";

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
    {
        path: "/aptiTest/:qno",
        element: <AptiTestPage />
    }
]);

export default router;
