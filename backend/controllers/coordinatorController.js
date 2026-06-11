const Coordinator = require('../models/Coordinator');

exports.getCoordinator = async (req, res) => {
  try {
    const coordinator = await Coordinator.findOne();
    if (!coordinator) {
      return res.status(404).json({ message: 'Coordinator not found' });
    }
    res.json(coordinator);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}