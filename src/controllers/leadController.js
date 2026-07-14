import leadService from '../services/leadService.js';

export const submitLead = async (req, res) => {
  try {
    const { cardId } = req.params;
    const lead = await leadService.submitLead({
      cardId,
      ...req.body,
    });
    return res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully',
      data: lead,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const getLeads = async (req, res) => {
  try {
    const { cardId } = req.params;
    const leads = await leadService.getLeadsForCard(cardId, req.user.id);
    return res.status(200).json({
      success: true,
      message: 'Leads retrieved successfully',
      data: leads,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
