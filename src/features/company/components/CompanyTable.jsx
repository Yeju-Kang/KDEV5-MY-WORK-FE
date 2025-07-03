import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import CustomTable from "@/components/common/customTable/CustomTable";
import ConfirmDialog from "@/components/common/confirmDialog/ConfirmDialog";
import { fetchCompanies, deleteCompany } from "@/features/company/companySlice";

const columns = [
  { key: "companyName", label: "회사명", type: "logo", searchable: true },
  {
    key: "businessNumber",
    label: "사업자 번호",
    type: "text",
    searchable: true,
  },
  { key: "contactPhoneNumber", label: "연락처", type: "text" },
  { key: "address", label: "주소", type: "text", searchable: true },
  { key: "createdAt", label: "등록일", type: "date" },
  {
    key: "deleted",
    label: "활성화 여부",
    type: "status",
    statusMap: {
      false: { color: "success", label: "활성" },
      true: { color: "error", label: "비활성" },
    },
  },
];

export default function CompanyTable() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    list: companies,
    totalCount,
    error,
    loading,
  } = useSelector((state) => state.company);

  const [page, setPage] = useState(1);
  const [searchKey, setSearchKey] = useState("");
  const [searchText, setSearchText] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const filterKey = "deleted";

  const filterOptions = [
    { label: "전체", value: "" },
    { label: "활성", value: "false" },
    { label: "비활성", value: "true" },
  ];

  const loadCompany = useCallback(() => {
    const params = { page };

    if (searchText.trim()) {
      params.keyword = searchText.trim();
      switch (searchKey) {
        case "companyName":
          params.keywordType = "NAME";
          break;
        case "businessNumber":
          params.keywordType = "BUSINESS_NUMBER";
          break;
        case "address":
          params.keywordType = "ADDRESS";
          break;
        default:
          params.keywordType = "NAME";
      }
    }

    if (filterValue) {
      params[filterKey] = filterValue;
    }

    dispatch(fetchCompanies(params));
  }, [dispatch, page, searchKey, searchText, filterValue]);

  useEffect(() => {
    loadCompany();
  }, [loadCompany]);

  const handleDelete = async () => {
    try {
      await dispatch(deleteCompany(selectedCompany.companyId)).unwrap();
      setConfirmOpen(false);
      loadCompany();
    } catch (err) {
      console.error("삭제 실패:", err);
      alert("삭제에 실패했습니다.");
    }
  };

  return (
    <Box>
      <CustomTable
        columns={columns}
        rows={companies}
        pagination={{
          page,
          total: totalCount,
          onPageChange: setPage,
        }}
        onRowClick={(row) => navigate(`/companies/${row.companyId}`)}
        onDelete={(row) => {
          setSelectedCompany(row);
          setConfirmOpen(true);
        }}
        search={{
          key: searchKey,
          placeholder: "검색어를 입력하세요",
          value: searchText,
          onKeyChange: (newKey) => {
            setPage(1);
            setSearchKey(newKey);
            setSearchText("");
          },
          onChange: (newText) => {
            setPage(1);
            setSearchText(newText);
          },
        }}
        filter={{
          key: filterKey,
          value: filterValue,
          label: "활성화 여부",
          options: filterOptions,
          onChange: (val) => {
            setPage(1);
            setFilterValue(val);
          },
        }}
        loading={loading}
        error={error}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="개발사를 삭제하시겠습니까?"
        description="삭제 후에는 복구할 수 없습니다."
        isDelete
        confirmKind="danger"
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </Box>
  );
}
