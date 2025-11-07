
const Route = require('../models/Route');
const User = require('../models/User');

// @route   GET api/routes
// @desc    Get all approved routes
// @access  Public
exports.getPublicRoutes = async (req, res) => {
  try {
    const routes = await Route.findAll({
      where: { estado: 'aprobada' },
      include: {
        model: User,
        as: 'creador',
        attributes: ['nombre']
      }
    });
    res.json(routes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET api/routes/:id
// @desc    Get a single approved route by ID
// @access  Public
exports.getPublicRouteById = async (req, res) => {
  try {
    const route = await Route.findOne({
      where: { id: req.params.id, estado: 'aprobada' },
      include: {
        model: User,
        as: 'creador',
        attributes: ['nombre']
      }
    });

    if (!route) {
      return res.status(404).json({ msg: 'Route not found' });
    }

    res.json(route);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   POST api/routes
// @desc    Create a route
// @access  Private (Creador de Ruta)
exports.createRoute = async (req, res) => {
  const { nombre, descripcion, distancia, dificultad, precio } = req.body;

  try {
    if (req.user.rol !== 'Creador de Ruta') {
      return res.status(403).json({ msg: 'Access denied' });
    }

    const newRoute = await Route.create({
      nombre,
      descripcion,
      distancia,
      dificultad,
      precio,
      creadorId: req.user.id,
      estado: 'pendiente'
    });

    res.status(201).json(newRoute);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   PUT api/routes/:id
// @desc    Update a route
// @access  Private (Creador de Ruta)
exports.updateMyRoute = async (req, res) => {
  const { nombre, descripcion, distancia, dificultad, precio } = req.body;

  try {
    let route = await Route.findByPk(req.params.id);

    if (!route) {
      return res.status(404).json({ msg: 'Route not found' });
    }

    if (route.creadorId !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    route.nombre = nombre || route.nombre;
    route.descripcion = descripcion || route.descripcion;
    route.distancia = distancia || route.distancia;
    route.dificultad = dificultad || route.dificultad;
    route.precio = precio || route.precio;

    await route.save();

    res.json(route);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   DELETE api/routes/:id
// @desc    Delete a route
// @access  Private (Creador de Ruta)
exports.deleteMyRoute = async (req, res) => {
  try {
    let route = await Route.findByPk(req.params.id);

    if (!route) {
      return res.status(404).json({ msg: 'Route not found' });
    }

    if (route.creadorId !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await route.destroy();

    res.json({ msg: 'Route removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
