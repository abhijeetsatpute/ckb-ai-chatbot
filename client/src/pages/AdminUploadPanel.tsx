import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import LinkIcon from "@mui/icons-material/Link";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import { toast } from "sonner";
import { isValidURL } from "../utils/validations";

const AdminUploadPanel: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [linkInput, setLinkInput] = useState("");
  const [xmlFile, setXmlFile] = useState<File | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);
  const [xmlLoading, setXmlLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const handleXMLFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setXmlFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    setFileLoading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      const res = await fetch("/api/upload", {
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
    if (!isValidURL(linkInput)) {
      setErrorMsg("Please enter a valid URL.");
      return;
    }

    setLinkLoading(true);
    try {
      const res = await fetch("/api/weblinks", {
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

  const handleWordPressImport = async () => {
    if (!xmlFile) {
      setErrorMsg("Please select a WordPress XML file.");
      return;
    }

    setXmlLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", xmlFile);

      const res = await fetch("/api/wordpress-xml", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok)
        setSuccessMsg(
          `Imported ${data.result.chunks || "some"} WordPress entries.`
        );
      else throw new Error(data.error);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setXmlLoading(false);
      setXmlFile(null);
    }
  };

  const handleReset = async () => {
    try {
      const res = await fetch("/api/reset", {
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
    <Box display="flex" justifyContent="center" p={3}>
      <Box
        p={3}
        maxWidth={600}
        borderRadius={2}
        boxShadow={3}
        textAlign={"center"}
        width="100%"
      >
        <Typography variant="h5" gutterBottom>
          Admin Upload Panel
        </Typography>

        <Button
          fullWidth
          variant="contained"
          color="error"
          startIcon={<RestartAltIcon />}
          onClick={handleReset}
          sx={{ mt: 2 }}
        >
          Reset Knowledge Base
        </Button>

        <Divider sx={{ mt: 2 }} />

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
            color="success"
          >
            {fileLoading ? <CircularProgress size={24} /> : "Submit Files"}
          </Button>
        </Box>

        <Divider sx={{ mt: 2 }} />

        <Box mt={2} display="flex" alignItems="center">
          <TextField
            size="small"
            fullWidth
            label="Enter Web Link"
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            type="url"
            error={!isValidURL(linkInput) && linkInput !== ""}
            // helperText={
            //   !isValidURL(linkInput) && linkInput !== "" ? "Invalid URL" : ""
            // }
          />
          <Button
            sx={{ ml: 2 }}
            variant="contained"
            startIcon={<LinkIcon />}
            onClick={handleLinkSubmit}
            disabled={!linkInput || linkLoading}
            color="success"
          >
            {linkLoading ? <CircularProgress size={20} /> : "Add"}
          </Button>
        </Box>

        <Divider sx={{ mt: 2 }} />

        <Box mt={2}>
          <Button
            component="label"
            variant="outlined"
            startIcon={<FileUploadOutlinedIcon />}
            fullWidth
          >
            Select WordPress XML
            <input
              hidden
              type="file"
              accept=".xml"
              onChange={handleXMLFileChange}
            />
          </Button>
        </Box>

        {xmlFile && (
          <Typography variant="body2" mt={1}>
            {xmlFile.name}
          </Typography>
        )}

        <Box mt={2}>
          <Button
            variant="contained"
            onClick={handleWordPressImport}
            fullWidth
            disabled={!xmlFile || xmlLoading}
            color="primary"
          >
            {xmlLoading ? (
              <CircularProgress size={24} />
            ) : (
              "Import WordPress Data"
            )}
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
    </Box>
  );
};

export default AdminUploadPanel;
