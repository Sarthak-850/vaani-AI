import React, { useState } from 'react';
import { X, UserPlus, Users, HeartPulse } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import toast from 'react-hot-toast';

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultHouseholdId?: string;
}

export const AddPatientModal: React.FC<AddPatientModalProps> = ({
  isOpen,
  onClose,
  defaultHouseholdId
}) => {
  const { households, createPatient } = useApp();

  const [householdId, setHouseholdId] = useState<string>(defaultHouseholdId || (households[0]?.id || ''));
  const [name, setName] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('female');
  const [patientCategory, setPatientCategory] = useState<string>('pregnant_woman');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter patient name.');
      return;
    }
    if (!householdId) {
      toast.error('Please select a household.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createPatient({
        householdId,
        name: name.trim(),
        age: age ? parseFloat(age) : null,
        gender,
        patientCategory
      });
      toast.success(`Patient ${name} added to records!`);
      onClose();
      // Reset form
      setName('');
      setAge('');
    } catch (e: any) {
      toast.error(e.message || 'Failed to add patient.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#08131B] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-500/10 text-[#00D6C7]">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Add Patient</h3>
              <p className="text-xs text-slate-400">Register new community member to household</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Household
            </label>
            <select
              value={householdId}
              onChange={(e) => setHouseholdId(e.target.value)}
              className="w-full bg-[#050B10] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500/50"
            >
              {households.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.familyName} ({h.village})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Geeta Yadav, Rahul Sharma"
              className="w-full bg-[#050B10] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Age (years or decimal for months)
              </label>
              <input
                type="number"
                step="0.1"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 24 or 0.8"
                className="w-full bg-[#050B10] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full bg-[#050B10] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500/50"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Healthcare Category
            </label>
            <select
              value={patientCategory}
              onChange={(e) => setPatientCategory(e.target.value)}
              className="w-full bg-[#050B10] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500/50"
            >
              <option value="pregnant_woman">Pregnant Woman (ANC)</option>
              <option value="lactating_mother">Lactating Mother (PNC)</option>
              <option value="infant">Infant (Under 1 year)</option>
              <option value="child">Child (1–5 years)</option>
              <option value="adolescent">Adolescent (10–19 years)</option>
              <option value="adult">Adult</option>
              <option value="elderly">Elderly Senior Citizen</option>
            </select>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-5 py-2 rounded-xl bg-[#00D6C7] hover:bg-[#16D8D0] disabled:opacity-50 text-[#050B10] text-xs font-bold transition-all shadow-lg shadow-teal-500/25 active:scale-95"
            >
              {isSubmitting ? 'Saving...' : 'Add Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
