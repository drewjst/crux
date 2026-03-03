export default function ConsoleLoading() {
  return (
    <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center bg-[#0a0a0f]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-orange-500/30 border-t-orange-500" />
        <span className="font-mono text-xs text-zinc-500">Loading console...</span>
      </div>
    </div>
  );
}
