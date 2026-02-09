import React, { useEffect } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';

export default function QuestionFormModal({ initial = {}, onSave, onClose }) {
  const [form, setForm] = React.useState({
    text: '',
    points: 10,
    question_type: 'mcq',
    category: 'logic',
    choices: [
      { text: '', is_correct: false, order: 1 },
      { text: '', is_correct: false, order: 2 }
    ],
    ...initial
  });

  useEffect(() => {
    if (initial?.id) {
      setForm((prev) => ({ ...prev, ...initial }));
    }
  }, [initial]);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const updateChoice = (index, patch) => {
    const next = [...form.choices];
    next[index] = { ...next[index], ...patch, order: index + 1 };
    setForm((prev) => ({ ...prev, choices: next }));
  };

  const addChoice = () => {
    setForm((prev) => ({
      ...prev,
      choices: [...prev.choices, { text: '', is_correct: false, order: prev.choices.length + 1 }]
    }));
  };

  const removeChoice = (index) => {
    const next = form.choices.filter((_, i) => i !== index).map((c, i) => ({ ...c, order: i + 1 }));
    setForm((prev) => ({ ...prev, choices: next }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const payload = {
      text: form.text,
      points: Number(form.points || 0),
      question_type: form.question_type,
      category: form.category,
      choices: form.question_type === 'mcq' ? form.choices : []
    };
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="surface w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900">مدیریت سوال</h3>
          <Button variant="ghost" onClick={onClose}>بستن</Button>
        </div>
        <form className="space-y-4" onSubmit={onSubmit}>
          <Textarea
            rows={4}
            placeholder="متن سوال"
            value={form.text}
            onChange={(e) => setField('text', e.target.value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <div className="text-xs text-slate-500">نوع سوال</div>
              <Select value={form.question_type} onChange={(e) => setField('question_type', e.target.value)}>
                <option value="mcq">تستی</option>
                <option value="text">تشریحی</option>
              </Select>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-slate-500">دسته‌بندی</div>
              <Select value={form.category} onChange={(e) => setField('category', e.target.value)}>
                <option value="memory">حافظه</option>
                <option value="focus">تمرکز</option>
                <option value="logic">منطق</option>
              </Select>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-slate-500">امتیاز</div>
              <Input
                type="number"
                min="1"
                value={form.points}
                onChange={(e) => setField('points', e.target.value)}
                placeholder="امتیاز"
              />
            </div>
          </div>

          {form.question_type === 'mcq' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-700">گزینه‌ها</div>
                <Button type="button" variant="secondary" onClick={addChoice}>افزودن گزینه</Button>
              </div>
              {form.choices.map((choice, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    value={choice.text}
                    onChange={(e) => updateChoice(index, { text: e.target.value })}
                    placeholder={`گزینه ${index + 1}`}
                  />
                  <label className="flex items-center gap-2 text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={choice.is_correct}
                      onChange={(e) => updateChoice(index, { is_correct: e.target.checked })}
                    />
                    صحیح
                  </label>
                  {form.choices.length > 2 && (
                    <Button type="button" variant="ghost" onClick={() => removeChoice(index)}>حذف</Button>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>انصراف</Button>
            <Button type="submit">ذخیره سوال</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
