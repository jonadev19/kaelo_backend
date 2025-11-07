
const Store = require('../models/Store');
const User = require('../models/User');

// @route   GET api/stores
// @desc    Get all active stores
// @access  Public
exports.getPublicStores = async (req, res) => {
  try {
    const stores = await Store.findAll({
      where: { estado: 'activo' },
      include: {
        model: User,
        as: 'propietario',
        attributes: ['nombre']
      }
    });
    res.json(stores);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET api/stores/:id
// @desc    Get a single active store by ID
// @access  Public
exports.getPublicStoreById = async (req, res) => {
  try {
    const store = await Store.findOne({
      where: { id: req.params.id, estado: 'activo' },
      include: {
        model: User,
        as: 'propietario',
        attributes: ['nombre']
      }
    });

    if (!store) {
      return res.status(404).json({ msg: 'Store not found' });
    }

    res.json(store);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   POST api/stores
// @desc    Create a store
// @access  Private (Comerciante)
exports.createStore = async (req, res) => {
  const { nombre, descripcion, ubicacion } = req.body;

  try {
    if (req.user.rol !== 'Comerciante') {
      return res.status(403).json({ msg: 'Access denied' });
    }

    const newStore = await Store.create({
      nombre,
      descripcion,
      ubicacion,
      propietarioId: req.user.id,
      estado: 'pendiente'
    });

    res.status(201).json(newStore);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   PUT api/stores/:id
// @desc    Update a store
// @access  Private (Comerciante)
exports.updateMyStore = async (req, res) => {
  const { nombre, descripcion, ubicacion } = req.body;

  try {
    let store = await Store.findByPk(req.params.id);

    if (!store) {
      return res.status(404).json({ msg: 'Store not found' });
    }

    if (store.propietarioId !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    store.nombre = nombre || store.nombre;
    store.descripcion = descripcion || store.descripcion;
    store.ubicacion = ubicacion || store.ubicacion;

    await store.save();

    res.json(store);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   DELETE api/stores/:id
// @desc    Delete a store
// @access  Private (Comerciante)
exports.deleteMyStore = async (req, res) => {
  try {
    let store = await Store.findByPk(req.params.id);

    if (!store) {
      return res.status(404).json({ msg: 'Store not found' });
    }

    if (store.propietarioId !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await store.destroy();

    res.json({ msg: 'Store removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
