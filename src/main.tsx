import {createRoot} from "react-dom/client";
import {StrictMode} from "react";
import {App} from "./react.tsx";
import React from "react";

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App/>
    </StrictMode>,
);
