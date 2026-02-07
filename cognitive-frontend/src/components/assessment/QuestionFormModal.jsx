import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useAssessment } from '../../hooks/useAssessment';
import { Button } from '../ui/Button';
import { Input, Textarea, Select } from '../ui/Form';
import { X, Plus, Trash2 } from 'lucide-react';

export default function QuestionFormModal({ testId, question, onClose }) {
  const { addQuestion, updateQuestion } = useAssessment();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: question || {
      question_type: 'multiple_choice',
      points: 10,
      choices: [
        { choice_text: '', is_correct: false },
        { choice_text: '', is_correct: false }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'choices'
  });

  const questionType = watch('question_type');

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (question) {
        await updateQuestion(question.id, data);
        alert('سوال با موفقیت به‌روزرسانی شد');
      } else {
        await addQuestion(testId, data);
        alert('سوال با موفقیت اضافه شد');
      }
      onClose(true);
    } catch (error) {
      console.error('Failed to save question:', error);
      alert('خطا در ذخیره سوال');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {question ? 'ویرایش سوال' : 'افزودن سوال جدید'}
          </h2>
          <Button onClick={() => onClose(false)} variant="ghost" size="sm">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <Textarea
            label="متن سوال"
            {...register('question_text', { required: 'متن سوال الزامی است' })}
            error={errors.question_text?.message}
            rows={4}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="نوع سوال"
              {...register('question_type')}
            >
              <option value="multiple_choice">چند گزینه‌ای</option>
              <option value="true_false">درست/نادرست</option>
              <option value="short_answer">پاسخ کوتاه</option>
              <option value="essay">تشریحی</option>
            </Select>

            <Input
              label="امتیاز"
              {...register('points', { 
                required: 'امتیاز الزامی است',
                valueAsNumber: true,
                min: { value: 1, message: 'حداقل 1' }
              })}
              error={errors.points?.message}
              type="number"
            />
          </div>

          {questionType === 'multiple_choice' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="font-medium">گزینه‌ها</label>
                <Button
                  type="button"
                  onClick={() => append({ choice_text: '', is_correct: false })}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  افزودن گزینه
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-3 items-start">
                  <div className="flex-1">
                    <Input
                      {...register(`choices.${index}.choice_text`, {
                        required: 'متن گزینه الزامی است'
                      })}
                      error={errors.choices?.[index]?.choice_text?.message}
                      placeholder={`گزینه ${index + 1}`}
                    />
                  </div>
                  <label className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      {...register(`choices.${index}.is_correct`)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">صحیح</span>
                  </label>
                  {fields.length > 2 && (
                    <Button
                      type="button"
                      onClick={() => remove(index)}
                      variant="danger"
                      size="sm"
                      className="mt-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              onClick={() => onClose(false)}
              variant="outline"
              className="flex-1"
            >
              انصراف
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              variant="primary"
              className="flex-1"
            >
              {submitting ? 'در حال ذخیره...' : 'ذخیره'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
