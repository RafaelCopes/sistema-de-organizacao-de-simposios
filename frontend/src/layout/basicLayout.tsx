import { Outlet } from "react-router-dom";

export const BasicLayout = () => {
  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh" }}>
      <div style={{ display: "flex", flexGrow: 1 }}>
        <main style={{ display: "flex", flexGrow: 1, flexDirection: "column" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
