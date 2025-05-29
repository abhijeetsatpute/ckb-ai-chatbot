import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import LinkIcon from "@mui/icons-material/Link";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { toast } from "sonner";

const AdminUploadPanel: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [linkInput, setLinkInput] = useState("");
  const [fileLoading, setFileLoading] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const handleUpload = async () => {
    setFileLoading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      const res = await fetch("http://localhost:3001/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok)
        setSuccessMsg(
          `Uploaded ${data.results.chunks || files.length} documents.`
        );
      else throw new Error(data.error);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setFileLoading(false);
    }
  };

  const handleLinkSubmit = async () => {
    setLinkLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/weblinks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ links: [linkInput] }),
      });
      const data = await res.json();
      if (res.ok) setSuccessMsg("Web link processed successfully.");
      else throw new Error(data.error);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLinkLoading(false);
      setLinkInput("");
    }
  };

  const handleReset = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/reset", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Reset failed");

      toast.success(data.message || "Knowledge base reset successfully.");
    } catch (err) {
      toast.error("Knowledge base cannot be reset");
    }
  };

  return (
    <Box
      m={5}
      p={3}
      maxWidth={600}
      borderRadius={2}
      boxShadow={3}
      textAlign={"center"}
      mx={"10%"}
    >
      <Typography variant="h5" gutterBottom>
        Admin Upload Panel
      </Typography>

      <Button
        variant="outlined"
        color="error"
        startIcon={<RestartAltIcon />}
        onClick={handleReset}
        sx={{ mt: 2 }}
      >
        Reset Knowledge Base
      </Button>

      <Box mt={2}>
        <Button
          component="label"
          variant="contained"
          startIcon={<CloudUploadIcon />}
          fullWidth
        >
          Upload Files
          <input hidden multiple type="file" onChange={handleFileChange} />
        </Button>
      </Box>

      {files.length > 0 && (
        <Typography variant="body2" mt={1}>
          {files.length} file(s) selected
        </Typography>
      )}

      <Box mt={2}>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={files.length === 0 || fileLoading}
          fullWidth
        >
          {fileLoading ? <CircularProgress size={24} /> : "Submit Files"}
        </Button>
      </Box>

      <Box mt={4} display="flex" alignItems="center">
        <TextField
          fullWidth
          label="Enter Web Link"
          value={linkInput}
          onChange={(e) => setLinkInput(e.target.value)}
        />
        <Button
          sx={{ ml: 2, height: "56px" }}
          variant="contained"
          startIcon={<LinkIcon />}
          onClick={handleLinkSubmit}
          disabled={!linkInput || linkLoading}
        >
          {linkLoading ? <CircularProgress size={20} /> : "Add"}
        </Button>
      </Box>

      <Snackbar
        open={!!successMsg}
        autoHideDuration={4000}
        onClose={() => setSuccessMsg("")}
      >
        <Alert severity="success">{successMsg}</Alert>
      </Snackbar>

      <Snackbar
        open={!!errorMsg}
        autoHideDuration={4000}
        onClose={() => setErrorMsg("")}
      >
        <Alert severity="error">{errorMsg}</Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminUploadPanel;
