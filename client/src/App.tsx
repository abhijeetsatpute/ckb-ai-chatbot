import "./App.css";
import ChatWidget from "./components/ChatWidget";
import AdminUploadPanel from "./pages/AdminUploadPanel";
import { Toaster } from "sonner";
import { VERSION } from "./utils/constants";
import Version from "./components/Version";

function App() {
  return (
    <>
      <Toaster position="top-center" />

      <AdminUploadPanel />

      <ChatWidget />

      <Version version={VERSION} />
    </>
  );
}

export default App;
