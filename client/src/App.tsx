import "./App.css";
import ChatWidget from "./components/ChatWidget";
import AdminUploadPanel from "./pages/AdminUploadPanel";
import { Toaster } from "sonner";
import { DOCUMENTATION_LINK, VERSION } from "./utils/constants";
import Version from "./components/Version";
import { Link, Typography } from "@mui/material";

function App() {
  return (
    <>
      <Toaster position="top-center" />
      <Typography textAlign={"right"}>
        <Link sx={{ textAlign: "right" }} href={DOCUMENTATION_LINK}>
          Documentation
        </Link>
      </Typography>

      <AdminUploadPanel />

      <ChatWidget />

      <Version version={VERSION} />
    </>
  );
}

export default App;
