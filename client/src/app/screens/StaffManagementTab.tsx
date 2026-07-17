import React, { useState, useEffect } from "react";
import { api } from "../api";
import { Plus, Edit, Trash2, ShieldAlert, Check, X } from "lucide-react";

interface Branch {
  _id: string;
  name: string;
  address?: string;
}

interface Staff {
  _id: string;
  name: string;
  phoneNumber: string;
  role: "RootAdmin" | "StoreManager" | "Tech" | "Security";
  branchId?: Branch | null;
}

export function StaffManagementTab() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [currentStaffId, setCurrentStaffId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    pinCode: "",
    role: "RootAdmin",
    branchId: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [staffRes, branchRes] = await Promise.all([
        api.getStaff(),
        api.getBranches(),
      ]);
      setStaffList(staffRes);
      setBranches(branchRes);
    } catch (err) {
      setError((err as Error).message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode: "create" | "edit", staff?: Staff) => {
    setModalMode(mode);
    if (mode === "edit" && staff) {
      setCurrentStaffId(staff._id);
      setFormData({
        name: staff.name,
        phoneNumber: staff.phoneNumber,
        pinCode: "",
        role: staff.role,
        branchId: staff.branchId?._id || "",
      });
    } else {
      setCurrentStaffId(null);
      setFormData({
        name: "",
        phoneNumber: "",
        pinCode: "",
        role: "RootAdmin",
        branchId: "",
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { ...formData };
      if (!payload.pinCode && modalMode === 'edit') {
        delete payload.pinCode; // don't update pin if empty on edit
      } else if (!payload.pinCode && modalMode === 'create') {
        alert("PIN is required for new staff.");
        return;
      }
      
      if (!payload.branchId) {
        payload.branchId = null;
      }

      if (modalMode === "create") {
        await api.createStaff(payload);
      } else if (modalMode === "edit" && currentStaffId) {
        await api.updateStaff(currentStaffId, payload);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) {
      try {
        await api.deleteStaff(id);
        fetchData();
      } catch (err) {
        alert((err as Error).message);
      }
    }
  };

  const renderRoleBadge = (role: string) => {
    switch (role) {
      case "RootAdmin":
        return <span className="px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-xs">Quản trị Hệ thống</span>;
      case "StoreManager":
        return <span className="px-2 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full text-xs">Quản lý Cửa hàng</span>;
      case "Tech":
        return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-xs">Kỹ thuật viên</span>;
      case "Security":
        return <span className="px-2 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-xs">Bảo vệ</span>;
      default:
        return <span className="px-2 py-1 bg-slate-500/20 text-slate-400 border border-slate-500/30 rounded-full text-xs">{role}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Quản lý Nhân sự</h2>
          <p className="text-slate-400 text-sm mt-1">Quản lý tài khoản, phân quyền và chi nhánh của nhân viên</p>
        </div>
        <button
          onClick={() => handleOpenModal("create")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium shadow-lg shadow-blue-500/20"
        >
          <Plus size={18} />
          <span>Thêm Nhân Viên</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex flex-col items-center justify-center text-center">
          <ShieldAlert className="text-red-400 mb-2" size={24} />
          <p className="text-red-400">{error}</p>
          <button onClick={fetchData} className="mt-4 px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors">
            Thử lại
          </button>
        </div>
      )}

      {!error && (
        <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/50 border-b border-slate-700/50">
                  <th className="p-4 text-sm font-medium text-slate-400">Tên nhân viên</th>
                  <th className="p-4 text-sm font-medium text-slate-400">Số điện thoại / Username</th>
                  <th className="p-4 text-sm font-medium text-slate-400">Vai trò</th>
                  <th className="p-4 text-sm font-medium text-slate-400">Chi nhánh</th>
                  <th className="p-4 text-sm font-medium text-slate-400 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : staffList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      Chưa có nhân viên nào.
                    </td>
                  </tr>
                ) : (
                  staffList.map((staff) => (
                    <tr key={staff._id} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="p-4 text-white font-medium">{staff.name}</td>
                      <td className="p-4 text-slate-300">{staff.phoneNumber}</td>
                      <td className="p-4">{renderRoleBadge(staff.role)}</td>
                      <td className="p-4 text-slate-300">{staff.branchId?.name || <span className="text-slate-500 italic">Không có (Toàn hệ thống)</span>}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal("edit", staff)}
                            className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                            title="Sửa"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(staff._id)}
                            className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-[#1E293B] border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
              <h3 className="text-xl font-semibold text-white">
                {modalMode === "create" ? "Thêm Nhân Viên Mới" : "Sửa Nhân Viên"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-sm text-slate-400">Tên nhân viên</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Nhập tên đầy đủ"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm text-slate-400">Số điện thoại / Username</label>
                <input
                  type="text"
                  required
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Nhập SĐT hoặc username"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm text-slate-400">Mã PIN / Mật khẩu {modalMode === 'edit' && '(Để trống nếu không đổi)'}</label>
                <input
                  type="password"
                  required={modalMode === 'create'}
                  value={formData.pinCode}
                  onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Nhập mã PIN"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm text-slate-400">Vai trò</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                >
                  <option value="RootAdmin">Quản trị Hệ thống (RootAdmin)</option>
                  <option value="StoreManager">Quản lý Cửa hàng (StoreManager)</option>
                  <option value="Tech">Kỹ thuật viên (Tech)</option>
                  <option value="Security">Bảo vệ (Security)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm text-slate-400">Chi nhánh</label>
                <select
                  value={formData.branchId}
                  onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                >
                  <option value="">-- Tất cả chi nhánh --</option>
                  {branches.map(b => (
                    <option key={b._id} value={b._id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors font-medium shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  <Check size={18} />
                  <span>{modalMode === "create" ? "Thêm mới" : "Cập nhật"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
