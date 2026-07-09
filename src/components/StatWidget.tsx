export default function StatWidget({ value, label, bgColor }: { value: string, label: string, bgColor: string }) {
  return (
    <div
      className="rounded-full w-28 h-28 flex flex-col items-center justify-center border-4 border-white shadow-2xl"
      style={{ backgroundColor: bgColor }}
    >
      <span className="text-3xl font-black text-gray-900 leading-none">{value}</span>
      <span className="text-[10px] font-bold text-gray-800 tracking-widest mt-1 uppercase text-center px-2">{label}</span>
    </div>
  )
}
