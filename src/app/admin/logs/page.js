import AuthCheck from "../components/auth-check";

export default function Logs() {
  return (
    <AuthCheck>
      <div className="w-full">
        <h1>Logs</h1>
      </div>
    </AuthCheck>
  );
}
