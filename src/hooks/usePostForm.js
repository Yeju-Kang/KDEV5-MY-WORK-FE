import { useState, useEffect } from "react";
import {
  updateFileItem,
  hasUnfinishedUploads,
  hasFailedUploads,
  getSuccessfulPostAttachmentIds,
  getUniqueFiles,
  convertToFileItems,
} from "@/utils/fileUploadUtils";
import { validateFile } from "@/utils/validateFile";
import { uploadFileWithPresignedUrl } from "@/utils/uploadFileWithPresignedUrl";
import {
  createPostId,
  deleteAttachment,
  cleanupPostAttachments,
} from "@/features/project/post/postSlice";

export default function usePostForm({ dispatch, open }) {
  const [form, setForm] = useState({
    id: "",
    projectStepId: "",
    title: "",
    content: "",
  });
  const [files, setFiles] = useState([]);
  const [loadingId, setLoadingId] = useState(false);
  const [previewModal, setPreviewModal] = useState({
    open: false,
    attachment: null,
  });

  const handleChange = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const generatePostId = async () => {
    setLoadingId(true);
    try {
      const result = await dispatch(createPostId()).unwrap();
      const newId = typeof result === "string" ? result : result.postId;
      setForm((prev) => ({ ...prev, id: newId }));
    } finally {
      setLoadingId(false);
    }
  };

  const handleFileSelect = async (event) => {
    const selectedFiles = Array.from(event.target.files);
    const validFiles = [];
    const invalidFiles = [];

    selectedFiles.forEach((file) => {
      const errors = validateFile(file);
      if (errors.length === 0) validFiles.push(file);
      else invalidFiles.push({ file, errors });
    });

    if (invalidFiles.length > 0) {
      const errorMessages = invalidFiles
        .map(({ file, errors }) => `${file.name}: ${errors.join(", ")}`)
        .join("\n");
      alert(`다음 파일들의 업로드가 실패했습니다:\n\n${errorMessages}`);
    }

    const newFiles = getUniqueFiles(validFiles, files);
    if (newFiles.length !== validFiles.length) {
      alert(
        `${validFiles.length - newFiles.length}개의 파일이 이미 선택되어 있습니다.`
      );
    }

    if (newFiles.length === 0) return;

    const newFileItems = convertToFileItems(newFiles);
    setFiles((prev) => [...prev, ...newFileItems]);

    for (const fileItem of newFileItems) {
      await uploadFileWithPresignedUrl({
        fileItem,
        postId: form.id,
        updateFile: (id, updated) =>
          setFiles((prev) => updateFileItem(prev, id, updated)),
      });
    }
  };

  const handleFileDelete = async (fileId) => {
    const fileToDelete = files.find((file) => file.id === fileId);
    if (!fileToDelete) return;
    if (!window.confirm(`"${fileToDelete.name}" 파일을 삭제하시겠습니까?`))
      return;

    try {
      if (fileToDelete.status === "success" && fileToDelete.postAttachmentId) {
        await dispatch(
          deleteAttachment(fileToDelete.postAttachmentId)
        ).unwrap();
      }
      setFiles((prev) => prev.filter((file) => file.id !== fileId));
    } catch {
      alert("파일 삭제에 실패했습니다.");
    }
  };

  const handleFileRetry = async (fileId) => {
    const fileItem = files.find((file) => file.id === fileId);
    if (fileItem) {
      await uploadFileWithPresignedUrl({
        fileItem,
        postId: form.id,
        updateFile: (id, updated) =>
          setFiles((prev) => updateFileItem(prev, id, updated)),
      });
    }
  };

  const handlePreviewOpen = (file) => {
    setPreviewModal({
      open: true,
      attachment: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        imageUrl: URL.createObjectURL(file.file),
      },
    });
  };

  const handlePreviewClose = () => {
    URL.revokeObjectURL(previewModal.attachment?.imageUrl);
    setPreviewModal({ open: false, attachment: null });
  };

  useEffect(() => {
    if (open) generatePostId();
  }, [open]);

  return {
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
  };
}
