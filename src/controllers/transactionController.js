
const Transaction = require('../models/Transaction');
const Route = require('../models/Route');
const User = require('../models/User');

// @route   GET api/transactions/my-transactions
// @desc    Get my transaction history
// @access  Private
exports.getMyTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: { usuarioId: req.user.id },
      include: [
        {
          model: User,
          as: 'usuario',
          attributes: ['nombre', 'email']
        },
        {
          model: Route,
          as: 'ruta',
          attributes: ['nombre']
        }
      ]
    });
    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   POST api/transactions
// @desc    Create a new transaction
// @access  Private
exports.createTransaction = async (req, res) => {
  const { monto, tipo, rutaId } = req.body;

  try {
    const newTransaction = await Transaction.create({
      monto,
      tipo,
      rutaId,
      usuarioId: req.user.id
    });

    res.status(201).json(newTransaction);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
