const NotFound = () => {
  return (
    <>
      <div
    style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)",
      fontFamily: "inherit"
    }}
  >
    <svg
      width="160"
      height="160"
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ marginBottom: 24 }}
    >
      <circle cx="80" cy="80" r="80" fill="#e0e7ff" />
      <text
        x="50%"
        y="55%"
        textAnchor="middle"
        fill="#6366f1"
        fontSize="72"
        fontWeight="bold"
        dy=".3em"
      >
        404
      </text>
    </svg>
    <h1 style={{ color: "#6366f1", marginBottom: 8, fontSize: 32 }}>
      Oops! Không tìm thấy trang
    </h1>
    <p style={{ color: "#64748b", marginBottom: 24, fontSize: 18, maxWidth: 400, textAlign: "center" }}>
      Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.<br />
      Hãy kiểm tra lại đường dẫn hoặc quay về trang chủ nhé!
    </p>
    <a
      href="/"
      style={{
        color: "#fff",
        background: "linear-gradient(90deg, #6366f1, #818cf8)",
        padding: "12px 32px",
        borderRadius: 8,
        fontWeight: "bold",
        textDecoration: "none",
        fontSize: 16,
        boxShadow: "0 2px 8px rgba(99, 102, 241, 0.15)"
      }}
    >
      Quay về trang chủ
    </a>
  </div>
    </>
  );
};
export default NotFound;
