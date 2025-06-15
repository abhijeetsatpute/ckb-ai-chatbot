// AdminUploadPanel.tsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  Card,
  CardContent,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import LinkIcon from "@mui/icons-material/Link";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { toast } from "sonner";
import { isValidURL } from "../utils/validations";

interface DataSource {
  id: string;
  type: "file" | "weblink" | "wordpress";
  name: string;
  timestamp: string;
  metadata: any;
  chunks: number;
}

const AdminUploadPanel: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [linkInput, setLinkInput] = useState("");
  const [xmlFile, setXmlFile] = useState<File | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);
  const [xmlLoading, setXmlLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [dataSourcesLoading, setDataSourcesLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sourceToDelete, setSourceToDelete] = useState<DataSource | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [sourceToView, setSourceToView] = useState<DataSource | null>(null);

  const fetchDataSources = async () => {
    setDataSourcesLoading(true);
    try {
      const res = await fetch("/api/data-sources");
      const data = await res.json();
      if (res.ok) {
        setDataSources(data.dataSources);
      }
    } catch (err) {
      console.error("Failed to fetch data sources:", err);
    } finally {
      setDataSourcesLoading(false);
    }
  };

  useEffect(() => {
    fetchDataSources();
  }, []);

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
      if (res.ok) {
        setSuccessMsg(
          `Uploaded ${data.results.chunks || files.length} chunks from ${
            files.length
          } documents.`
        );
        setFiles([]);
        fetchDataSources(); // Refresh data sources
      } else throw new Error(data.error);
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
      if (res.ok) {
        setSuccessMsg("Web link processed successfully.");
        setLinkInput("");
        fetchDataSources(); // Refresh data sources
      } else throw new Error(data.error);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLinkLoading(false);
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

      if (res.ok) {
        setSuccessMsg(
          `Imported ${data.result.chunks || "some"} WordPress entries.`
        );
        setXmlFile(null);
        fetchDataSources(); // Refresh data sources
      } else throw new Error(data.error);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setXmlLoading(false);
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
      fetchDataSources(); // Refresh data sources
    } catch (err) {
      toast.error("Knowledge base cannot be reset");
    }
  };

  const handleDeleteSource = async () => {
    if (!sourceToDelete) return;

    try {
      const res = await fetch(`/api/data-sources/${sourceToDelete.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        fetchDataSources(); // Refresh data sources
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(`Failed to delete: ${err.message}`);
    } finally {
      setDeleteDialogOpen(false);
      setSourceToDelete(null);
    }
  };

  const openDeleteDialog = (source: DataSource) => {
    setSourceToDelete(source);
    setDeleteDialogOpen(true);
  };

  const openViewDialog = (source: DataSource) => {
    setSourceToView(source);
    setViewDialogOpen(true);
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "file":
        return "primary";
      case "weblink":
        return "secondary";
      case "wordpress":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <Box display="flex" justifyContent="center" p={3}>
      <Box
        p={3}
        maxWidth={800}
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

        <Divider sx={{ mt: 3 }} />

        {/* Data Sources Section */}
        <Box mt={3}>
          <Typography variant="h6" gutterBottom>
            Data Sources ({dataSources.length})
          </Typography>

          {dataSourcesLoading ? (
            <CircularProgress />
          ) : (
            <List>
              {dataSources.map((source) => (
                <ListItem key={source.id}>
                  <Card sx={{ width: "100%" }}>
                    <CardContent>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="flex-start"
                      >
                        <Box flex={1}>
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={1}
                            mb={1}
                          >
                            <Chip
                              label={source.type.toUpperCase()}
                              color={getTypeColor(source.type) as any}
                              size="small"
                            />
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(source.timestamp)}
                            </Typography>
                          </Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {source.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {source.chunks} chunks
                          </Typography>
                        </Box>
                        <Box>
                          <IconButton
                            onClick={() => openViewDialog(source)}
                            size="small"
                          >
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => openDeleteDialog(source)}
                            size="small"
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Delete Data Source</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete "{sourceToDelete?.name}"? This
              will remove {sourceToDelete?.chunks} chunks from the knowledge
              base. This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleDeleteSource}
              color="error"
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Source Details Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Data Source Details</DialogTitle>
          <DialogContent>
            {sourceToView && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  {sourceToView.name}
                </Typography>
                <Box mb={2}>
                  <Chip
                    label={sourceToView.type.toUpperCase()}
                    color={getTypeColor(sourceToView.type) as any}
                  />
                </Box>
                <Typography variant="body2" gutterBottom>
                  <strong>Added:</strong> {formatDate(sourceToView.timestamp)}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Chunks:</strong> {sourceToView.chunks}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>ID:</strong> {sourceToView.id}
                </Typography>

                {sourceToView.metadata && (
                  <Box mt={2}>
                    <Typography variant="subtitle2" gutterBottom>
                      Additional Information:
                    </Typography>
                    {sourceToView.type === "file" && (
                      <>
                        <Typography variant="body2">
                          <strong>File Type:</strong>{" "}
                          {sourceToView.metadata.type}
                        </Typography>
                        <Typography variant="body2">
                          <strong>File Size:</strong>{" "}
                          {Math.round(sourceToView.metadata.size / 1024)} KB
                        </Typography>
                        <Typography variant="body2">
                          <strong>MIME Type:</strong>{" "}
                          {sourceToView.metadata.mimeType}
                        </Typography>
                      </>
                    )}
                    {sourceToView.type === "weblink" && (
                      <>
                        <Typography variant="body2">
                          <strong>URL:</strong> {sourceToView.metadata.url}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Content Length:</strong>{" "}
                          {sourceToView.metadata.contentLength} characters
                        </Typography>
                      </>
                    )}
                    {sourceToView.type === "wordpress" && (
                      <>
                        <Typography variant="body2">
                          <strong>Posts Count:</strong>{" "}
                          {sourceToView.metadata.postsCount}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Import Date:</strong>{" "}
                          {formatDate(sourceToView.metadata.importDate)}
                        </Typography>
                      </>
                    )}
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

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
