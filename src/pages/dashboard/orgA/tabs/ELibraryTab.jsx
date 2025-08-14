import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Pagination,
  Stack,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
} from "@mui/material";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min?url";
import { showErrorAlert, showSuccessAlert, showConfirmAlert } from "@/services/alert";
import { createClient } from "@supabase/supabase-js";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const ELibraryTab = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [page, setPage] = useState(1);
  const filesPerPage = 6;


  const session = JSON.parse(sessionStorage.getItem("session"));
  const token = session?.access_token || session?.[0]?.access_token || null;

const userRole = session?.user?.user_metadata?.role || null;
console.log("Current user role:", userRole);



  const fetchFiles = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elibrary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      setFiles((data.data || []).map(f => ({ ...f, thumbnail: null })));

      (data.data || []).forEach(async (file) => {
        if (!file.fileUrl) return;
        try {
          const pdf = await pdfjsLib.getDocument(file.fileUrl).promise;
          const pdfPage = await pdf.getPage(1);
          const viewport = pdfPage.getViewport({ scale: 0.5 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await pdfPage.render({ canvasContext: context, viewport }).promise;
          const thumbnail = canvas.toDataURL("image/png");
          setFiles(prev => prev.map(f => f.id === file.id ? { ...f, thumbnail } : f));
        } catch {
          // fail silently
        }
      });
    } catch (err) {
      console.error(err);
      showErrorAlert("Failed to load E-Library content.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;

    fetchFiles();

    // 🔥 realtime subscription
    const channel = supabase
      .channel("realtime:e_library")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "e_library" },
        () => fetchFiles()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [token]);

  const totalPages = Math.ceil(files.length / filesPerPage);
  const displayedFiles = files.slice((page - 1) * filesPerPage, page * filesPerPage);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elibrary`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      showSuccessAlert(`${file.name} uploaded successfully!`);
      fetchFiles();
    } catch (err) {
      console.error("❌ Upload failed:", err);
      showErrorAlert("Upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (fileId, fileName, filePath) => {
    const confirm = await showConfirmAlert(
      "Delete File?",
      `Are you sure you want to delete "${fileName}"?`,
      "warning"
    );
    if (!confirm) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elibrary/${fileId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ prefixes: [filePath] }),
      });
      if (!res.ok) throw new Error(await res.text());
      showSuccessAlert(`"${fileName}" deleted successfully!`);
      fetchFiles();
    } catch (err) {
      console.error(err);
      showErrorAlert("Failed to delete file.");
    }
  };

  return (
    <Box sx={{ px: 2, py: 2 }}>
      <Paper elevation={2} sx={{ borderRadius: 2, p: 3, mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
          <LibraryBooksIcon fontSize="medium" />
          <Typography variant="h5" fontWeight="bold">E-Library</Typography>
        </Stack>
        <Divider sx={{ mb: 2 }} />

{(userRole === "S" || userRole === "D") && (
  <Button
    variant="contained"
    startIcon={<CloudUploadIcon />}
    component="label"
    disabled={uploading}
    sx={{ mb: 3 }}
  >
    {uploading ? "Uploading..." : "Upload File"}
    <input type="file" hidden onChange={handleUpload} />
  </Button>
)}



        {loading && files.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
         {displayedFiles.map((file) => (
  <Grid item xs={12} sm={6} md={4} key={file.id}>
    <Card
      sx={{ textAlign: "center", position: "relative", cursor: "pointer" }}
      onClick={() => window.open(file.fileUrl, "_blank")} // open PDF in new tab
    >
      {(userRole === "S" || userRole === "D") && (
        <IconButton
          size="small"
          sx={{ position: "absolute", top: 5, right: 5, bgcolor: "white" }}
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(file.id, file.name, file.fileUrl);
          }}
        >
          <DeleteIcon color="error" />
        </IconButton>
      )}

      {file.thumbnail ? (
        <Box
          sx={{
            width: "100%",
            height: 220,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "grey.100",
            overflow: "hidden",
            borderRadius: 1,
            p: 1,
          }}
        >
          <img
            src={file.thumbnail}
            alt={file.name}
            style={{
              maxHeight: "100%",
              maxWidth: "100%",
              objectFit: "contain",
              borderRadius: "4px",
            }}
          />
        </Box>
      ) : (
        <Box
          sx={{
            width: "100%",
            height: 220,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "grey.200",
            borderRadius: 1,
          }}
        >
          <Typography variant="caption">No preview</Typography>
        </Box>
      )}

      <CardContent sx={{ p: 1 }}>
        <Typography
          variant="subtitle1"
          fontWeight={600}
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={file.name}
        >
          {file.name.length > 25 ? file.name.slice(0, 25) + "…" : file.name}
        </Typography>
      </CardContent>
    </Card>
  </Grid>
))}

          </Grid>
        )}
      </Paper>

      {totalPages > 1 && (
        <Box mt={2} display="flex" justifyContent="center">
          <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} color="primary" />
        </Box>
      )}

      {previewFile && (
        <Box
          sx={{
            position:"fixed",
            top:0,
            left:0,
            width:"100vw",
            height:"100vh",
            bgcolor:"rgba(0,0,0,0.7)",
            display:"flex",
            alignItems:"center",
            justifyContent:"center",
            zIndex:1300
          }}
          onClick={()=>setPreviewFile(null)}
        >
          <Paper sx={{ position:"relative", maxWidth:"90%", width:"100%" }} onClick={e=>e.stopPropagation()}>
            <IconButton onClick={()=>setPreviewFile(null)} sx={{ position:"absolute", top:8, right:8, bgcolor:"white" }}>
              <CloseIcon />
            </IconButton>
            <iframe
              src={`https://docs.google.com/gview?url=${encodeURIComponent(previewFile.fileUrl)}&embedded=true`}
              style={{ width: "100%", height: "90vh", border: "none" }}
              title="PDF Preview"
            />
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default ELibraryTab;
