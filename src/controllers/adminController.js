const User = require('../models/User');
const Route = require('../models/Route');
const Store = require('../models/Store');
const Transaction = require('../models/Transaction');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalRoutes = await Route.count({
      where: { estado: 'aprobada' },
    });
    const activeStores = await Store.count({
      where: { estado: 'activo' },
    });

    const totalSales = await Transaction.sum('monto');

    res.json({
      totalUsers,
      totalRoutes,
      activeStores,
      totalSales: totalSales || 0, // Devuelve 0 si no hay ventas
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error en el servidor');
  }
};

// --- Gestión de Usuarios ---

exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }, // Excluimos el password
    });
    res.json(users);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error en el servidor');
  }
};

exports.getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error en el servidor');
  }
};

exports.createUser = async (req, res) => {
  const { nombre, email, password, rol } = req.body;

  try {
    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({ msg: 'El usuario ya existe' });
    }

    const allowedRoles = User.getAttributes().rol.values;
    if (!rol || !allowedRoles.includes(rol)) {
      return res.status(400).json({ msg: `El rol '${rol}' no es válido.` });
    }

    user = User.build({ nombre, email, password, rol });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    res.json({ msg: 'Usuario creado exitosamente' });

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error en el servidor');
  }
};

exports.updateUser = async (req, res) => {
  const { nombre, email, rol } = req.body;
  const { id } = req.params;

  try {
    let user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    user.nombre = nombre || user.nombre;
    user.email = email || user.email;
    user.rol = rol || user.rol;

    await user.save();

    res.json({ msg: 'Usuario actualizado exitosamente' });

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error en el servidor');
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    // Verificar dependencias antes de eliminar
    const relatedRoutes = await Route.count({ where: { creadorId: id } });
    if (relatedRoutes > 0) {
      return res.status(400).json({ msg: 'No se puede eliminar el usuario porque tiene rutas asociadas.' });
    }

    const relatedStores = await Store.count({ where: { propietarioId: id } });
    if (relatedStores > 0) {
      return res.status(400).json({ msg: 'No se puede eliminar el usuario porque tiene comercios asociados.' });
    }

    const relatedTransactions = await Transaction.count({ where: { usuarioId: id } });
    if (relatedTransactions > 0) {
      return res.status(400).json({ msg: 'No se puede eliminar el usuario porque tiene transacciones asociadas.' });
    }

    await user.destroy();

    res.json({ msg: 'Usuario eliminado exitosamente' });

  } catch (error) {
    console.error('Error al eliminar usuario:', error.message);
    res.status(500).send('Error en el servidor');
  }
};

// --- Gestión de Rutas ---

exports.getRoutes = async (req, res) => {
  try {
    const routes = await Route.findAll({
      include: {
        model: User,
        as: 'creador',
        attributes: ['nombre'],
      },
    });
    res.json(routes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error en el servidor');
  }
};

exports.getRouteById = async (req, res) => {
  const { id } = req.params;

  try {
    const route = await Route.findByPk(id, {
      include: {
        model: User,
        as: 'creador',
        attributes: ['nombre'],
      },
    });

    if (!route) {
      return res.status(404).json({ msg: 'Ruta no encontrada' });
    }

    res.json(route);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error en el servidor');
  }
};

exports.createRoute = async (req, res) => {
  const { nombre, descripcion, distancia, dificultad, precio, creadorId } = req.body;

  try {
    const route = await Route.create({
      nombre,
      descripcion,
      distancia,
      dificultad,
      precio,
      creadorId,
      estado: 'aprobada' // Las rutas creadas por un admin se aprueban automáticamente
    });

    res.status(201).json({ msg: 'Ruta creada exitosamente', route });

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error en el servidor');
  }
};

exports.updateRoute = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, distancia, dificultad, precio, creadorId, estado } = req.body;

  try {
    let route = await Route.findByPk(id);
    if (!route) {
      return res.status(404).json({ msg: 'Ruta no encontrada' });
    }

    route.nombre = nombre || route.nombre;
    route.descripcion = descripcion || route.descripcion;
    route.distancia = distancia || route.distancia;
    route.dificultad = dificultad || route.dificultad;
    route.precio = precio || route.precio;
    route.creadorId = creadorId || route.creadorId;
    route.estado = estado || route.estado;

    await route.save();

    res.json({ msg: 'Ruta actualizada exitosamente' });

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error en el servidor');
  }
};

exports.updateRouteStatus = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  try {
    const route = await Route.findByPk(id);
    if (!route) {
      return res.status(404).json({ msg: 'Ruta no encontrada' });
    }

    const allowedStatus = Route.getAttributes().estado.values;
    if (!estado || !allowedStatus.includes(estado)) {
      return res.status(400).json({ msg: `El estado '${estado}' no es válido.` });
    }

    route.estado = estado;
    await route.save();

    res.json({ msg: `Ruta ${estado} exitosamente` });

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error en el servidor');
  }
};

exports.deleteRoute = async (req, res) => {
  const { id } = req.params;

  try {
    const route = await Route.findByPk(id);
    if (!route) {
      return res.status(404).json({ msg: 'Ruta no encontrada' });
    }

    await route.destroy();

    res.json({ msg: 'Ruta eliminada exitosamente' });

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error en el servidor');
  }
};

// --- Gestión de Comercios ---

exports.getStores = async (req, res) => {
  try {
    const stores = await Store.findAll({
      include: {
        model: User,
        as: 'propietario',
        attributes: ['nombre'],
      },
    });
    res.json(stores);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error en el servidor');
  }
};

exports.getStoreById = async (req, res) => {
  const { id } = req.params;

  try {
    const store = await Store.findByPk(id, {
      include: {
        model: User,
        as: 'propietario',
        attributes: ['nombre'],
      },
    });

    if (!store) {
      return res.status(404).json({ msg: 'Comercio no encontrado' });
    }

    res.json(store);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error en el servidor');
  }
};

exports.createStore = async (req, res) => {
  const { nombre, descripcion, ubicacion, propietarioId } = req.body;

  try {
    const store = await Store.create({
      nombre,
      descripcion,
      ubicacion,
      propietarioId,
      estado: 'activo' // Los comercios creados por un admin se activan automáticamente
    });

    res.status(201).json({ msg: 'Comercio creado exitosamente', store });

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error en el servidor');
  }
};

exports.updateStore = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, ubicacion, propietarioId, estado } = req.body;

  try {
    let store = await Store.findByPk(id);
    if (!store) {
      return res.status(404).json({ msg: 'Comercio no encontrado' });
    }

    store.nombre = nombre || store.nombre;
    store.descripcion = descripcion || store.descripcion;
    store.ubicacion = ubicacion || store.ubicacion;
    store.propietarioId = propietarioId || store.propietarioId;
    store.estado = estado || store.estado;

    await store.save();

    res.json({ msg: 'Comercio actualizado exitosamente' });

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error en el servidor');
  }
};

exports.updateStoreStatus = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  try {
    const store = await Store.findByPk(id);
    if (!store) {
      return res.status(404).json({ msg: 'Comercio no encontrado' });
    }

    const allowedStatus = Store.getAttributes().estado.values;
    if (!estado || !allowedStatus.includes(estado)) {
      return res.status(400).json({ msg: `El estado '${estado}' no es válido.` });
    }

    store.estado = estado;
    await store.save();

    res.json({ msg: `Comercio ${estado} exitosamente` });

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error en el servidor');
  }
};

exports.deleteStore = async (req, res) => {
  const { id } = req.params;

  try {
    const store = await Store.findByPk(id);
    if (!store) {
      return res.status(404).json({ msg: 'Comercio no encontrado' });
    }

    await store.destroy();

    res.json({ msg: 'Comercio eliminado exitosamente' });

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error en el servidor');
  }
};

// --- Gestión de Transacciones ---

exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      include: [
        {
          model: User,
          as: 'usuario',
          attributes: ['nombre', 'email'],
        },
        {
          model: Route,
          as: 'ruta',
          attributes: ['nombre'],
        },
      ],
    });
    res.json(transactions);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error en el servidor');
  }
};

exports.getTransactionById = async (req, res) => {
  const { id } = req.params;

  try {
    const transaction = await Transaction.findByPk(id, {
      include: [
        {
          model: User,
          as: 'usuario',
          attributes: ['nombre', 'email'],
        },
        {
          model: Route,
          as: 'ruta',
          attributes: ['nombre'],
        },
      ],
    });

    if (!transaction) {
      return res.status(404).json({ msg: 'Transacción no encontrada' });
    }

    res.json(transaction);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error en el servidor');
  }
};
