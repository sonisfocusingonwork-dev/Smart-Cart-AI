import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useSocket } from '../hooks/useSocket';
import { ShieldAlert, CheckCircle, Clock, MapPin, MonitorPlay, MessageSquare } from 'lucide-react';

interface Ticket {
  _id: string;
  cartId: string;
  issueType: 'hardware' | 'assistance';
  status: 'open' | 'resolved';
  locationZone: string;
  createdAt: string;
}

export const HelpdeskTab = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (!socket) return;
    
    const handleNewTicket = (newTicket: Ticket) => {
      setTickets(prev => [newTicket, ...prev]);
    };

    socket.on('admin-new-ticket', handleNewTicket);

    return () => {
      socket.off('admin-new-ticket', handleNewTicket);
    };
  }, [socket]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await api.getTickets();
      setTickets(data);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await api.updateTicketStatus(id, 'resolved');
      setTickets(prev => prev.map(t => t._id === id ? { ...t, status: 'resolved' } : t));
    } catch (err) {
      console.error('Failed to resolve ticket:', err);
    }
  };

  const openTickets = tickets.filter(t => t.status === 'open');
  const resolvedTickets = tickets.filter(t => t.status === 'resolved');

  const TicketCard = ({ ticket }: { ticket: Ticket }) => (
    <div className={`p-4 rounded-xl border ${ticket.status === 'open' ? 'bg-[#1E293B] border-orange-500/30' : 'bg-[#0F172A] border-white/5 opacity-70'} flex flex-col gap-3 relative`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${ticket.issueType === 'hardware' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
            {ticket.issueType === 'hardware' ? <MonitorPlay size={16} /> : <MessageSquare size={16} />}
          </div>
          <div>
            <h4 className="text-white font-bold text-sm uppercase">{ticket.cartId}</h4>
            <span className="text-[10px] text-slate-400 font-semibold">{new Date(ticket.createdAt).toLocaleTimeString('vi-VN')} - {new Date(ticket.createdAt).toLocaleDateString('vi-VN')}</span>
          </div>
        </div>
        <div className={`px-2 py-1 rounded text-[10px] font-black uppercase ${ticket.status === 'open' ? 'bg-orange-500/20 text-orange-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
          {ticket.status === 'open' ? 'MỚI TẠO' : 'ĐÃ XỬ LÝ'}
        </div>
      </div>
      
      <div className="flex items-center gap-4 text-xs text-slate-300">
        <div className="flex items-center gap-1.5">
          <MapPin size={14} className="text-slate-500" />
          <span>{ticket.locationZone}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ShieldAlert size={14} className="text-slate-500" />
          <span>{ticket.issueType === 'hardware' ? 'Lỗi phần cứng' : 'Cần hỗ trợ'}</span>
        </div>
      </div>

      {ticket.status === 'open' && (
        <button
          onClick={() => handleResolve(ticket._id)}
          className="mt-2 w-full py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2"
        >
          <CheckCircle size={14} />
          XÁC NHẬN ĐÃ XỬ LÝ
        </button>
      )}
    </div>
  );

  if (loading) {
    return <div className="p-6 text-slate-400">Đang tải trung tâm hỗ trợ...</div>;
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-black text-white uppercase tracking-wide">Trung Tâm Hỗ Trợ (Helpdesk)</h2>
        <p className="text-sm text-slate-400 mt-1">Giám sát và xử lý yêu cầu hỗ trợ từ xe đẩy theo thời gian thực.</p>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden">
        {/* Open Tickets Column */}
        <div className="flex flex-col bg-black/20 rounded-2xl border border-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-orange-500/10 flex items-center justify-between">
            <h3 className="text-sm font-bold text-orange-400 flex items-center gap-2">
              <Clock size={16} />
              CẦN XỬ LÝ NGAY
            </h3>
            <span className="bg-orange-500 text-white text-xs font-black px-2 py-0.5 rounded-full">{openTickets.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {openTickets.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-sm font-semibold">Không có yêu cầu nào cần xử lý.</div>
            ) : (
              openTickets.map(ticket => <TicketCard key={ticket._id} ticket={ticket} />)
            )}
          </div>
        </div>

        {/* Resolved Tickets Column */}
        <div className="flex flex-col bg-black/20 rounded-2xl border border-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-emerald-500/10 flex items-center justify-between">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <CheckCircle size={16} />
              ĐÃ GIẢI QUYẾT
            </h3>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-black px-2 py-0.5 rounded-full">{resolvedTickets.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {resolvedTickets.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-sm font-semibold">Chưa có yêu cầu nào được xử lý.</div>
            ) : (
              resolvedTickets.map(ticket => <TicketCard key={ticket._id} ticket={ticket} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
