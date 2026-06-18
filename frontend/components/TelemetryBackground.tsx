export default function TelemetryBackground() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: `
          radial-gradient(ellipse 80% 50% at 20% -10%, rgba(75, 75, 160, 0.1) 0%, transparent 60%),
          radial-gradient(ellipse 60% 40% at 80% 100%, rgba(143, 71, 174, 0.1) 0%, transparent 60%),
          radial-gradient(ellipse 100% 80% at 50% 50%, var(--background) 0%, transparent 100%)
        `,
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
