// src/router.js

import { createBrowserRouter } from "react-router-dom";
import { ModalProvider } from "./context/ModalContext.jsx"; //
import WorldcupPage from "./pages/worldcup/WorldcupPage";
import ResultPage from "./pages/worldcup/ResultPage";
import Tournament from "./components/worldcup/Tournament";
import RoadmapPage from "./pages/roadmap/roadMapPage";
import RoadmapResultPage from "./pages/roadmap/roadmapResultPage";
import RoadmapErrorPage from "./pages/roadmap/roadmapErrorPage";
import AptiTestPage from "./pages/aptiTest/aptitestPage";
import AptitestResult from "./components/aptiTest/aptiTestResult";
import MockInterviewPage from "./pages/mockInterview/MockInterviewPage";
import RootLayout from "./layout/RootLayout.jsx";

const router = createBrowserRouter([
    {
        // 최상위 경로에 ModalProvider를 배치
        path: "/",
        element: <RootLayout />,
        children: [
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
            },
            {
                path: "/aptiTest/result",
                element: <AptitestResult />
            },
            {
                path: "/mock-interview",
                element: <MockInterviewPage />,
            },
        ],
    },
]);

export default router;