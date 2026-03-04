import React, { useState } from 'react';
import { useTrip } from '../context/TripContext';
import { Plus, Edit2, Trash2, UserPlus } from 'lucide-react';
import Modal from '../components/Modal';

const Members = () => {
    const { data, addMember, updateMember, deleteMember, resetToDefaults } = useTrip();
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState(null);

    const [formData, setFormData] = useState({ name: '', whatsapp: '', photo: '' });

    const handleOpenModal = (member = null) => {
        if (member) {
            setEditingMember(member);
            setFormData({ name: member.name, whatsapp: member.whatsapp, photo: member.photo || '' });
        } else {
            setEditingMember(null);
            setFormData({ name: '', whatsapp: '', photo: '' });
        }
        setModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingMember) {
            updateMember(editingMember.id, formData);
        } else {
            addMember(formData);
        }
        setModalOpen(false);
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (re) => setFormData(prev => ({ ...prev, photo: re.target.result }));
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="view animate-in">
            <div className="flex-between mb-xl">
                <h2 className="h3">Member Management</h2>
                <button className="btn-primary flex-center gap-xs px-lg py-md" onClick={() => handleOpenModal()}>
                    <Plus size={18} /> Add New
                </button>
            </div>

            <div className="grid-3 gap-md">
                {data.members.map(m => (
                    <div key={m.id} className="card glass flex-between p-md" style={{ borderRadius: 'var(--radius-md)' }}>
                        <div className="flex-center gap-md" style={{ cursor: 'pointer' }} onClick={() => handleOpenModal(m)}>
                            {m.photo ? (
                                <img src={m.photo} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} alt={m.name} />
                            ) : (
                                <div style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--glass-border)' }} className="flex-center">👤</div>
                            )}
                            <div>
                                <strong>{m.name}</strong>
                                <p className="text-secondary" style={{ fontSize: '0.75rem' }}>{m.whatsapp}</p>
                            </div>
                        </div>
                        <div className="flex-center gap-sm">
                            <button className="btn-icon" onClick={() => handleOpenModal(m)}><Edit2 size={14} /></button>
                            <button className="btn-icon text-danger" onClick={() => deleteMember(m.id)}><Trash2 size={14} /></button>
                        </div>
                    </div>
                ))}

                {data.members.length === 0 && (
                    <div className="col-span-full flex-center flex-col text-center py-xl bg-glass" style={{ minHeight: '40vh', borderRadius: 'var(--radius-lg)' }}>
                        <div className="glass p-lg mb-lg flex-center" style={{ borderRadius: '50%', width: 80, height: 80, fontSize: '2rem' }}>👥</div>
                        <h3 className="h3 mb-sm">No Members Yet</h3>
                        <p className="text-secondary text-sm max-w-xs mb-lg">Add your travel buddies to start splitting expenses with them.</p>
                        <button className="btn-outline flex-center gap-sm py-md px-xl" onClick={resetToDefaults}>
                            <UserPlus size={18} /> Load Demo Members
                        </button>
                    </div>
                )}
            </div>

            <Modal
                title={editingMember ? 'Edit Member' : 'Add New Member'}
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
            >
                <form onSubmit={handleSubmit} className="flex-col gap-lg">
                    <div className="form-group">
                        <label>Member Name</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Alex Graham"
                            value={formData.name}
                            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        />
                    </div>
                    <div className="form-group">
                        <label>WhatsApp Number</label>
                        <input
                            type="tel"
                            required
                            placeholder="e.g. 919876543210"
                            value={formData.whatsapp}
                            onChange={e => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                        />
                    </div>
                    <div className="form-group">
                        <label>Profile Photo</label>
                        <input type="file" accept="image/*" className="text-xs" onChange={handlePhotoChange} />
                        {formData.photo && (
                            <div className="mt-sm flex-center">
                                <img src={formData.photo} style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover' }} alt="Preview" />
                            </div>
                        )}
                    </div>
                    <button type="submit" className="btn-primary w-full py-md mt-md">✨ {editingMember ? 'Update Member' : 'Save Member'}</button>
                </form>
            </Modal>
        </div>
    );
};

export default Members;
