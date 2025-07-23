import { createBrowserRouter } from "react-router-dom";
import MockInterviewScreen from "./MockInterviewScreen";

const router = createBrowserRouter([
    {
        path: "/mock-interview",
        element: <MockInterviewScreen />,
    },
]);

export default router;
