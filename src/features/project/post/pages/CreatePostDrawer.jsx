import React, { useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Stack,
  Paper,
  Divider,
  TextField,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { InfoOutlined } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  createPost,
  bulkActivateAttachments,
} from "@/features/project/post/postSlice";
import CustomButton from "@/components/common/customButton/CustomButton";
import FilePreviewModal from "../components/FilePreviewModal";
import usePostForm from "@/hooks/usePostForm";
import {
  hasUnfinishedUploads,
  hasFailedUploads,
  getSuccessfulPostAttachmentIds,
} from "@/utils/fileUploadUtils";
import FileUploadSection from "../components/FileUploadSection";
import ConfirmDialog from "@/components/common/ConfirmDialog/ConfirmDialog";

export default function CreatePostDrawer({ open, onClose, onSubmit }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { id: projectId } = useParams();

  const userName = useSelector((state) => state.auth.user.name);
  const companyName = useSelector((state) => state.auth.company.name);
  const projectSteps = useSelector((state) => state.projectStep.items) || [];

  const {
    form,
    setForm,
    files,
    setFiles,
    loadingId,
    previewModal,
    handleChange,
    handleFileSelect,
    handleFileDelete,
    handleFileRetry,
    handlePreviewOpen,
    handlePreviewClose,
  } = usePostForm({ dispatch, open, onClose });

  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmCallback, setConfirmCallback] = useState(() => () => {});

  const handleSubmit = async () => {
    const { id, projectStepId, title, content } = form;
    if (!projectStepId || !title.trim() || !content.trim()) return;

    if (hasUnfinishedUploads(files)) {
      alert("파일 업로드가 완료될 때까지 기다려주세요.");
      return;
    }

    if (hasFailedUploads(files)) {
      setConfirmCallback(() => () => {
        setConfirmOpen(false);
        submitPost();
      });
      setConfirmOpen(true);
      return;
    }

    await submitPost();
  };

  const submitPost = async () => {
    setLoading(true);
    try {
      const payload = {
        id: form.id,
        projectStepId: form.projectStepId,
        title: form.title,
        content: form.content,
        companyName,
        authorName: userName,
      };

      let createdPostId;
      if (onSubmit) {
        const result = await onSubmit(payload);
        createdPostId = result?.id || form.id;
      } else {
        const result = await dispatch(
          createPost({ projectId, data: payload })
        ).unwrap();
        createdPostId = result?.id || form.id;
      }

      const postAttachmentIds = getSuccessfulPostAttachmentIds(files);
      if (postAttachmentIds.length > 0) {
        try {
          await dispatch(
            bulkActivateAttachments({
              postId: createdPostId,
              postAttachmentIds,
            })
          ).unwrap();
        } catch (e) {
          console.error("파일 활성화 실패:", e);
        }
      }

      setForm({ id: "", projectStepId: "", title: "", content: "" });
      setFiles([]);
      onClose();
    } catch (e) {
      alert("게시글 등록에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: { width: { xs: "100%", sm: "50vw" }, bgcolor: "transparent" },
        }}
      >
        <Paper
          elevation={6}
          sx={{
            height: "100%",
            borderTopLeftRadius: 2,
            borderBottomLeftRadius: 2,
            overflowY: "auto",
            bgcolor: theme.palette.background.paper,
            p: 4,
            boxSizing: "border-box",
          }}
        >
          <Stack spacing={4} sx={{ flex: 1 }}>
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h3" fontWeight={600}>
                  게시글 작성
                </Typography>
                <IconButton onClick={onClose}>
                  <CloseIcon />
                </IconButton>
              </Box>
              <Divider sx={{ mt: 1 }} />
            </Box>

            {loadingId || loading ? (
              <Box sx={{ textAlign: "center", py: 10 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      1. 단계 선택
                    </Typography>
                    <Tooltip title="해당 게시글이 속할 단계를 선택하세요.">
                      <InfoOutlined fontSize="small" color="action" />
                    </Tooltip>
                  </Stack>
                  <Divider sx={{ mt: 1, mb: 2 }} />

                  <FormControl fullWidth size="small">
                    <InputLabel id="step-select-label">단계</InputLabel>
                    <Select
                      labelId="step-select-label"
                      value={form.projectStepId}
                      label="단계"
                      onChange={handleChange("projectStepId")}
                      displayEmpty
                      renderValue={(val) =>
                        val
                          ? projectSteps.find((s) => s.projectStepId === val)
                              ?.title
                          : "단계를 선택하세요"
                      }
                    >
                      <MenuItem value="" disabled>
                        단계 선택
                      </MenuItem>
                      {projectSteps.map((step) => (
                        <MenuItem
                          key={step.projectStepId}
                          value={step.projectStepId}
                        >
                          {step.title}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      2. 제목 입력
                    </Typography>
                    <Tooltip title="게시글 제목을 입력하세요.">
                      <InfoOutlined fontSize="small" color="action" />
                    </Tooltip>
                  </Stack>
                  <Divider sx={{ mt: 1, mb: 2 }} />

                  <TextField
                    label="제목"
                    placeholder="제목을 입력하세요"
                    value={form.title}
                    onChange={handleChange("title")}
                    fullWidth
                    size="small"
                  />
                </Box>

                <Box>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      3. 내용 입력
                    </Typography>
                    <Tooltip title="게시글 내용을 입력하세요.">
                      <InfoOutlined fontSize="small" color="action" />
                    </Tooltip>
                  </Stack>
                  <Divider sx={{ mt: 1, mb: 2 }} />

                  <TextField
                    label="내용"
                    placeholder="내용을 입력하세요"
                    value={form.content}
                    onChange={handleChange("content")}
                    fullWidth
                    multiline
                    minRows={6}
                    size="small"
                  />
                </Box>

                <FileUploadSection
                  files={files}
                  onSelect={handleFileSelect}
                  onDelete={handleFileDelete}
                  onRetry={handleFileRetry}
                  onPreview={handlePreviewOpen}
                />

                <Stack direction="row" justifyContent="flex-end" spacing={2}>
                  <CustomButton kind="ghost" onClick={onClose}>
                    취소
                  </CustomButton>
                  <CustomButton
                    kind="primary"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? "등록 중…" : "등록"}
                  </CustomButton>
                </Stack>
              </>
            )}
          </Stack>
        </Paper>
      </Drawer>
      <FilePreviewModal
        open={previewModal.open}
        attachment={previewModal.attachment}
        onClose={handlePreviewClose}
      />
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmCallback}
        title="업로드 실패 파일이 있습니다"
        description="일부 파일 업로드에 실패했습니다. 그래도 게시글을 등록하시겠습니까?"
        confirmText="그래도 등록"
        confirmKind="primary"
      />
    </>
  );
}
