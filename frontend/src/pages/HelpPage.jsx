import { Eye, MessageCircle, Send, Ticket } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SelectInput, TextArea, TextInput } from '../components/FormControls';
import { EmptyState, LoadingBlock, Modal, PageHeader, Panel, StatusMessage, ToastStack } from '../components/Ui';
import useToasts from '../hooks/useToasts';
import { createChat, createTicket, getChat, getChats, getFaq, getSystemStatus, getTickets, sendChatMessage } from '../services/helpService';

export default function HelpPage() {
  const [faq, setFaq] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [ticketDetail, setTicketDetail] = useState(null);
  const [status, setStatus] = useState(null);
  const [ticketForm, setTicketForm] = useState({ asunto: '', mensaje: '', prioridad: 'media' });
  const [chatForm, setChatForm] = useState({ asunto: '', mensaje: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { dismiss, showToast, toasts } = useToasts();

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [faqData, ticketData, chatData, statusData] = await Promise.all([
        getFaq().catch(() => []),
        getTickets().catch(() => []),
        getChats().catch(() => []),
        getSystemStatus().catch(() => null),
      ]);
      setFaq(faqData);
      setTickets(ticketData);
      setChats(chatData);
      setStatus(statusData);
    } catch (err) {
      setError(err.message || 'No se pudo cargar ayuda');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const id = window.setTimeout(load, 0);
    return () => window.clearTimeout(id);
  }, []);

  async function submitTicket(event) {
    event.preventDefault();
    await createTicket(ticketForm);
    setTicketForm({ asunto: '', mensaje: '', prioridad: 'media' });
    showToast({ title: 'Ticket creado' });
    await load();
  }

  async function submitChat(event) {
    event.preventDefault();
    const chat = await createChat(chatForm);
    setChatForm({ asunto: '', mensaje: '' });
    setActiveChat(chat);
    showToast({ title: 'Chat creado' });
    await load();
  }

  async function openChat(id) {
    setActiveChat(await getChat(id));
  }

  async function submitMessage(event) {
    event.preventDefault();
    const messages = await sendChatMessage(activeChat.conversacion?.idConversacion || activeChat.idConversacion, message);
    setActiveChat({ ...activeChat, mensajes: messages });
    setMessage('');
    showToast({ title: 'Mensaje enviado' });
  }

  return (
    <>
      <ToastStack toasts={toasts} onDismiss={dismiss} />
      <PageHeader title="Ayuda" description="Centro de soporte con FAQ, tickets y chat asistido por el backend." />
      {error && <StatusMessage type="error">{error}</StatusMessage>}
      {loading ? <LoadingBlock /> : (
        <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <div className="space-y-6">
            <Panel className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-950">FAQ</h2>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">{status?.estado || 'operativo'}</span>
              </div>
              {faq.length === 0 ? <EmptyState title="Sin FAQ" /> : (
                <div className="grid gap-3 md:grid-cols-2">
                  {faq.map((item) => (
                    <article key={item.idFaq || item.id_faq} className="rounded-lg border border-slate-200 p-4">
                      <h3 className="font-bold text-slate-950">{item.pregunta}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{item.respuesta}</p>
                    </article>
                  ))}
                </div>
              )}
            </Panel>

            <Panel className="p-5">
              <h2 className="mb-4 text-lg font-black text-slate-950">Tickets</h2>
              {tickets.length === 0 ? <EmptyState title="Sin tickets" /> : tickets.map((ticket) => (
                <div key={ticket.idTicket || ticket.id_ticket} className="mb-3 rounded-lg border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-950">{ticket.asunto}</p>
                      <p className="text-sm text-slate-500">{ticket.estadoTicket || ticket.estado_ticket} · {ticket.prioridad}</p>
                    </div>
                    <button type="button" onClick={() => setTicketDetail(ticket)} className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50">
                      <Eye size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </Panel>
          </div>

          <div className="space-y-6">
            <Panel className="p-5">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-950"><Ticket size={18} /> Nuevo ticket</h2>
              <form className="space-y-4" onSubmit={submitTicket}>
                <TextInput label="Asunto" value={ticketForm.asunto} onChange={(value) => setTicketForm({ ...ticketForm, asunto: value })} />
                <SelectInput label="Prioridad" value={ticketForm.prioridad} onChange={(value) => setTicketForm({ ...ticketForm, prioridad: value })} options={[{ value: 'baja', label: 'Baja' }, { value: 'media', label: 'Media' }, { value: 'alta', label: 'Alta' }]} />
                <TextArea label="Mensaje" value={ticketForm.mensaje} onChange={(value) => setTicketForm({ ...ticketForm, mensaje: value })} />
                <button className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-black text-white">Crear ticket</button>
              </form>
            </Panel>

            <Panel className="p-5">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-950"><MessageCircle size={18} /> Chat</h2>
              <form className="mb-4 space-y-3" onSubmit={submitChat}>
                <TextInput label="Asunto" value={chatForm.asunto} onChange={(value) => setChatForm({ ...chatForm, asunto: value })} />
                <TextArea label="Mensaje inicial" rows={3} value={chatForm.mensaje} onChange={(value) => setChatForm({ ...chatForm, mensaje: value })} />
                <button className="w-full rounded-lg bg-[#004ac6] px-4 py-3 text-sm font-black text-white">Crear chat</button>
              </form>
              <div className="mb-4 flex flex-wrap gap-2">
                {chats.map((chat) => (
                  <button key={chat.idConversacion || chat.id_conversacion} onClick={() => openChat(chat.idConversacion || chat.id_conversacion)} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700" type="button">
                    {chat.asunto}
                  </button>
                ))}
              </div>
              {activeChat && (
                <div className="space-y-3">
                  <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg bg-slate-50 p-3">
                    {(activeChat.mensajes || []).map((item) => (
                      <div key={item.idMensaje || item.id_mensaje || `${item.remitente}-${item.fechaRegistro}`} className={`rounded-lg p-3 text-sm ${item.remitente === 'bot' ? 'bg-white text-slate-700' : 'bg-blue-600 text-white'}`}>
                        {item.mensaje}
                      </div>
                    ))}
                  </div>
                  <form className="flex gap-2" onSubmit={submitMessage}>
                    <input value={message} onChange={(event) => setMessage(event.target.value)} className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none" />
                    <button className="rounded-lg bg-slate-900 px-3 text-white"><Send size={16} /></button>
                  </form>
                </div>
              )}
            </Panel>
          </div>
        </div>
      )}
      <Modal open={Boolean(ticketDetail)} onClose={() => setTicketDetail(null)} title={ticketDetail?.asunto || 'Ticket'} description={`${ticketDetail?.estadoTicket || ticketDetail?.estado_ticket || ''} · ${ticketDetail?.prioridad || ''}`}>
        <p className="text-sm leading-6 text-slate-600">{ticketDetail?.mensaje || ticketDetail?.descripcion || 'Sin detalle disponible.'}</p>
      </Modal>
    </>
  );
}
