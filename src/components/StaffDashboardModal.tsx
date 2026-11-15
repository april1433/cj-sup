import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit2, ShieldCheck, MessageSquare, Package, ArrowRightLeft, Check, Clock, AlertCircle } from 'lucide-react';
import { IPhone, Conversation, TradeInInquiry, UserProfile, IPhoneStatus, IPhoneCondition } from '../types';
import { IPHONE_MODELS, STORAGE_OPTIONS } from '../data/mockData';
import { fetchIPhones, saveIPhone, deleteIPhone, fetchConversations, fetchTradeIns } from '../lib/supabase';

interface StaffDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSelectConversationForChat: (conv: Conversation) => void;
  onInventoryUpdated: () => void;
}

export const StaffDashboardModal: React.FC<StaffDashboardModalProps> = ({
  isOpen,
  onClose,
  user,
  onSelectConversationForChat,
  onInventoryUpdated,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'inventory' | 'chats' | 'tradeins'>('inventory');
  const [iphones, setIPhones] = useState<IPhone[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [tradeIns, setTradeIns] = useState<TradeInInquiry[]>([]);
  const [loading, setLoading] = useState(false);

  // Add/Edit iPhone state
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [model, setModel] = useState<string>(IPHONE_MODELS[0]);
  const [storage, setStorage] = useState<string>('256GB');
  const [color, setColor] = useState<string>('Natural Titanium');
  const [condition, setCondition] = useState<IPhoneCondition>('Like New');
  const [batteryHealth, setBatteryHealth] = useState<number>(100);
  const [price, setPrice] = useState<number>(999);
  const [originalPrice, setOriginalPrice] = useState<number>(1199);
  const [status, setStatus] = useState<IPhoneStatus>('available');
  const [imageUrl, setImageUrl] = useState<string>('https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80');
  const [description, setDescription] = useState<string>('Certified iPhone, tested and guaranteed.');

  const loadData = async () => {
    setLoading(true);
    try {
      const [phonesList, convsList, tradeList] = await Promise.all([
        fetchIPhones(),
        fetchConversations(user),
        fetchTradeIns(),
      ]);
      setIPhones(phonesList);
      setConversations(convsList);
      setTradeIns(tradeList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setModel(IPHONE_MODELS[0]);
    setStorage('256GB');
    setColor('Natural Titanium');
    setCondition('Like New');
    setBatteryHealth(100);
    setPrice(999);
    setOriginalPrice(1199);
    setStatus('available');
    setImageUrl('https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80');
    setDescription('Certified iPhone, tested and guaranteed.');
  };

  const handleStartEdit = (phone: IPhone) => {
    setIsEditing(true);
    setEditingId(phone.id);
    setModel(phone.model);
    setStorage(phone.storage);
    setColor(phone.color);
    setCondition(phone.condition);
    setBatteryHealth(phone.battery_health);
    setPrice(phone.price);
    setOriginalPrice(phone.original_price || phone.price + 100);
    setStatus(phone.status);
    setImageUrl(phone.images[0] || '');
    setDescription(phone.description);
  };

  const handleSavePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const phonePayload = {
        model,
        storage,
        color,
        condition,
        battery_health: Number(batteryHealth),
        price: Number(price),
        original_price: Number(originalPrice),
        status,
        images: [imageUrl],
        description,
        carrier_status: 'Factory Unlocked',
        includes: ['Original Box', 'Cable'],
        featured: false,
      };

      await saveIPhone(phonePayload, editingId || undefined);
      resetForm();
      await loadData();
      onInventoryUpdated();
    } catch (err) {
      console.error(err);
      alert('Failed to save iPhone.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this listing?')) {
      await deleteIPhone(id);
      await loadData();
      onInventoryUpdated();
    }
  };

  const handleStatusChange = async (phone: IPhone, newStatus: IPhoneStatus) => {
    await saveIPhone({ ...phone, status: newStatus }, phone.id);
    await loadData();
    onInventoryUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] shadow-2xl overflow-hidden border border-gray-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">
                Store Owner & Staff Control Center
              </h2>
              <p className="text-xs text-gray-500">
                Manage inventory listings, customer live chat threads, and sell trade-in offers.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-gray-200 bg-white px-6 text-xs font-bold text-gray-500">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`py-3.5 px-4 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'inventory' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-gray-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Manage Inventory ({iphones.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('chats')}
            className={`py-3.5 px-4 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'chats' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-gray-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Customer Chats ({conversations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tradeins')}
            className={`py-3.5 px-4 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'tradeins' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-gray-900'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Sell Inquiries ({tradeIns.length})</span>
          </button>
        </div>

        {/* Tab 1: Inventory Management */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'inventory' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-gray-900">Current iPhone Inventory</h3>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add iPhone to Stock</span>
                </button>
              </div>

              {/* Add / Edit Form Card */}
              {isEditing && (
                <form onSubmit={handleSavePhone} className="mb-6 p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs space-y-3">
                  <div className="flex items-center justify-between font-bold text-gray-900 mb-2">
                    <span>{editingId ? 'Edit iPhone' : 'Add New iPhone to Stock'}</span>
                    <button type="button" onClick={resetForm} className="text-gray-400 hover:text-gray-600">Cancel</button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Model</label>
                      <select
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="w-full p-2 border rounded-lg bg-white"
                      >
                        {IPHONE_MODELS.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Storage</label>
                      <select
                        value={storage}
                        onChange={(e) => setStorage(e.target.value)}
                        className="w-full p-2 border rounded-lg bg-white"
                      >
                        {STORAGE_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Color</label>
                      <input
                        type="text"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-full p-2 border rounded-lg bg-white"
                        placeholder="e.g. Desert Titanium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Condition</label>
                      <select
                        value={condition}
                        onChange={(e) => setCondition(e.target.value as IPhoneCondition)}
                        className="w-full p-2 border rounded-lg bg-white"
                      >
                        <option value="Brand New (Sealed)">Brand New (Sealed)</option>
                        <option value="Like New">Like New</option>
                        <option value="Good Condition">Good Condition</option>
                        <option value="Fair / Minor Wear">Fair / Minor Wear</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Battery Health (%)</label>
                      <input
                        type="number"
                        min="70"
                        max="100"
                        value={batteryHealth}
                        onChange={(e) => setBatteryHealth(Number(e.target.value))}
                        className="w-full p-2 border rounded-lg bg-white"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Price (₱)</label>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        className="w-full p-2 border rounded-lg bg-white"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Original Price (₱)</label>
                      <input
                        type="number"
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(Number(e.target.value))}
                        className="w-full p-2 border rounded-lg bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Photo Image URL</label>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full p-2 border rounded-lg bg-white"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Description</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full p-2 border rounded-lg bg-white"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 rounded-lg border text-gray-700 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-lg bg-blue-600 text-white font-bold"
                    >
                      {editingId ? 'Update Phone' : 'Publish to Store'}
                    </button>
                  </div>
                </form>
              )}

              {/* iPhone List Table */}
              <div className="space-y-2">
                {iphones.map((phone) => (
                  <div key={phone.id} className="p-3 rounded-xl border border-gray-200 flex items-center justify-between gap-3 text-xs hover:bg-gray-50 transition">
                    <img
                      src={phone.images[0]}
                      alt={phone.model}
                      className="w-12 h-12 object-contain rounded-lg border p-1 bg-white shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 truncate">
                        {phone.model} ({phone.storage})
                      </div>
                      <div className="text-gray-500 text-[11px]">
                        {phone.color} • Battery: {phone.battery_health}% • {phone.condition}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-black text-gray-900 text-sm">
                        ₱{phone.price.toLocaleString()}
                      </div>
                      {/* Status toggle selector */}
                      <select
                        value={phone.status}
                        onChange={(e) => handleStatusChange(phone, e.target.value as IPhoneStatus)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          phone.status === 'available' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          phone.status === 'reserved' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-gray-100 text-gray-600 border-gray-300'
                        }`}
                      >
                        <option value="available">Available</option>
                        <option value="reserved">Reserved</option>
                        <option value="sold">Sold</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleStartEdit(phone)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-gray-100"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(phone.id)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-gray-100"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Customer Live Chats */}
          {activeTab === 'chats' && (
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-gray-900 mb-2">Customer Messages</h3>
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-xs">
                  No active customer conversations yet. When customers click "Inquire / Buy" or "Sell", their chats will show up here.
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => {
                      onSelectConversationForChat(conv);
                      onClose();
                    }}
                    className="p-4 rounded-2xl border border-gray-200 hover:border-blue-500 hover:shadow-xs cursor-pointer transition flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      {conv.customer_avatar ? (
                        <img src={conv.customer_avatar} alt={conv.customer_name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                          {conv.customer_name[0] || 'C'}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-gray-900">{conv.customer_name}</div>
                        <div className="text-gray-500 text-[11px] truncate max-w-sm">
                          {conv.last_message_text || conv.subject}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 block mb-1">
                        {new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-[11px]">
                        Open Chat
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 3: Sell Trade-In Inquiries */}
          {activeTab === 'tradeins' && (
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-gray-900 mb-2">Trade-In Submissions</h3>
              {tradeIns.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-xs">
                  No sell/trade-in inquiries submitted yet.
                </div>
              ) : (
                tradeIns.map((t) => (
                  <div key={t.id} className="p-4 rounded-2xl border border-gray-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-gray-900 text-sm">
                        {t.model} ({t.storage})
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold">
                        Quote: ₱{t.estimated_offer_min.toLocaleString()} - ₱{t.estimated_offer_max.toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-gray-600 bg-gray-50 p-2.5 rounded-xl">
                      <div>Battery: <strong className="text-gray-900">{t.battery_health}%</strong></div>
                      <div>Screen: <strong className="text-gray-900">{t.screen_condition}</strong></div>
                      <div>Body: <strong className="text-gray-900">{t.cosmetic_condition}</strong></div>
                      <div>User: <strong className="text-gray-900">{t.user_name}</strong></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
