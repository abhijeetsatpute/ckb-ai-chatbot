import "./App.css";
import ChatWidget from "./components/ChatWidget";
import AdminUploadPanel from "./pages/Dashboard";
import { Toaster } from "sonner";

function App() {
  return (
    <>
      <Toaster position="top-center" />

      <AdminUploadPanel />

      <ChatWidget />
    </>
  );
}

export default App;
