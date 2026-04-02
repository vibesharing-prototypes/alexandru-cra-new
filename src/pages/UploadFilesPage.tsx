import { useCallback, useEffect, useRef, useState } from "react";
import {
  PageHeader,
  OverflowBreadcrumbs,
} from "@diligentcorp/atlas-react-bundle";
import {
  Box,
  Button,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { NavLink, useNavigate } from "react-router";

import UploadIcon from "@diligentcorp/atlas-react-bundle/icons/Upload";
import CloseIcon from "@diligentcorp/atlas-react-bundle/icons/Close";
import FileIcon from "@diligentcorp/atlas-react-bundle/icons/File";

import PageLayout from "../components/PageLayout.js";

interface UploadFile {
  id: string;
  file: File;
  progress: number;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadFilesPage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const uploadFiles: UploadFile[] = fileArray.map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
      file,
      progress: 0,
    }));
    setFiles((prev) => [...prev, ...uploadFiles]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  useEffect(() => {
    const inProgressFiles = files.filter(
      (f) => f.progress < 100
    );
    if (inProgressFiles.length === 0) return;

    const interval = setInterval(() => {
      setFiles((prev) =>
        prev.map((f) =>
          f.progress < 100
            ? { ...f, progress: Math.min(f.progress + Math.random() * 15 + 5, 100) }
            : f
        )
      );
    }, 400);

    return () => clearInterval(interval);
  }, [files.length]);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isDragOver) setIsDragOver(true);
    },
    [isDragOver]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        addFiles(e.target.files);
        e.target.value = "";
      }
    },
    [addFiles]
  );

  return (
    <PageLayout>
      <PageHeader
        pageTitle="Upload files"
        breadcrumbs={
          <OverflowBreadcrumbs
            leadingElement={<span>Asset Manager</span>}
            items={[
              {
                id: "cyber-risk",
                label: "Cyber risk management",
                url: "/cyber-risk",
              },
              {
                id: "file-import",
                label: "File import",
                url: "/cyber-risk/file-import",
              },
              {
                id: "upload",
                label: "Upload files",
                url: "/cyber-risk/file-import/upload",
              },
            ]}
            hideLastItem={true}
            aria-label="Breadcrumbs"
          >
            {({ label, url }) => <NavLink to={url}>{label}</NavLink>}
          </OverflowBreadcrumbs>
        }
        moreButton={
          <Button
            variant="contained"
            onClick={() => navigate("/cyber-risk/file-import/upload/findings")}
          >
            Start analysis
          </Button>
        }
      />

      <Box
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="File drop zone. Click or drag files to upload."
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        sx={({ tokens }) => ({
          border: `2px dashed ${isDragOver ? tokens.semantic.color.action.primary.default.value : tokens.semantic.color.ui.divider.default.value}`,
          borderRadius: 2,
          backgroundColor: isDragOver
            ? tokens.semantic.color.surface.variant.value
            : tokens.semantic.color.surface.subtle.value,
          p: 6,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1.5,
          cursor: "pointer",
          transition: "border-color 0.2s, background-color 0.2s",
        })}
      >
        <Box
          component="span"
          sx={({ tokens }) => ({
            fontSize: 48,
            color: tokens.semantic.color.type.muted.value,
            display: "inline-flex",
          })}
        >
          <UploadIcon />
        </Box>
        <Typography variant="body1" sx={({ tokens }) => ({ color: tokens.semantic.color.type.default.value })}>
          Drag and drop files here
        </Typography>
        <Typography variant="body1" sx={({ tokens }) => ({ color: tokens.semantic.color.type.muted.value })}>
          or
        </Typography>
        <Button
          variant="outlined"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
        >
          Select from computer
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          hidden
          onChange={handleFileSelect}
          aria-hidden="true"
        />
      </Box>

      {files.length > 0 && (
        <Stack gap={1}>
          <Typography variant="subtitle2">
            {files.length} {files.length === 1 ? "file" : "files"} selected
          </Typography>
          {files.map((uploadFile) => (
            <Box
              key={uploadFile.id}
              sx={({ tokens }) => ({
                border: `1px solid ${tokens.semantic.color.ui.divider.default.value}`,
                borderRadius: 1.5,
                p: 2,
                display: "flex",
                alignItems: "center",
                gap: 2,
              })}
            >
              <Box
                component="span"
                sx={({ tokens }) => ({
                  color: tokens.semantic.color.type.muted.value,
                  fontSize: 24,
                  display: "inline-flex",
                })}
              >
                <FileIcon />
              </Box>
              <Stack sx={{ flex: 1, minWidth: 0 }} gap={0.5}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body1" noWrap>
                    {uploadFile.file.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={({ tokens }) => ({
                      color: tokens.semantic.color.type.muted.value,
                      flexShrink: 0,
                      ml: 1,
                    })}
                  >
                    {formatFileSize(uploadFile.file.size)}
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={uploadFile.progress}
                  aria-label={`Uploading ${uploadFile.file.name}: ${Math.round(uploadFile.progress)}%`}
                />
              </Stack>
              <IconButton
                size="small"
                onClick={() => removeFile(uploadFile.id)}
                aria-label={`Remove ${uploadFile.file.name}`}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          ))}
        </Stack>
      )}
    </PageLayout>
  );
}
