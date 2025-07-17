import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  Stack,
  Link,
  Snackbar,
  Alert,
  Paper,
  Button,
  Divider,
  Avatar,
  useTheme,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login } from "@/features/auth/authSlice";
import GitHubIcon from "@mui/icons-material/GitHub";
import StarIcon from "@mui/icons-material/Star";
import { TestAccountCard, LoginPaper } from "./LoginPage.styles";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const { status, error, accessToken } = useSelector((state) => state.auth);
  const loading = status === "loading";

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    setSnackbarMessage("");
  };

  useEffect(() => {
    if (accessToken) {
      navigate("/dashboard", { replace: true });
    }
  }, [accessToken, navigate]);

  const handleSubmit = async (e) => {
    localStorage.removeItem("accessToken");
    e.preventDefault();

    const result = await dispatch(login(form));
    if (login.fulfilled.match(result)) {
      navigate("/dashboard");
    } else {
      setSnackbarMessage("로그인에 실패했습니다. 아이디/비밀번호를 확인하세요.");
      setSnackbarOpen(true);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f8f9fb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          width: { xs: "100%", md: 1200 },
          minHeight: 600,
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          bgcolor: "#f8f9fb",
        }}
      >
        {/* 왼쪽: 로고+소개+레포지토리 안내 */}
        <Box
          sx={{
            flex: 1.2,
            bgcolor: "#fff",
            p: { xs: 4, md: 6 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            borderRight: { md: "1px solid #f0f0f0" },
            minWidth: 400,
          }}
        >
          <Box mb={4} display="flex" alignItems="center" gap={2}>
            <Avatar
              src="/bear_round.png"
              alt="곰돌이 로고"
              sx={{ width: 64, height: 64, bgcolor: "#f5f5f5" }}
            />
            <Typography variant="h4" fontWeight={800} color="#218838">
              MY WORK
            </Typography>
          </Box>
          <Typography variant="h2" fontWeight={900} color="#222" gutterBottom sx={{ fontSize: 44 }}>
            <span style={{ color: theme.palette.primary.main || "#218838" }}>소통의 사다리,</span><br />
            <span style={{ color: "#218838" }}>MY WORK</span>
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2, mb: 4, fontSize: 18 }}>
            MY WORK 웹 에이전시와 고객사 간의 원활한 협업을 위한<br />
            올인원 프로젝트 관리 플랫폼입니다.
          </Typography>
          <Stack spacing={2}>
            <Paper elevation={0} sx={{ p: 2, display: "flex", alignItems: "center", gap: 2, bgcolor: "#f8f9fb" }}>
              <Box sx={{ bgcolor: "#E6F9E6", borderRadius: 2, width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Typography fontWeight={700} color="#218838" fontSize={22} align="center">
                  MY<br />WORK
                </Typography>
              </Box>
              <Box>
                <Typography fontWeight={700} fontSize={16} mb={0.5}>
                  MY WORK-FE Repository <GitHubIcon sx={{ fontSize: 18, ml: 0.5, verticalAlign: "middle" }} />
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  React와 TypeScript를 활용한 프론트엔드 코드베이스입니다.<br />
                  사용자 인터페이스와 상호작용을 구현한 저장소입니다.
                </Typography>
              </Box>
            </Paper>
            <Paper elevation={0} sx={{ p: 2, display: "flex", alignItems: "center", gap: 2, bgcolor: "#f8f9fb" }}>
              <Box sx={{ bgcolor: "#E6F9E6", borderRadius: 2, width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Typography fontWeight={700} color="#218838" fontSize={22} align="center">
                  MY<br />WORK
                </Typography>
              </Box>
              <Box>
                <Typography fontWeight={700} fontSize={16} mb={0.5}>
                  MY WORK-BE Repository <GitHubIcon sx={{ fontSize: 18, ml: 0.5, verticalAlign: "middle" }} />
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Spring Boot 기반의 백엔드 코드베이스입니다.<br />
                  서버 로직과 데이터베이스 관리를 담당하는 저장소입니다.
                </Typography>
              </Box>
            </Paper>
          </Stack>
        </Box>

        {/* 오른쪽: 로그인+테스트 계정 안내 */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            bgcolor: "#f8f9fb",
            p: { xs: 4, md: 6 },
            minWidth: 400,
            position: "relative",
          }}
        >
          <Box sx={{ width: 360, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <TestAccountCard elevation={0}>
              <Typography fontWeight={700} sx={{ color: "#218838", mb: 0.5 }}>
                <StarIcon sx={{ fontSize: 18, mr: 0.5, verticalAlign: "middle" }} />
                테스트 계정 안내 (ID / PW)
              </Typography>
              <Typography variant="body2" sx={{ color: "#218838" }}>
                <b>관리자:</b> admin01 / admin01<br />
                <b>일반유저:</b> user01 / user01<br />
                <span style={{ fontSize: 12, color: "#5ca06a" }}>(ABC소프트웨어임직원1)</span>
              </Typography>
            </TestAccountCard>
            <LoginPaper elevation={0}>
              <Typography variant="h5" fontWeight={800} mb={3} align="center">
                로그인
              </Typography>
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="아이디"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="아이디를 입력하세요"
                  margin="normal"
                  autoComplete="username"
                  InputProps={{ sx: { bgcolor: "#f8f9fb" } }}
                />
                <TextField
                  fullWidth
                  label="비밀번호"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="비밀번호를 입력하세요"
                  margin="normal"
                  autoComplete="current-password"
                  InputProps={{ sx: { bgcolor: "#f8f9fb" } }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="success"
                  size="large"
                  sx={{
                    mt: 2,
                    fontWeight: 700,
                    borderRadius: 2,
                    height: 48,
                    background: "#218838",
                    '&:hover': { background: "#176b2c" },
                  }}
                  disabled={loading}
                >
                  로그인
                </Button>
              </form>
              <Stack direction="row" justifyContent="center" spacing={2} mt={2}>
                <Link href="#" underline="hover" color="text.secondary" fontSize={14}>
                  아이디 찾기
                </Link>
                <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                <Link href="#" underline="hover" color="text.secondary" fontSize={14}>
                  비밀번호 찾기
                </Link>
              </Stack>
            </LoginPaper>
          </Box>
        </Box>
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="warning"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
