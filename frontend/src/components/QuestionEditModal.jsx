import { useState } from 'react';
import '../styles/QuestionEditModal.css';

const QuestionEditModal = ({ question, onSave, onCancel }) => {
  const [questionText, setQuestionText] = useState(question.question_text);
  const [options, setOptions] = useState(question.answer_options || ['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(question.correct_answer_index || 0);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
      if (correctIndex >= newOptions.length) {
        setCorrectIndex(newOptions.length - 1);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!questionText.trim()) {
      setError('Question text is required');
      return;
    }

    if (options.some((opt) => !opt.trim())) {
      setError('All options must be filled');
      return;
    }

    if (options.length < 2) {
      setError('At least 2 options are required');
      return;
    }

    if (correctIndex < 0 || correctIndex >= options.length) {
      setError('Please select a correct answer');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        ...question,
        question_text: questionText.trim(),
        answer_options: options.map(opt => opt.trim()),
        correct_answer_index: correctIndex,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modalOverlay" onClick={onCancel}>
      <div className="modalContent" onClick={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <h2>Edit Question</h2>
          <button 
            type="button"
            className="modalCloseBtn" 
            onClick={onCancel}
            disabled={saving}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="editForm">
          {error && <div className="formError">{error}</div>}

          <div className="formGroup">
            <label htmlFor="questionText">Question Text</label>
            <textarea
              id="questionText"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Enter question text..."
              rows="3"
              className="formTextarea"
              disabled={saving}
            />
          </div>

          <div className="optionsSection">
            <label>Answer Options</label>
            <div className="optionsList">
              {options.map((option, index) => (
                <div key={index} className="optionInputGroup">
                  <input
                    type="radio"
                    name="correctOption"
                    checked={correctIndex === index}
                    onChange={() => setCorrectIndex(index)}
                    className="optionRadio"
                    disabled={saving}
                    title="Mark as correct answer"
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    className="optionInput"
                    disabled={saving}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      className="btnRemoveOption"
                      disabled={saving}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            {options.length < 6 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="btnAddOption"
                disabled={saving}
              >
                + Add Option
              </button>
            )}
          </div>

          <div className="modalFooter">
            <button
              type="button"
              onClick={onCancel}
              className="btnCancel"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btnSave"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionEditModal;
