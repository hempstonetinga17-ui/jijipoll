export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", fontFamily: "'Inter', sans-serif" }}>
      {children}
    </div>
  );
}
