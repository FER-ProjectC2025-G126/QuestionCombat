import express from 'express';
import Database from '../models/db/Database.js';
import { requireAdmin } from '../middleware/auth.js';

const database = new Database();
export const router = express.Router();

// Apply admin middleware to all routes
router.use(requireAdmin);

/**
 * GET /api/admin/questions
 * Get questions filtered by status
 * Query params: status (PENDING, APPROVED, REJECTED, ALL)
 */
router.get('/questions', async function (req, res) {
  try {
    const status = req.query.status || 'PENDING';
    let questions = [];

    if (status === 'ALL') {
      questions = await database.questions.getQuestionsBySet(null); // This will need a small modification
      // For now, get all questions manually
      questions = await new Promise((resolve, reject) => {
        database.db.all(
          'SELECT q.*, s.title as set_title FROM questions q LEFT JOIN question_sets s ON q.set_id = s.set_id ORDER BY q.created_at DESC',
          [],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          }
        );
      });
    } else {
      questions = await database.questions.getQuestionsByStatus(status);
      // Add set title to each question
      questions = await Promise.all(
        questions.map(async (q) => {
          const set = await new Promise((resolve, reject) => {
            database.db.get('SELECT title FROM question_sets WHERE set_id = ?', [q.set_id], (err, row) => {
              if (err) reject(err);
              else resolve(row);
            });
          });
          return { ...q, set_title: set?.title };
        })
      );
    }

    return res.status(200).json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

/**
 * GET /api/admin/questions/:id
 * Get single question with full details
 */
router.get('/questions/:id', async function (req, res) {
  try {
    const { id } = req.params;
    const question = await database.questions.getQuestionFull(id);

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    return res.status(200).json(question);
  } catch (error) {
    console.error('Error fetching question:', error);
    return res.status(500).json({ error: 'Failed to fetch question' });
  }
});

/**
 * PUT /api/admin/questions/:id/approve
 * Approve a pending question
 */
router.put('/questions/:id/approve', async function (req, res) {
  try {
    const { id } = req.params;

    // Verify question exists
    const question = await database.questions.getQuestionFull(id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Approve the question
    await database.questions.approveQuestion(id, req.username);

    // Return updated question
    const updated = await database.questions.getQuestionFull(id);
    return res.status(200).json({
      message: 'Question approved successfully',
      question: updated,
    });
  } catch (error) {
    console.error('Error approving question:', error);
    return res.status(500).json({ error: 'Failed to approve question' });
  }
});

/**
 * PUT /api/admin/questions/:id/reject
 * Reject a pending question
 */
router.put('/questions/:id/reject', async function (req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Verify question exists
    const question = await database.questions.getQuestionFull(id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Reject the question
    await database.questions.rejectQuestion(id, reason);

    // Return updated question
    const updated = await database.questions.getQuestionFull(id);
    return res.status(200).json({
      message: 'Question rejected successfully',
      question: updated,
    });
  } catch (error) {
    console.error('Error rejecting question:', error);
    return res.status(500).json({ error: 'Failed to reject question' });
  }
});

/**
 * PUT /api/admin/questions/:id
 * Edit a question (text and options)
 */
router.put('/questions/:id', async function (req, res) {
  try {
    const { id } = req.params;
    const { questionText, options } = req.body;

    // Validate request
    if (!questionText || !Array.isArray(options) || options.length === 0) {
      return res.status(400).json({
        error: 'Missing or invalid questionText or options',
      });
    }

    // Validate at least one correct answer
    const hasCorrect = options.some((opt) => opt.isCorrect);
    if (!hasCorrect) {
      return res.status(400).json({
        error: 'Question must have at least one correct answer',
      });
    }

    // Verify question exists
    const question = await database.questions.getQuestionFull(id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Edit the question
    await database.questions.editQuestion(id, questionText, options);

    // Return updated question
    const updated = await database.questions.getQuestionFull(id);
    return res.status(200).json({
      message: 'Question updated successfully',
      question: updated,
    });
  } catch (error) {
    console.error('Error updating question:', error);
    return res.status(500).json({ error: 'Failed to update question' });
  }
});

/**
 * DELETE /api/admin/questions/:id
 * Delete a question
 */
router.delete('/questions/:id', async function (req, res) {
  try {
    const { id } = req.params;

    // Verify question exists
    const question = await database.questions.getQuestionFull(id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Delete the question (cascade deletes options)
    await database.questions.deleteQuestion(id);

    return res.status(200).json({
      message: 'Question deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting question:', error);
    return res.status(500).json({ error: 'Failed to delete question' });
  }
});

/**
 * GET /api/admin/questions-stats
 * Get statistics about questions
 */
router.get('/questions-stats', async function (req, res) {
  try {
    const stats = await new Promise((resolve, reject) => {
      database.db.get(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) as approved,
          SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) as rejected,
          SUM(CASE WHEN source = 'AI' THEN 1 ELSE 0 END) as ai_generated,
          SUM(CASE WHEN source = 'MANUAL' THEN 1 ELSE 0 END) as manually_created
        FROM questions`,
        [],
        (err, row) => {
          if (err) reject(err);
          else resolve(row || {});
        }
      );
    });

    return res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});
