import Target from '../models/Target.js';
import fs from 'fs';
import path from 'path';

export const createTarget = async (req, res, next) => {
  try {
    if (req.user.role !== 'owner' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only owners or admins can create targets.' });
    }

    const { competitionId, title, locationName, tags } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required.' });
    }

    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3003}`;
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

    const parsedTags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;

    const newTarget = new Target({
      competitionId,
      ownerId: req.user.id,
      title,
      imageUrl,
      locationName,
      tags: parsedTags || []
    });

    const savedTarget = await newTarget.save();
    return res.status(201).json(savedTarget);
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

export const deleteTarget = async (req, res, next) => {
  try {
    const { id } = req.params;
    const target = await Target.findById(id);

    if (!target) {
      return res.status(404).json({ error: 'Target not found.' });
    }

    if (target.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You do not have permission to delete this target.' });
    }

    try {
        const filename = target.imageUrl.split('/uploads/')[1];
        if (filename) {
          const filePath = path.join(process.cwd(), 'src', 'uploads', filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
    } catch (fsError) {
        console.error('Failed to delete image file:', fsError);
    }

    await target.deleteOne();
    return res.status(200).json({ message: 'Target successfully deleted.' });
  } catch (error) {
    next(error);
  }
};

export const getTargets = async (req, res, next) => {
  try {
    const { competitionId } = req.query;
    const filter = competitionId ? { competitionId } : {};
    const targets = await Target.find(filter);
    return res.status(200).json(targets);
  } catch (error) {
    next(error);
  }
};

export const getTargetById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const target = await Target.findById(id);
      if (!target) {
        return res.status(404).json({ error: 'Target not found.' });
      }
      return res.status(200).json(target);
    } catch (error) {
      next(error);
    }
  };
