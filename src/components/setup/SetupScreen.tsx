import { useState } from 'react';
import { useStore } from '../../store/useStore';
import type { UserProfile } from '../../types';

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export default function SetupScreen() {
  const setProfile = useStore(s => s.setProfile);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '',
    company: '',
    age: '',
    yearsOfService: '',
    role: '',
    otherActivities: '',
  });

  const handleSubmit = () => {
    const profile: UserProfile = {
      id: generateId(),
      name: form.name,
      company: form.company,
      age: parseInt(form.age) || 0,
      yearsOfService: parseFloat(form.yearsOfService) || 0,
      role: form.role,
      otherActivities: form.otherActivities
        ? form.otherActivities.split(/[,、，]/).map(s => s.trim()).filter(Boolean)
        : [],
      setupCompleted: true,
      morningReminderTime: '07:30',
      eveningReminderTime: '21:00',
      weeklyReflectionDay: 0,
      weeklyReflectionTime: '20:00',
      skillReminderInterval: 'monthly',
    };
    setProfile(profile);
  };

  const fields = [
    { key: 'name', label: 'お名前', placeholder: '山田 太郎', type: 'text', required: true },
    { key: 'company', label: '会社名', placeholder: '株式会社〇〇', type: 'text', required: true },
    { key: 'role', label: '役職', placeholder: 'プロダクトマネージャー', type: 'text', required: true },
    { key: 'age', label: '年齢', placeholder: '30', type: 'number', required: true },
    { key: 'yearsOfService', label: '入社年数', placeholder: '5', type: 'number', required: true },
    { key: 'otherActivities', label: 'その他の活動', placeholder: '副業、読書、英語学習（任意）', type: 'text', required: false },
  ];

  const currentField = fields[step];

  const canNext = !currentField.required || (form[currentField.key as keyof typeof form] as string).trim() !== '';

  const handleNext = () => {
    if (step < fields.length - 1) {
      setStep(s => s + 1);
    } else {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto px-6">
      <div className="flex-1 flex flex-col justify-center">
        {/* Brand */}
        <div className="mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] text-text-muted uppercase mb-2">Personal OS</p>
          <h1 className="font-serif text-3xl font-bold text-text-primary leading-tight">
            あなた自身を<br />一つの会社として
          </h1>
          <p className="mt-4 text-sm text-text-secondary leading-relaxed">
            時間・お金・知識を経営資源として管理し、<br />継続的な成長を支援します。
          </p>
        </div>

        {/* Progress */}
        <div className="flex gap-1 mb-8">
          {fields.map((_, i) => (
            <div
              key={i}
              className={`h-0.5 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-text-primary' : 'bg-border-color'
              }`}
            />
          ))}
        </div>

        {/* Field */}
        <div className="mb-8">
          <label className="block text-xs text-text-muted mb-2 font-medium tracking-wide uppercase">
            {currentField.label}
            {!currentField.required && <span className="ml-2 text-text-muted">（任意）</span>}
          </label>
          <input
            key={currentField.key}
            type={currentField.type}
            value={form[currentField.key as keyof typeof form]}
            onChange={e => setForm(f => ({ ...f, [currentField.key]: e.target.value }))}
            placeholder={currentField.placeholder}
            className="w-full text-xl font-light border-b-2 border-border-color focus:border-text-primary bg-transparent py-3 transition-colors text-text-primary placeholder:text-text-muted"
            onKeyDown={e => e.key === 'Enter' && canNext && handleNext()}
            autoFocus
          />
        </div>

        {/* Button */}
        <button
          onClick={handleNext}
          disabled={!canNext}
          className={`w-full py-4 text-sm font-semibold tracking-wide transition-all rounded-none ${
            canNext
              ? 'bg-text-primary text-white'
              : 'bg-border-color text-text-muted'
          }`}
        >
          {step < fields.length - 1 ? '次へ' : 'はじめる'}
        </button>

        <p className="text-center text-xs text-text-muted mt-4">
          {step + 1} / {fields.length}
        </p>
      </div>
    </div>
  );
}
