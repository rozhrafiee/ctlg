import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assessmentAPI } from '../services/api'; 
import './TestForm.css'; 

// ساختار اولیه یک سوال
const INITIAL_QUESTION_STATE = {
    id: null,
    text: '',
    question_type: 'mcq', // پیش‌فرض: تستی
    points: 10,
    choices: [
        { id: null, text: '', is_correct: false },
        { id: null, text: '', is_correct: false },
    ],
    is_deleted: false,
};

const TestForm = () => {
    const { id } = useParams(); // برای حالت ویرایش
    const navigate = useNavigate();
    const isEditing = Boolean(id);

    const [testData, setTestData] = useState({
        title: '',
        description: '',
        test_type: 'regular', // regular: عمومی سطح‌بندی شده | placement: تعیین سطح
        time_limit_minutes: 60,
        passing_score: 70,
        min_level: 1, // حداقل سطح مورد نیاز
    });
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- لود کردن داده‌ها در حالت ویرایش ---
    useEffect(() => {
        if (isEditing) {
            const fetchTest = async () => {
                setLoading(true);
                try {
                    // ۱. دریافت تنظیمات اصلی آزمون
                    // بر اساس urls.py شما، CognitiveTestUpdateView (get) برای این کار مناسب است.
                    const resTest = await assessmentAPI.updateTest(id); // از PUT/GET یکسانی استفاده می‌کند
                    const testDetails = resTest.data;
                    
                    // ۲. دریافت سوالات مرتبط
                    const resQ = await assessmentAPI.listQuestions(id);
                    const loadedQuestions = resQ.data.map(q => ({
                        ...q,
                        // اگر بک‌اند choices را به‌صورت تو در تو برمی‌گرداند، از آن استفاده کنید
                        // در غیر این صورت، این بخش را بر اساس ساختار بک‌اند خود تنظیم کنید
                        choices: q.choices && q.choices.length > 0 ? q.choices : INITIAL_QUESTION_STATE.choices,
                    }));
                    
                    setTestData({
                        title: testDetails.title,
                        description: testDetails.description,
                        test_type: testDetails.test_type,
                        time_limit_minutes: testDetails.time_limit_minutes,
                        passing_score: testDetails.passing_score,
                        // نکته: اگر test_type='placement' باشد، min_level بک‌اند ممکن است 0 باشد، اینجا آن را به 1 تغییر نمی‌دهیم
                        min_level: testDetails.min_level || 1, 
                    });
                    setQuestions(loadedQuestions);

                } catch (e) {
                    setError("خطا در بارگیری جزئیات آزمون.");
                    console.error(e.response ? e.response.data : e.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchTest();
        }
    }, [id, isEditing]);


    // --- توابع Handler ---
    const handleTestDataChange = (e) => {
        const { name, value } = e.target;
        setTestData(prev => ({
            ...prev,
            [name]: ['time_limit_minutes', 'passing_score', 'min_level'].includes(name) ? Number(value) : value,
        }));
    };

    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...questions];
        if (field === 'points' && value < 0) return;
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    const handleChoiceChange = (qIndex, cIndex, field, value) => {
        const newQuestions = [...questions];
        const newChoices = [...newQuestions[qIndex].choices];

        if (field === 'is_correct') {
            // فقط یک گزینه می‌تواند صحیح باشد (برای mcq)
            newChoices.forEach((c, idx) => {
                c.is_correct = (idx === cIndex) ? value : false;
            });
        } else {
            newChoices[cIndex][field] = value;
        }

        newQuestions[qIndex].choices = newChoices;
        setQuestions(newQuestions);
    };

    const addQuestion = (type = 'mcq') => {
        setQuestions(prev => [...prev, { ...INITIAL_QUESTION_STATE, question_type: type }]);
    };

    const deleteQuestion = (index) => {
        const questionToDelete = questions[index];
        if (isEditing && questionToDelete.id) {
            // در حالت ویرایش: حذف منطقی برای پردازش در handleSubmit
            setQuestions(prev => prev.map((q, idx) => 
                idx === index ? { ...q, is_deleted: true } : q
            ));
        } else {
            // حذف فیزیکی از آرایه برای سوالات جدید یا حالت ایجاد
            setQuestions(prev => prev.filter((_, idx) => idx !== index));
        }
    };

    // --- تابع اصلی ارسال: روش دو مرحله‌ای برای جلوگیری از خطای 400 ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // ۱. اعتبارسنجی اولیه
        const activeQuestions = questions.filter(q => !q.is_deleted);
        if (activeQuestions.length === 0) {
            setError("حداقل یک سوال معتبر اضافه کنید.");
            return;
        }
        if (!testData.title || testData.time_limit_minutes <= 0) {
             setError("عنوان و زمان آزمون اجباری هستند.");
             return;
        }
        if (testData.test_type === 'regular' && testData.min_level < 1) {
            setError("سطح شروع (Min Level) باید حداقل ۱ باشد.");
            return;
        }

        try {
            setLoading(true);
            let createdTestId = id; 

            // --- مرحله ۱: ایجاد/به‌روزرسانی تنظیمات اصلی آزمون ---
            const testPayload = {
                title: testData.title,
                description: testData.description,
                time_limit_minutes: testData.time_limit_minutes,
                passing_score: testData.passing_score,
                test_type: testData.test_type,
                // اگر تعیین سطح بود، min_level به 1 (یا 0 که در بک‌اند مدیریت شود)
                min_level: testData.test_type === 'placement' ? 1 : testData.min_level, 
            };

            if (isEditing) {
                // استفاده از assessmentAPI.updateTest که از PUT استفاده می‌کند
                await assessmentAPI.updateTest(id, testPayload);
            } else {
                // استفاده از assessmentAPI.createTest/createPlacementTest
                const res = testData.test_type === 'placement'
                    ? await assessmentAPI.createPlacementTest(testPayload)
                    : await assessmentAPI.createTest(testPayload);
                createdTestId = res.data.id;
            }
            
            // --- مرحله ۲: مدیریت سوالات (ایجاد، ویرایش، حذف) ---
            if (createdTestId) {
                let successfulQuestions = 0;
                
                // الف. ابتدا حذف سوالات مارک شده
                for (const q of questions) {
                    if (q.is_deleted && q.id) {
                        await assessmentAPI.deleteQuestion(q.id);
                    }
                }
                
                // ب. مدیریت سوالات جدید/ویرایش شده
                const nonDeletedQuestions = questions.filter(q => !q.is_deleted);
                for (const [index, q] of nonDeletedQuestions.entries()) {

                    // آماده‌سازی Payload سوال
                    const questionPayload = {
                        text: q.text,
                        question_type: q.question_type,
                        points: Number(q.points),
                        order: index + 1, // تنظیم ترتیب سوال
                    };

                    // افزودن گزینه‌ها فقط برای MCQ
                    if (q.question_type === "mcq") {
                        const validChoices = q.choices.filter(c => c.text.trim() !== "");
                        if (validChoices.length < 2 || validChoices.every(c => !c.is_correct)) {
                           throw new Error(`سوال ${index + 1} (تستی) باید حداقل ۲ گزینه و یک پاسخ صحیح داشته باشد.`);
                        }
                        // ساختار مورد نیاز QuestionCreateSerializer: choices به صورت تو در تو
                        questionPayload.choices = validChoices.map(c => ({ text: c.text, is_correct: c.is_correct }));
                    }

                    if (q.id) {
                        // ویرایش سوال موجود: QuestionUpdateView
                        await assessmentAPI.updateQuestion(q.id, questionPayload);
                    } else {
                        // ایجاد سوال جدید: add_question_to_test
                        await assessmentAPI.addQuestion(createdTestId, questionPayload);
                    }
                    successfulQuestions++;
                }

                alert(`✅ آزمون با موفقیت ${isEditing ? 'ویرایش' : 'ایجاد'} شد. ${successfulQuestions} سوال ذخیره شدند.`);
                navigate("/teacher/tests/all");
            }

        } catch (e) {
            setLoading(false);
            const serverErrorData = e.response ? e.response.data : {};
            
            if (e.message && e.message.includes("باید حداقل")) {
                setError(e.message); // خطای اعتبارسنجی سمت کلاینت
            } else if (serverErrorData) {
                // نمایش خطاهای سرور (خطای 400)
                // اگر بک‌اند خطای 400 برگرداند، آن را به کاربر نمایش می‌دهیم
                setError("خطای سرور در ذخیره اطلاعات. جزئیات: " + JSON.stringify(serverErrorData));
            } else {
                setError("خطای ناشناخته در ارتباط با سرور.");
                console.error(e);
            }
        } finally {
            setLoading(false);
        }
    };


    // --- رندرینگ (مانند قبل) ---
    if (loading && isEditing) return <div className="loading">در حال بارگیری آزمون...</div>;

    return (
        <div className="test-form-container">
            <h1>{isEditing ? `ویرایش آزمون: ${testData.title}` : "ایجاد آزمون جدید"}</h1>
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmit} className="test-form">
                
                {/* بخش تنظیمات اصلی آزمون */}
                <fieldset className="test-settings-section">
                    <legend>تنظیمات پایه آزمون</legend>

                    <div className="form-group">
                        <label>عنوان آزمون:</label>
                        <input
                            type="text"
                            name="title"
                            value={testData.title}
                            onChange={handleTestDataChange}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>نوع آزمون:</label>
                        <select 
                           name="test_type" 
                           value={testData.test_type} 
                           onChange={handleTestDataChange}
                        >
                            <option value="regular">عمومی (سطح‌بندی شده)</option>
                            <option value="placement">تعیین سطح اولیه</option>
                            {/* content_based از طریق endpoint دیگری ایجاد می‌شود */}
                            <option value="content_based" disabled>مرتبط با محتوا</option>
                        </select>
                    </div>

                    <div className="form-row">
                        <div className="form-group half-width">
                            <label>زمان (دقیقه):</label>
                            <input
                                type="number"
                                name="time_limit_minutes"
                                value={testData.time_limit_minutes}
                                onChange={handleTestDataChange}
                                min="1"
                                required
                            />
                        </div>

                        <div className="form-group half-width">
                            <label>نمره قبولی (%):</label>
                            <input
                                type="number"
                                name="passing_score"
                                value={testData.passing_score}
                                onChange={handleTestDataChange}
                                min="0"
                                max="100"
                                required
                            />
                        </div>
                    </div>

                    {testData.test_type === 'regular' && (
                        <div className="form-group">
                            <label>حداقل سطح شروع (Min Level):</label>
                            <input
                                type="number"
                                name="min_level"
                                value={testData.min_level}
                                onChange={handleTestDataChange}
                                min="1"
                                required
                            />
                            <small>کاربران با این سطح یا بالاتر می‌توانند این آزمون را شروع کنند.</small>
                        </div>
                    )}
                    
                    <div className="form-group">
                        <label>توضیحات:</label>
                        <textarea
                            name="description"
                            value={testData.description}
                            onChange={handleTestDataChange}
                            rows="3"
                        ></textarea>
                    </div>
                </fieldset>

                {/* بخش مدیریت سوالات */}
                <fieldset className="question-management-section">
                    <legend>مدیریت سوالات ({questions.filter(q => !q.is_deleted).length} سوال)</legend>

                    {questions.map((q, qIndex) => (
                        !q.is_deleted && (
                            <div key={qIndex} className="question-card">
                                <div className="question-header">
                                    <h3>سوال شماره {qIndex + 1}</h3>
                                    <button 
                                        type="button" 
                                        className="delete-button" 
                                        onClick={() => deleteQuestion(qIndex)}
                                    >
                                        حذف
                                    </button>
                                </div>
                                
                                <div className="form-row">
                                    <div className="form-group wide-width">
                                        <label>متن سوال:</label>
                                        <textarea
                                            value={q.text}
                                            onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                                            required
                                        ></textarea>
                                    </div>
                                    <div className="form-group narrow-width">
                                        <label>امتیاز:</label>
                                        <input
                                            type="number"
                                            value={q.points}
                                            onChange={(e) => handleQuestionChange(qIndex, 'points', Number(e.target.value))}
                                            min="1"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>نوع سوال:</label>
                                    <select
                                        value={q.question_type}
                                        onChange={(e) => handleQuestionChange(qIndex, 'question_type', e.target.value)}
                                    >
                                        <option value="mcq">تستی (چند گزینه‌ای)</option>
                                        <option value="text">تشریحی (نیاز به تصحیح دستی)</option>
                                    </select>
                                </div>

                                {/* بخش مدیریت گزینه‌ها (فقط برای MCQ) */}
                                {q.question_type === 'mcq' && (
                                    <div className="choices-section">
                                        <h4>گزینه‌ها: (گزینه صحیح را علامت بزنید)</h4>
                                        {q.choices.map((c, cIndex) => (
                                            <div key={cIndex} className="choice-input-group">
                                                <input
                                                    type="radio"
                                                    name={`q-${qIndex}-correct`}
                                                    checked={c.is_correct}
                                                    onChange={(e) => handleChoiceChange(qIndex, cIndex, 'is_correct', e.target.checked)}
                                                />
                                                <input
                                                    type="text"
                                                    value={c.text}
                                                    onChange={(e) => handleChoiceChange(qIndex, cIndex, 'text', e.target.value)}
                                                    placeholder={`گزینه ${cIndex + 1}`}
                                                    required
                                                />
                                            </div>
                                        ))}
                                        <button 
                                            type="button" 
                                            className="add-choice-button"
                                            onClick={() => {
                                                const newQuestions = [...questions];
                                                newQuestions[qIndex].choices.push({ id: null, text: '', is_correct: false });
                                                setQuestions(newQuestions);
                                            }}
                                        >
                                            + افزودن گزینه
                                        </button>
                                    </div>
                                )}
                            </div>
                        )
                    ))}

                    <div className="add-question-buttons">
                        <button type="button" onClick={() => addQuestion('mcq')} className="primary-button">
                            + افزودن سوال تستی
                        </button>
                        <button type="button" onClick={() => addQuestion('text')} className="secondary-button">
                            + افزودن سوال تشریحی
                        </button>
                    </div>

                </fieldset>

                <button type="submit" className="submit-button" disabled={loading}>
                    {loading ? "در حال ذخیره‌سازی..." : (isEditing ? "ذخیره تغییرات آزمون" : "ایجاد آزمون")}
                </button>
            </form>
        </div>
    );
};

export default TestForm;
