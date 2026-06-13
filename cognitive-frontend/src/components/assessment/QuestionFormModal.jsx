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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="surface w-full max-w-2xl p-5 sm:p-6 my-4 max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl border border-neutral-200/80">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-neutral-200/80">
          <h3 className="text-base sm:text-lg font-bold text-primary">مدیریت سوال</h3>
          <Button variant="ghost" onClick={onClose}>بستن</Button>
        </div>
        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label">متن سوال</label>
            <Textarea rows={4} placeholder="متن سوال را بنویسید..." value={form.text} onChange={(e) => setField('text', e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-group">
              <label className="form-label">نوع سوال</label>
              <Select value={form.question_type} onChange={(e) => setField('question_type', e.target.value)}>
                <option value="mcq">تستی</option>
                <option value="text">تشریحی</option>
              </Select>
            </div>
            <div className="form-group">
              <label className="form-label">دسته‌بندی</label>
              <Select value={form.category} onChange={(e) => setField('category', e.target.value)}>
                <option value="memory">حافظه</option>
                <option value="focus">تمرکز</option>
                <option value="logic">منطق</option>
              </Select>
            </div>
            <div className="form-group">
              <label className="form-label">امتیاز</label>
              <Input type="number" min="1" value={form.points} onChange={(e) => setField('points', e.target.value)} placeholder="۱۰" />
            </div>
          </div>

          {form.question_type === 'mcq' && (
            <div className="space-y-3 rounded-xl bg-primary-soft/40 p-4 border border-primary/10">
              <div className="flex items-center justify-between">
                <span className="form-label mb-0">گزینه‌ها</span>
                <Button type="button" variant="secondary" onClick={addChoice}>افزودن گزینه</Button>
              </div>
              {form.choices.map((choice, index) => (
                <div key={index} className="flex gap-2 items-center p-2 rounded-lg bg-white/90 border border-primary/10 shadow-sm">
                  <Input
                    value={choice.text}
                    onChange={(e) => updateChoice(index, { text: e.target.value })}
                    placeholder={`گزینه ${index + 1}`}
                    className="flex-1 min-w-0"
                  />
                  <label className="flex items-center gap-2 text-xs text-neutral-600 shrink-0 cursor-pointer">
                    <input type="checkbox" checked={choice.is_correct} onChange={(e) => updateChoice(index, { is_correct: e.target.checked })} className="rounded border-neutral-300 text-primary focus:ring-primary/25" />
                    صحیح
                  </label>
                  {form.choices.length > 2 && (
                    <Button type="button" variant="ghost" onClick={() => removeChoice(index)} className="shrink-0">حذف</Button>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-3 border-t border-neutral-200/80">
            <Button type="button" variant="secondary" onClick={onClose}>انصراف</Button>
            <Button type="submit">ذخیره سوال</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
