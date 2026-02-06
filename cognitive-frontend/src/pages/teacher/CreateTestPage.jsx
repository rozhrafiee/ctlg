import { useForm } from 'react-hook-form';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Input,
  Textarea,
  Select,
  Checkbox,
} from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';

export default function CreateTestPage() {
  const form = useForm({
    defaultValues: {
      title: '',
      test_type: 'content_based',
      time_limit_minutes: 30,
      min_level: 1,
      is_active: true,
    },
  });

  const onSubmit = (data) => {
    console.log(data);
    // ارسال به بکند
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">ساخت آزمون جدید</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* عنوان */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>عنوان آزمون *</FormLabel>
                <FormControl>
                  <Input placeholder="مثال: آزمون حافظه سطح 1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* نوع آزمون */}
          <FormField
            control={form.control}
            name="test_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>نوع آزمون</FormLabel>
                <FormControl>
                  <Select {...field}>
                    <option value="placement">تعیین سطح</option>
                    <option value="content_based">مبتنی بر محتوا</option>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* مدت زمان */}
          <FormField
            control={form.control}
            name="time_limit_minutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>مدت زمان (دقیقه)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* حداقل سطح */}
          <FormField
            control={form.control}
            name="min_level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>حداقل سطح</FormLabel>
                <FormControl>
                  <Input type="number" min="1" max="100" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* فعال بودن */}
          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                </FormControl>
                <FormLabel>آزمون فعال باشد</FormLabel>
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            ایجاد آزمون
          </Button>
        </form>
      </Form>
    </div>
  );
}
