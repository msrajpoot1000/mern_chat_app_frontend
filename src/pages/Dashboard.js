import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user, logout, token } = useAuth();
  return (
    <div>
      <h1>Welcome {user?.username || "User"}!</h1>
      {/* <p>{token} </p> */}
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Dashboard;
