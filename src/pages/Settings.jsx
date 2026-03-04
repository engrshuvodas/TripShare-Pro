import React from 'react';
import { useTrip } from '../context/TripContext';
import { Trash2, Package } from 'lucide-react';

const Settings = () => {
    const { data, updateSettings, deleteTrip, resetToDefaults } = useTrip();
    const { settings, templates } = data;

    const handleResetTrip = () => {
        const currentTrip = data.trips[data.trips.length - 1];
        if (currentTrip && window.confirm('Are you absolutely sure? This will delete the current trip and all its expenses.')) {
            deleteTrip(currentTrip.id);
        }
    };

    return (
        <div className="view animate-in">
            <h2 className="h3 mb-xl">App Settings</h2>

            <div className="grid-2 gap-xl mb-xl">
                <div className="card glass p-xl">
                    <h3 className="h4 mb-lg">Appearance & Localization</h3>

                    <div className="form-group mb-md">
                        <label>Theme Preference</label>
                        <select
                            value={settings.theme}
                            onChange={e => updateSettings({ theme: e.target.value })}
                        >
                            <option value="system">Follow System</option>
                            <option value="dark">Always Dark</option>
                            <option value="light">Always Light</option>
                        </select>
                    </div>

                    <div className="form-group mb-md">
                        <label>Default Currency</label>
                        <select
                            value={settings.currency}
                            onChange={e => updateSettings({ currency: e.target.value })}
                        >
                            <option value="INR">Indian Rupee (₹)</option>
                            <option value="USD">US Dollar ($)</option>
                            <option value="EUR">Euro (€)</option>
                        </select>
                    </div>

                    <div className="form-group mb-xl">
                        <label>Timezone</label>
                        <select
                            value={settings.timezone}
                            onChange={e => updateSettings({ timezone: e.target.value })}
                        >
                            <option value="Asia/Kolkata">Asia/Kolkata</option>
                            <option value="UTC">UTC</option>
                        </select>
                    </div>
                </div>

                <div className="card glass p-xl">
                    <h3 className="h4 mb-lg text-danger">Danger Zone</h3>
                    <p className="text-xs text-secondary mb-md">These actions are permanent and cannot be undone. Please be careful.</p>
                    <div className="flex-col gap-sm">
                        <button
                            className="btn-outline w-full text-xs py-sm flex-center gap-xs"
                            style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
                            onClick={handleResetTrip}
                        >
                            <Trash2 size={14} /> Delete Current Trip Data
                        </button>
                        <button
                            className="btn-outline w-full text-xs py-sm flex-center gap-xs"
                            onClick={() => { if (window.confirm('Reset members to default?')) resetToDefaults(); }}
                        >
                            <Package size={14} /> Reset to Demo Members
                        </button>
                    </div>
                </div>
            </div>

            <div className="whatsapp-templates">
                <div className="flex-between mb-lg">
                    <h3 className="h4">WhatsApp Templates</h3>
                    <button className="btn-secondary text-xs py-xs px-md">+ New</button>
                </div>
                <div className="flex-col gap-md">
                    {templates.map(t => (
                        <div key={t.id} className="card glass p-md">
                            <div className="flex-between mb-sm">
                                <strong className="text-sm">{t.name}</strong>
                                <div className="flex-center gap-xs">
                                    <button className="btn-icon"><Trash2 size={14} /></button>
                                </div>
                            </div>
                            <pre className="text-xs text-secondary overflow-hidden" style={{ whiteSpace: 'pre-wrap' }}>{t.body}</pre>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Settings;
