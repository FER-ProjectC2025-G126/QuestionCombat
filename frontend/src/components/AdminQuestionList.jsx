import { useState, useEffect } from 'react';
import api from '../api/api';
import QuestionEditModal from './QuestionEditModal';
import '../styles/AdminQuestionList.css';

const AdminQuestionList = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [activeStatus, setActiveStatus] = useState('PENDING');
  const [stats, setStats] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(null);

  useEffect(() => {
    fetchQuestions(activeStatus);
    fetchStats();
  }, [activeStatus]);

  const fetchQuestions = async (status) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/admin/questions', { params: { status } });
      setQuestions(response.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch questions');
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/questions-stats');
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleApprove = async (questionId) => {
    setActionInProgress(questionId);
    setError('');
    setMessage('');
    try {
      await api.put(`/admin/questions/${questionId}/approve`);
      setMessage('Question approved successfully');
      await fetchQuestions(activeStatus);
      await fetchStats();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to approve question');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (questionId) => {
    setActionInProgress(questionId);
    setError('');
    setMessage('');
    try {
      await api.put(`/admin/questions/${questionId}/reject`);
      setMessage('Question rejected successfully');
      await fetchQuestions(activeStatus);
      await fetchStats();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reject question');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleEdit = async (question) => {
    try {
      // Fetch full question details including options
      const response = await api.get(`/admin/questions/${question.question_id}`);
      setEditingQuestion(response.data);
    } catch (err) {
      setError('Failed to load question details');
      console.error('Error fetching question details:', err);
    }
  };

  const handleSaveEdit = async (updatedQuestion) => {
    setError('');
    setMessage('');
    try {
      // Transform frontend format to backend format
      const options = updatedQuestion.answer_options.map((text, index) => ({
        text,
        isCorrect: index === updatedQuestion.correct_answer_index,
      }));

      await api.put(`/admin/questions/${updatedQuestion.question_id}`, {
        questionText: updatedQuestion.question_text,
        options: options,
      });
      setMessage('Question updated successfully');
      setEditingQuestion(null);
      await fetchQuestions(activeStatus);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update question');
    }
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    setError('');
    setMessage('');
    try {
      await api.delete(`/admin/questions/${questionId}`);
      setMessage('Question deleted successfully');
      await fetchQuestions(activeStatus);
      await fetchStats();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete question');
    }
  };

  const getSourceBadgeStyle = (source) => {
    return source === 'AI' ? 'source-ai' : 'source-manual';
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'PENDING':
        return 'status-pending';
      case 'APPROVED':
        return 'status-approved';
      case 'REJECTED':
        return 'status-rejected';
      default:
        return '';
    }
  };

  return (
    <div className="questionsManagement">
      {error && <div className="adminError">{error}</div>}
      {message && <div className="adminSuccess">{message}</div>}

      <h2 className="questionsTitle">Question Management</h2>

      {stats && (
        <div className="statsContainer">
          <div className="statCard">
            <div className="statNumber">{stats.total || 0}</div>
            <div className="statLabel">Total</div>
          </div>
          <div className="statCard">
            <div className="statNumber">{stats.pending || 0}</div>
            <div className="statLabel">Pending</div>
          </div>
          <div className="statCard">
            <div className="statNumber">{stats.approved || 0}</div>
            <div className="statLabel">Approved</div>
          </div>
          <div className="statCard">
            <div className="statNumber">{stats.rejected || 0}</div>
            <div className="statLabel">Rejected</div>
          </div>
          <div className="statCard">
            <div className="statNumber">{stats.ai_generated || 0}</div>
            <div className="statLabel">AI Generated</div>
          </div>
        </div>
      )}

      <div className="statusTabs">
        {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((status) => (
          <button
            key={status}
            className={`statusTab ${activeStatus === status ? 'active' : ''}`}
            onClick={() => setActiveStatus(status)}
          >
            {status} (
            {status === 'PENDING'
              ? stats?.pending
              : status === 'APPROVED'
                ? stats?.approved
                : status === 'REJECTED'
                  ? stats?.rejected
                  : stats?.total}{' '}
            {status})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="adminLoading">Loading questions...</div>
      ) : questions.length === 0 ? (
        <div className="noQuestions">No questions found</div>
      ) : (
        <div className="questionsTable">
          <div className="tableHeader">
            <div className="colQuestion">Question</div>
            <div className="colSet">Set</div>
            <div className="colSource">Source</div>
            <div className="colStatus">Status</div>
            <div className="colActions">Actions</div>
          </div>

          {questions.map((q) => (
            <div key={q.question_id} className="tableRow">
              <div className="colQuestion">
                <span className="questionText">{q.question_text}</span>
              </div>
              <div className="colSet">{q.set_title || 'N/A'}</div>
              <div className="colSource">
                <span className={`badge ${getSourceBadgeStyle(q.source)}`}>{q.source}</span>
              </div>
              <div className="colStatus">
                <span className={`badge ${getStatusBadgeStyle(q.status)}`}>{q.status}</span>
              </div>
              <div className="colActions">
                <div className="actionButtons">
                  {q.status === 'PENDING' && (
                    <>
                      <button
                        className="actionBtn approveBtn"
                        onClick={() => handleApprove(q.question_id)}
                        disabled={actionInProgress === q.question_id}
                        title="Approve question"
                      >
                        ✓ Approve
                      </button>
                      <button
                        className="actionBtn rejectBtn"
                        onClick={() => handleReject(q.question_id)}
                        disabled={actionInProgress === q.question_id}
                        title="Reject question"
                      >
                        ✗ Reject
                      </button>
                    </>
                  )}
                  <button
                    className="actionBtn editBtn"
                    onClick={() => handleEdit(q)}
                    title="Edit question"
                  >
                    ✎ Edit
                  </button>
                  <button
                    className="actionBtn deleteBtn"
                    onClick={() => handleDelete(q.question_id)}
                    title="Delete question"
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingQuestion && (
        <QuestionEditModal
          question={editingQuestion}
          onSave={handleSaveEdit}
          onCancel={() => setEditingQuestion(null)}
        />
      )}
    </div>
  );
};

export default AdminQuestionList;
