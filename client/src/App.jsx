import { useAuth } from "./AuthContext";
import AuthForm from "./components/AuthForm";
import Board from "./components/Board";

export default function App() {
  const { user, ready, logout } = useAuth();
  if (!ready) return <p className="msg">Loading...</p>;

  return (
    <>
      <header className="top">
        <h1>Taskboard</h1>
        {user && (
          <div className="top-right">
            <span>Hi, {user.name}</span>
            <button onClick={logout}>Logout</button>
          </div>
        )}
      </header>
      {user ? <Board /> : <AuthForm />}
    </>
  );
}