export default function Card({ title, value, icon }) {
  return (
    <div className="bg-white p-4 rounded-md shadow-md max-w-[300px] h-[100px]">
      <h2 className="text-lg font-bold">{title}</h2>
    </div>
  );
}
