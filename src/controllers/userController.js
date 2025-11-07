
const User = require('../models/User');

// @route   GET api/users/me
// @desc    Get current user's profile
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   PUT api/users/me
// @desc    Update current user's profile
// @access  Private
exports.updateMe = async (req, res) => {
  const { nombre, email } = req.body;

  try {
    let user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.nombre = nombre || user.nombre;
    user.email = email || user.email;

    await user.save();

    res.json({ msg: 'Profile updated successfully' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
