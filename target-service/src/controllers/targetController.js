import Target from '../models/Target.js';
import fs from 'fs';
import path from 'path';

export const createTarget = async (req, res, next) => {
  try {
    const { title, description, locationName, deadline } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required.' });
    }

    const baseUrl = process.env.BASE_URL || '';
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

    console.log(req.user)

    const newTarget = new Target({
      ownerId: req.user.sub,
      title,
      description: description || '',
      imageUrl,
      deadline: deadline ? new Date(deadline) : null,
      locationName
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

    if (target.ownerId.toString() !== req.user.sub) {
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
    const targets = await Target.find();
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



