import "./App.css";
import ChatWidget from "./components/ChatWidget";
import AdminUploadPanel from "./pages/AdminUploadPanel";
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
