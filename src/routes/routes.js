
const express = require('express');
const router = express.Router();
const {
  getPublicRoutes,
  getPublicRouteById,
  createRoute,
  updateMyRoute,
  deleteMyRoute
} = require('../controllers/routeController');
const auth = require('../middlewares/auth');

// @route   GET api/routes
// @desc    Get all approved routes
// @access  Public
router.get('/', getPublicRoutes);

// @route   GET api/routes/:id
// @desc    Get a single approved route by ID
// @access  Public
router.get('/:id', getPublicRouteById);

// @route   POST api/routes
// @desc    Create a route
// @access  Private (Creador de Ruta)
router.post('/', auth, createRoute);

// @route   PUT api/routes/:id
// @desc    Update a route
// @access  Private (Creador de Ruta)
router.put('/:id', auth, updateMyRoute);

// @route   DELETE api/routes/:id
// @desc    Delete a route
// @access  Private (Creador de Ruta)
router.delete('/:id', auth, deleteMyRoute);

module.exports = router;
