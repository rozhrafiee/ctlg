import { useEffect, useState } from "react";
import { adminAPI } from "../services/api";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await adminAPI.getUsers();
      setUsers(res.data);
    } catch (e) {
      console.error("Error loading users:", e);
    }
  };

  return (
    <div className="admin-panel">
      <h2>پنل ادمین</h2>
      <div>
        <h3>لیست کاربران</h3>
        <ul>
          {users.map((user) => (
            <li key={user.id}>{user.username} - {user.role}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminPanel;
