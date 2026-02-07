import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState(null);

  const load = () => api.get("/users/").then(res => setUsers(res.data));

  useEffect(load, []);

  const filtered = users.filter(u => 
    filter === "all" || u.role === filter
  );

  const updateLevel = (id, newLevel) => {
    api.patch(`/users/${id}/`, { cognitive_level: newLevel })
      .then(() => {
        alert("سطح به‌روز شد");
        load();
        setEditing(null);
      });
  };

  const toggleRole = (id, currentRole) => {
    const newRole = currentRole === 'student' ? 'teacher' : 'student';
    if (confirm(`تغییر نقش به ${newRole}؟`)) {
      api.patch(`/users/${id}/`, { role: newRole }).then(load);
    }
  };

  const deleteUser = id => {
    if (confirm("حذف کاربر؟")) {
      api.delete(`/users/${id}/`).then(load);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">مدیریت کاربران</h1>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {["all", "student", "teacher", "admin"].map(r => (
          <button
            key={r}
            onClick={() => setFilter(r)}
            className={`px-4 py-2 rounded ${
              filter === r ? "bg-blue-600 text-white" : "bg-white text-gray-700"
            }`}
          >
            {r === "all" ? "همه" : r === "student" ? "دانشجو" : r === "teacher" ? "استاد" : "ادمین"}
          </button>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-3 text-right">نام</th>
              <th className="p-3 text-right">ایمیل</th>
              <th className="p-3 text-right">نقش</th>
              <th className="p-3 text-right">سطح</th>
              <th className="p-3 text-right">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{u.first_name} {u.last_name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    u.role === 'teacher' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {u.role === 'student' ? 'دانشجو' : u.role === 'teacher' ? 'استاد' : 'ادمین'}
                  </span>
                </td>
                <td className="p-3">
                  {editing === u.id ? (
                    <input
                      type="number"
                      min="1"
                      max="100"
                      defaultValue={u.cognitive_level}
                      className="w-20 border rounded px-2 py-1"
                      onBlur={e => updateLevel(u.id, Number(e.target.value))}
                      autoFocus
                    />
                  ) : (
                    <button
                      onClick={() => setEditing(u.id)}
                      className="text-blue-600 hover:underline"
                    >
                      {u.cognitive_level}
                    </button>
                  )}
                </td>
                <td className="p-3 space-x-2 space-x-reverse">
                  <button
                    onClick={() => toggleRole(u.id, u.role)}
                    className="text-sm px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    تغییر نقش
                  </button>
                  <button
                    onClick={() => deleteUser(u.id)}
                    className="text-sm px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
