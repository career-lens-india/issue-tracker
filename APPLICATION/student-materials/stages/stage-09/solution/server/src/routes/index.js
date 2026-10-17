const express = require('express');
const requireDatabase = require('../middleware/requireDatabase');
const healthRoutes = require('./healthRoutes');
const userRoutes = require('./userRoutes');
const issueRoutes = require('./issueRoutes');

const router = express.Router();

router.use('/health', healthRoutes);
router.use(requireDatabase);
router.use('/users', userRoutes);
router.use('/issues', issueRoutes);

module.exports = router;
