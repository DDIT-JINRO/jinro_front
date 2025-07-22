import { createBrowserRouter } from "react-router-dom";
import WorldcupPage from "./pages/WorldcupPage";
import ResultPage from "./pages/ResultPage";
import Tournament from "./components/Tournament.jsx";
import RoadMap from "./pages/roadMapPage";

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
        element: <RoadMap />,
    },
]);

export default router;
