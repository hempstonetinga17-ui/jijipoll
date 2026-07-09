export default function StatWidget({ value, label, bgColor }: { value: string, label: string, bgColor: string }) {
  return (
    <div 
      className={`rounded-full w-24 h-24 sm:w-32 sm:h-32 flex flex-col items-center justify-center border-4 border-white shadow-2xl ${bgColor}`}
    >
      <span className="text-2xl sm:text-4xl font-black text-gray-900 leading-none">{value}</span>
      <span className="text-[10px] sm:text-xs font-bold text-gray-800 tracking-widest mt-1 uppercase text-center px-2">{label}</span>
    </div>
  )
}
