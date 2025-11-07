
const express = require('express');
const router = express.Router();
const {
  getMyTransactions,
  createTransaction
} = require('../controllers/transactionController');
const auth = require('../middlewares/auth');

// @route   GET api/transactions/my-transactions
// @desc    Get my transaction history
// @access  Private
router.get('/my-transactions', auth, getMyTransactions);

// @route   POST api/transactions
// @desc    Create a new transaction
// @access  Private
router.post('/', auth, createTransaction);

module.exports = router;
