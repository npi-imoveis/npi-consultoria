export function Top() {
  return (
    <div className="fixed inset-x-0 bottom-0 p-4">
      <div className="rounded-lg bg-indigo-600 px-4 py-3 text-white shadow-lg">
        <p className="text-center text-sm font-medium">
          Love Alpine JS?
          <a href="#" className="inline-block underline">
            {" "}
            Check out this new course!{" "}
          </a>
        </p>
      </div>
    </div>
  );
}
