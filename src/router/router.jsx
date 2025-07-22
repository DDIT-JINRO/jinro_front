import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";

// 로딩 중에 보여줄 컴포넌트
const Loading = () => <div>Loading....</div>;

// 'Main' 페이지를 lazy loading으로 불러옵니다.
const RoadMap = lazy(() => import("../pages/roadMapPage"));

const router = createBrowserRouter([
    {
        path: "/roadmap",
        element: <Suspense fallback={<Loading />}><RoadMap /></Suspense>,
    },
]);

export default router;