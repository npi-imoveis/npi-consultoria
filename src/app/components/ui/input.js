export default function Input({ placeholder }) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      className="w-full bg-zinc-100 text-zinc-700 rounded-md text-sm tracking-tighter font-semibold px-4 py-3"
    />
  );
}
