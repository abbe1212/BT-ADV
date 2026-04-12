export default function AdminLoading() {
  return (
    <div className="flex h-full min-h-[60vh] w-full items-center justify-center flex-col gap-6">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-[#14304A] rounded-full"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-[#FFEE34] rounded-full border-t-transparent animate-spin"></div>
      </div>
      <div className="flex flex-col items-center gap-1">
        <p className="text-white font-bold tracking-wide">LOADING</p>
        <p className="text-white/40 text-xs uppercase tracking-widest animate-pulse">Please wait...</p>
      </div>
    </div>
  );
}
