import React, { useState } from 'react';
import { useTrip } from '../context/TripContext';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, Check } from 'lucide-react';

const CreateTrip = () => {
    const { data, addTrip, resetToDefaults } = useTrip();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        location: '',
        startDate: '',
        endDate: '',
        memberIds: []
    });

    const handleMemberToggle = (id) => {
        setFormData(prev => ({
            ...prev,
            memberIds: prev.memberIds.includes(id)
                ? prev.memberIds.filter(mid => mid !== id)
                : [...prev.memberIds, id]
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.memberIds.length === 0) {
            alert('Please select at least one member!');
            return;
        }
        addTrip(formData);
        navigate('/');
    };

    return (
        <div className="view animate-in max-w-lg mx-auto">
            <div className="flex-col gap-md mb-xl text-center">
                <h2 className="h2">Plan Your Adventure</h2>
                <p className="text-secondary">Fill in the details to start tracking expenses for your next big trip.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex-col gap-lg">
                <div className="card glass p-xl flex-col gap-lg">
                    <div className="form-group">
                        <label className="flex-center gap-xs">
                            <span>Trip Name</span>
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Goa Beach Trip 2024"
                            value={formData.name}
                            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        />
                    </div>

                    <div className="form-group">
                        <label className="flex-center gap-xs">
                            <MapPin size={14} /> <span>Location</span>
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Goa, India"
                            value={formData.location}
                            onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        />
                    </div>

                    <div className="grid-2 gap-md">
                        <div className="form-group">
                            <label className="flex-center gap-xs">
                                <Calendar size={14} /> <span>Start Date</span>
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.startDate}
                                onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                            />
                        </div>
                        <div className="form-group">
                            <label className="flex-center gap-xs">
                                <Calendar size={14} /> <span>End Date</span>
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.endDate}
                                onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                            />
                        </div>
                    </div>
                </div>

                <div className="card glass p-xl">
                    <div className="flex-between mb-lg">
                        <h3 className="h4 flex-center gap-xs">
                            <Users size={18} /> <span>Select Members</span>
                        </h3>
                        <span className="text-xs text-muted">{formData.memberIds.length} Selected</span>
                    </div>

                    <div className="grid-2 gap-sm" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {data.members.map(m => (
                            <div
                                key={m.id}
                                className={`member-chip-react p-sm glass flex-center gap-sm cursor-pointer ${formData.memberIds.includes(m.id) ? 'active' : ''}`}
                                onClick={() => handleMemberToggle(m.id)}
                                style={{
                                    borderRadius: 'var(--radius-md)',
                                    border: formData.memberIds.includes(m.id) ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                                    background: formData.memberIds.includes(m.id) ? 'rgba(244, 63, 94, 0.1)' : ''
                                }}
                            >
                                {m.photo ? (
                                    <img src={m.photo} style={{ width: 24, height: 24, borderRadius: '50%' }} alt={m.name} />
                                ) : (
                                    <div className="avatar-xs flex-center">👤</div>
                                )}
                                <span className="text-xs font-bold flex-1">{m.name}</span>
                                {formData.memberIds.includes(m.id) && <Check size={14} className="text-primary" />}
                            </div>
                        ))}

                        {data.members.length === 0 && (
                            <div className="col-span-full p-lg glass text-center" style={{ borderRadius: 'var(--radius-md)' }}>
                                <p className="text-secondary text-sm mb-md">No members found.</p>
                                <button type="button" className="btn-outline py-xs px-md text-xs" onClick={resetToDefaults}>📦 Load Demo Members</button>
                            </div>
                        )}
                    </div>
                </div>

                <button type="submit" className="btn-primary py-lg px-xl text-md font-bold shadow-lg">🚀 Launch Trip</button>
            </form>
        </div>
    );
};

export default CreateTrip;
