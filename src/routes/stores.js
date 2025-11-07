
const express = require('express');
const router = express.Router();
const {
  getPublicStores,
  getPublicStoreById,
  createStore,
  updateMyStore,
  deleteMyStore
} = require('../controllers/storeController');
const auth = require('../middlewares/auth');

// @route   GET api/stores
// @desc    Get all active stores
// @access  Public
router.get('/', getPublicStores);

// @route   GET api/stores/:id
// @desc    Get a single active store by ID
// @access  Public
router.get('/:id', getPublicStoreById);

// @route   POST api/stores
// @desc    Create a store
// @access  Private (Comerciante)
router.post('/', auth, createStore);

// @route   PUT api/stores/:id
// @desc    Update a store
// @access  Private (Comerciante)
router.put('/:id', auth, updateMyStore);

// @route   DELETE api/stores/:id
// @desc    Delete a store
// @access  Private (Comerciante)
router.delete('/:id', auth, deleteMyStore);

module.exports = router;
