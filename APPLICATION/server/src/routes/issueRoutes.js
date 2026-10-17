const express = require('express');
const validateObjectId = require('../middleware/validateObjectId');
const {
  listIssues,
  getIssue,
  createIssue,
  updateIssue,
  deleteIssue,
} = require('../controllers/issueController');

const router = express.Router();

router.get('/', listIssues);
router.get('/:id', validateObjectId('id'), getIssue);
router.post('/', createIssue);
router.put('/:id', validateObjectId('id'), updateIssue);
router.delete('/:id', validateObjectId('id'), deleteIssue);

module.exports = router;
