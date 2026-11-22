
import { User, UserPreference } from '../models/User.js';
import { Favorite, JourneyHistory } from '../models/Operations.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select(
        '-passwordHash -otpHash -otpExpiresAt -otpAttempts -otpLastSentAt -resetTokenHash -resetTokenExpiresAt -refreshToken'
      )
      .lean();

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    const preferences = await UserPreference.findOne({
      userId: req.user._id
    }).lean();

    return sendSuccess(res, {
      user,
      preferences
    });

  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'name',
      'phone',
      'dateOfBirth',
      'gender',
      'bio',
      'address',
      'city',
      'state',
      'country',
      'postalCode'
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    if (updates.name !== undefined) {
      if (
        typeof updates.name !== 'string' ||
        !updates.name.trim()
      ) {
        return sendError(res, 'Valid name is required', 400);
      }

      updates.name = updates.name.trim();
    }

    if (updates.phone !== undefined) {
      if (
        typeof updates.phone !== 'string' ||
        updates.phone.length > 20
      ) {
        return sendError(res, 'Invalid phone number', 400);
      }

      updates.phone = updates.phone.trim();
    }

    if (updates.dateOfBirth !== undefined) {
      if (updates.dateOfBirth === '') {
        updates.dateOfBirth = null;
      } else {
        const date = new Date(updates.dateOfBirth);

        if (
          Number.isNaN(date.getTime()) ||
          date > new Date()
        ) {
          return sendError(res, 'Invalid date of birth', 400);
        }

        updates.dateOfBirth = date;
      }
    }

    if (updates.gender !== undefined) {
      const allowedGenders = [
        '',
        'male',
        'female',
        'other',
        'prefer_not_to_say'
      ];

      if (!allowedGenders.includes(updates.gender)) {
        return sendError(res, 'Invalid gender selection', 400);
      }
    }

    if (updates.bio !== undefined && updates.bio.length > 300) {
      return sendError(res, 'Bio cannot exceed 300 characters', 400);
    }

    // Email and role are deliberately not accepted.
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      {
        new: true,
        runValidators: true
      }
    ).select(
      '-passwordHash -otpHash -otpExpiresAt -otpAttempts -otpLastSentAt -resetTokenHash -resetTokenExpiresAt -refreshToken'
    );

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    return sendSuccess(
      res,
      { user },
      'Profile updated successfully'
    );

  } catch (err) {
    next(err);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user._id);

    await UserPreference.deleteMany({
      userId: req.user._id
    });

    await Favorite.deleteMany({
      userId: req.user._id
    });

    return sendSuccess(res, {}, 'Account permanently deleted');

  } catch (err) {
    next(err);
  }
};

export const getPreferences = async (req, res, next) => {
  try {
    let pref = await UserPreference.findOne({
      userId: req.user._id
    });

    if (!pref) {
      pref = await UserPreference.create({
        userId: req.user._id
      });
    }

    return sendSuccess(res, pref);

  } catch (err) {
    next(err);
  }
};

export const updatePreferences = async (req, res, next) => {
  try {
    const {
      preferredModes,
      maxWalkingDistanceMeters,
      maxTransfers,
      optimizationPreference,
      accessibleOnly
    } = req.body;

    let pref = await UserPreference.findOne({
      userId: req.user._id
    });

    if (!pref) {
      pref = new UserPreference({
        userId: req.user._id
      });
    }

    if (preferredModes) {
      pref.preferredModes = preferredModes;
    }

    if (maxWalkingDistanceMeters !== undefined) {
      pref.maxWalkingDistanceMeters = maxWalkingDistanceMeters;
    }

    if (maxTransfers !== undefined) {
      pref.maxTransfers = maxTransfers;
    }

    if (optimizationPreference) {
      pref.optimizationPreference = optimizationPreference;
    }

    if (accessibleOnly !== undefined) {
      pref.accessibleOnly = accessibleOnly;
    }

    await pref.save();

    return sendSuccess(res, pref, 'Preferences saved');

  } catch (err) {
    next(err);
  }
};

export const getHistory = async (req, res, next) => {
  try {
    const history = await JourneyHistory.find({
      userId: req.user._id
    })
      .sort({ completedAt: -1 })
      .limit(20);

    return sendSuccess(res, history);

  } catch (err) {
    next(err);
  }
};

export const getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({
      userId: req.user._id
    }).sort({ createdAt: -1 });

    return sendSuccess(res, favorites);

  } catch (err) {
    next(err);
  }
};

export const addFavorite = async (req, res, next) => {
  try {
    const {
      title,
      origin,
      destination,
      modes
    } = req.body;

    if (!title || !origin || !destination) {
      return sendError(
        res,
        'Title, origin, and destination are required',
        400
      );
    }

    const favorite = await Favorite.create({
      userId: req.user._id,
      title,
      origin,
      destination,
      modes: modes || ['bus', 'metro']
    });

    return sendSuccess(
      res,
      favorite,
      'Saved to favorites',
      201
    );

  } catch (err) {
    next(err);
  }
};

export const deleteFavorite = async (req, res, next) => {
  try {
    const { id } = req.params;

    await Favorite.findOneAndDelete({
      _id: id,
      userId: req.user._id
    });

    return sendSuccess(res, {}, 'Favorite removed');

  } catch (err) {
    next(err);
  }
};
