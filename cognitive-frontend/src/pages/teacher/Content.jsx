import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, BookOpen, X } from 'lucide-react';
import api from '../../api/axios';
import "@/styles/global-styles.css";
import "@/styles/page-styles.css";

export default function Content() {
  const [contents, setContents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content_type: 'video',
    min_level: 1,
    resource_url: '',
  });

  const loadContents = () => {
    api.get('/adaptive/teacher/content/').then((res) => setContents(res.data));
  };

  useEffect(loadContents, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const request = editingContent
      ? api.put(`/adaptive/content/${editingContent.id}/update/`, formData)
      : api.post('/adaptive/teacher/content/', formData);

    request.then(() => {
      loadContents();
      setShowModal(false);
      resetForm();
    });
  };

  const handleDelete = (id) => {
    if (confirm('آیا مطمئن هستید؟')) {
      api.delete(`/adaptive/content/${id}/delete/`).then(loadContents);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', content_type: 'video', min_level: 1, resource_url: '' });
    setEditingContent(null);
  };

  const openEditModal = (content) => {
    setEditingContent(content);
    setFormData({
      title: content.title,
      description: content.description,
      content_type: content.content_type,
      min_level: content.min_level,
      resource_url: content.resource_url || '',
    });
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">مدیریت محتوا</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="ml-2 w-5 h-5" />
          محتوا جدید
        </motion.button>
      </div>

      {/* Content List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contents.map((content) => (
          <motion.div
            key={content.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between mb-4">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                سطح {content.min_level}
              </span>
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{content.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{content.description}</p>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-500">
                {content.content_type === 'video' ? '📹 ویدیو' : '📄 متن'}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(content)}
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(content.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingContent ? 'ویرایش محتوا' : 'محتوا جدید'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">عنوان</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">توضیحات</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">نوع محتوا</label>
                    <select
                      value={formData.content_type}
                      onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="video">ویدیو</option>
                      <option value="text">متن</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">حداقل سطح</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      required
                      value={formData.min_level}
                      onChange={(e) => setFormData({ ...formData, min_level: Number(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">لینک منبع (اختیاری)</label>
                  <input
                    type="url"
                    value={formData.resource_url}
                    onChange={(e) => setFormData({ ...formData, resource_url: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="https://..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    {editingContent ? 'بروزرسانی' : 'ایجاد'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    انصراف
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default Content;