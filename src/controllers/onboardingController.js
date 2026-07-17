import User from '../models/User.js';
import Card from '../models/Card.js';
import Theme from '../models/Theme.js';
import mongoose from 'mongoose';

export const updateOnboarding = async (req, res) => {
  try {
    const { step, data } = req.body;
    const userId = req.user.id || req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let card = await Card.findOne({ userId });
    if (!card) {
      // Create a default card using username as slug
      card = await Card.create({
        userId,
        slug: user.username || user.email.split('@')[0],
        title: user.name || 'My Digital Card',
        isPublished: true,
      });
    }

    switch (step) {
      case 'subscription':
        user.subscriptionTier = data.plan;
        await user.save();
        break;
      case 'goal':
        user.goal = data.goal;
        await user.save();
        break;
      case 'theme':
        if (data.themeId) {
          if (mongoose.Types.ObjectId.isValid(data.themeId)) {
            card.themeId = data.themeId;
          } else {
            // It's a mock string from frontend (e.g., 'theme_0'), ignore for now
          }
          await card.save();
        }
        break;
      case 'platforms':
        // Prepare empty links for platforms
        const linksData = data.platforms.map((platform) => ({
          platform,
          url: '',
        }));
        // Update or create links section
        let linksSection = card.sections.find(s => s.type === 'links');
        if (!linksSection) {
          card.sections.push({
            sectionId: 'links_section',
            type: 'links',
            order: 0,
            data: { links: linksData }
          });
        } else {
          linksSection.data = { links: linksData };
        }
        await card.save();
        break;
      case 'links':
        // data.links is array of { platform, url }
        let currentLinksSection = card.sections.find(s => s.type === 'links');
        if (currentLinksSection) {
          currentLinksSection.data = { links: data.links };
          await card.save();
        }
        break;
      case 'profile':
        if (data.name) user.name = data.name;
        await user.save();
        
        card.title = data.name || card.title;
        let headerSection = card.sections.find(s => s.type === 'header');
        if (!headerSection) {
          card.sections.push({
            sectionId: 'header_section',
            type: 'header',
            order: -1,
            data: { bio: data.bio || '' }
          });
        } else {
          headerSection.data = { ...headerSection.data, bio: data.bio || '' };
        }
        await card.save();
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid onboarding step' });
    }

    return res.status(200).json({ success: true, message: 'Onboarding step updated' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const completeOnboarding = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.onboardingCompleted = true;
    await user.save();

    return res.status(200).json({ success: true, message: 'Onboarding completed' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
