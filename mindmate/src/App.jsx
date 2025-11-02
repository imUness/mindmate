import "./App.css";
import ChatWidget from "./ChatWidget";
import bgImg from "./bg.png"; // ✅ Import local image


function App() {
  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* Fixed full-screen background */}
      <div
        style={{
          position: "fixed",   // ✅ stays fixed on scroll
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundImage: `url(${bgImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          zIndex: -1,          // ✅ put behind content
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          color: "white",
          padding: "20px",
        }}
      >
        <ChatWidget />
      </div>
    </div>
  );
}

export default App;