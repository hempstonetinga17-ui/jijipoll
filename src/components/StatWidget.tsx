export default function StatWidget({ value, label, bgColor }: { value: string, label: string, bgColor: string }) {
  return (
    <div 
      style={{
        borderRadius: '9999px',
        width: '110px',
        height: '110px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: '4px solid white',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        backgroundColor: bgColor
      }}
    >
      <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#111827', lineHeight: 1 }}>{value}</span>
      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#1f2937', letterSpacing: '0.1em', marginTop: '4px', textTransform: 'uppercase', textAlign: 'center', padding: '0 8px' }}>{label}</span>
    </div>
  )
}
