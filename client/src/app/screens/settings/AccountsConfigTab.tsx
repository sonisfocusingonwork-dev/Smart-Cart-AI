import React, { useState, useEffect } from "react";
import { api } from "../../api";
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
  role: "RootAdmin" | "StoreManager" | "Tech" | "Security" | "GatewayChecker";
  branchId?: Branch | null;
}

export function AccountsConfigTab() {
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
      const mockGatewayChecker: Staff = {
        _id: "mock-gateway-1",
        name: "Trần Văn Cổng",
        phoneNumber: "0999888777",
        role: "GatewayChecker"
      };
      setStaffList([mockGatewayChecker, ...staffRes]);
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
        delete payload.pinCode;
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
        return <span className="px-3 py-1 bg-[#D1FAE5] text-[#15803D] border border-[#15803D]/20 font-bold rounded-full text-xs whitespace-nowrap">Quản trị Hệ thống</span>;
      case "GatewayChecker":
        return <span className="px-3 py-1 bg-[#E0F2FE] text-[#0369A1] border border-[#0369A1]/20 font-bold rounded-full text-xs whitespace-nowrap">Kiểm soát cổng</span>;
      case "StoreManager":
        return <span className="px-3 py-1 bg-[#F1F5F9] text-[#475569] border border-slate-200 font-bold rounded-full text-xs whitespace-nowrap">Quản lý Cửa hàng</span>;
      case "Tech":
        return <span className="px-3 py-1 bg-[#F1F5F9] text-[#475569] border border-slate-200 font-bold rounded-full text-xs whitespace-nowrap">Kỹ thuật viên</span>;
      case "Security":
        return <span className="px-3 py-1 bg-[#F1F5F9] text-[#475569] border border-slate-200 font-bold rounded-full text-xs whitespace-nowrap">Bảo vệ</span>;
      default:
        return <span className="px-3 py-1 bg-[#F1F5F9] text-[#475569] border border-slate-200 font-bold rounded-full text-xs whitespace-nowrap">{role}</span>;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#15803D]">Tài khoản & Phân quyền</h2>
          <p className="text-[#64748B] text-sm mt-1">Quản lý tài khoản, phân quyền và chi nhánh của nhân viên.</p>
        </div>
        <button
          onClick={() => handleOpenModal("create")}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#15803D] hover:bg-[#15803D]/90 text-white rounded-2xl font-bold transition-all shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] shadow-[#15803D]/20"
        >
          <Plus size={18} />
          <span>Thêm Nhân Viên</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex flex-col items-center justify-center text-center">
          <ShieldAlert className="text-red-500 mb-2" size={24} />
          <p className="text-red-600 text-sm font-semibold">{error}</p>
          <button onClick={fetchData} className="mt-4 px-4 py-2 bg-white text-red-600 rounded-xl border border-red-200 hover:bg-red-50 transition-colors font-bold text-xs shadow-sm">
            Thử lại
          </button>
        </div>
      )}

      {!error && (
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)]">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <th className="p-4 text-xs font-black text-[#94A3B8] uppercase tracking-wider">Nhân viên</th>
                  <th className="p-4 text-xs font-black text-[#94A3B8] uppercase tracking-wider">SĐT / Username</th>
                  <th className="p-4 text-xs font-black text-[#94A3B8] uppercase tracking-wider">Vai trò</th>
                  <th className="p-4 text-xs font-black text-[#94A3B8] uppercase tracking-wider">Chi nhánh</th>
                  <th className="p-4 text-xs font-black text-[#94A3B8] uppercase tracking-wider text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[#94A3B8] text-sm font-semibold">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : staffList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[#94A3B8] text-sm font-semibold">
                      Chưa có nhân viên nào trong hệ thống.
                    </td>
                  </tr>
                ) : (
                  staffList.map((staff) => (
                    <tr key={staff._id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-2xl bg-[#15803D]/10 text-[#15803D] flex items-center justify-center font-bold text-sm shrink-0 uppercase shadow-sm">
                            {staff.name.charAt(0)}
                          </div>
                          <span className="font-bold text-[#334155]">{staff.name}</span>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-[#64748B]">{staff.phoneNumber}</td>
                      <td className="p-4">{renderRoleBadge(staff.role)}</td>
                      <td className="p-4 font-semibold text-[#64748B]">{staff.branchId?.name || <span className="text-[#94A3B8] italic">Toàn hệ thống</span>}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal("edit", staff)}
                            className="p-2 text-[#64748B] hover:text-[#15803D] hover:bg-[#15803D]/10 rounded-xl transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(staff._id)}
                            className="p-2 text-[#64748B] hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                            title="Xóa tài khoản"
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
          <div className="absolute inset-0 bg-[#334155]/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0]">
              <h3 className="text-xl font-black text-[#334155]">
                {modalMode === "create" ? "Thêm Nhân Viên" : "Cập nhật Thông tin"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-[#94A3B8] hover:bg-slate-100 hover:text-[#334155] transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#334155]">Tên nhân viên</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl px-4 py-3 text-sm font-semibold text-[#334155] focus:outline-none focus:border-[#15803D] focus:bg-white transition-all"
                  placeholder="Ví dụ: Nguyễn Văn A"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#334155]">SĐT / Username</label>
                <input
                  type="text"
                  required
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl px-4 py-3 text-sm font-semibold text-[#334155] focus:outline-none focus:border-[#15803D] focus:bg-white transition-all"
                  placeholder="Nhập SĐT hoặc tài khoản"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#334155]">
                  Mã PIN {modalMode === 'edit' && <span className="text-[#94A3B8] font-normal">(Để trống nếu không đổi)</span>}
                </label>
                <input
                  type="password"
                  required={modalMode === 'create'}
                  value={formData.pinCode}
                  onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl px-4 py-3 text-sm font-semibold text-[#334155] focus:outline-none focus:border-[#15803D] focus:bg-white transition-all"
                  placeholder="Nhập mã PIN 4-6 số"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[#334155]">Vai trò</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl px-4 py-3 text-sm font-semibold text-[#334155] focus:outline-none focus:border-[#15803D] transition-all appearance-none"
                  >
                    <option value="RootAdmin">Quản trị viên</option>
                    <option value="StoreManager">Quản lý CH</option>
                    <option value="Tech">Kỹ thuật</option>
                    <option value="Security">Bảo vệ</option>
                    <option value="GatewayChecker">Nhân viên kiểm soát cổng</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[#334155]">Chi nhánh</label>
                  <select
                    value={formData.branchId}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl px-4 py-3 text-sm font-semibold text-[#334155] focus:outline-none focus:border-[#15803D] transition-all appearance-none"
                  >
                    <option value="">Tất cả</option>
                    {branches.map(b => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#334155] rounded-2xl transition-colors font-bold text-sm shadow-sm"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-[#15803D] hover:bg-[#15803D]/90 text-white rounded-2xl transition-colors font-bold text-sm shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] flex items-center justify-center gap-2"
                >
                  <Check size={18} />
                  <span>{modalMode === "create" ? "Xác nhận thêm" : "Lưu thay đổi"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
