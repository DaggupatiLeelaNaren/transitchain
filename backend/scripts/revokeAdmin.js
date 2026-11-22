
import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { User } from '../models/User.js';
import { AuditLog } from '../models/Operations.js';

const emailArg = process.argv[2];

if (!emailArg) {
  console.log(`
========================================================================
 TransitChain Administrator Revocation Utility
========================================================================
Usage:
  node scripts/revokeAdmin.js <admin-email>

Example:
  node scripts/revokeAdmin.js user@gmail.com
========================================================================
`);
  process.exit(1);
}

const revokeAdmin = async () => {
  try {
    await mongoose.connect(config.mongoUri);

    const email = emailArg.trim().toLowerCase();

    const user = await User.findOne({ email });

    if (!user) {
      throw new Error(
        `User with email "${email}" was not found.`
      );
    }

    if (user.role !== 'admin') {
      console.log(
        `[Info] ${user.name} (${user.email}) is not an administrator.`
      );
      return;
    }

    const previousRole = user.role;

    // Revoke administrator privileges
    user.role = 'passenger';

    // Keep email verification unchanged
    await user.save();

    // Record revocation in audit logs
    await AuditLog.create({
      userId: user._id,
      userEmail: user.email,
      action: 'REVOKE_ADMIN',
      resourceType: 'User',
      resourceId: user._id.toString(),
      details: {
        previousRole,
        newRole: 'passenger',
        revokedVia: 'CLI_TOOL'
      }
    });

    console.log(`
========================================================================
 SUCCESS: ADMINISTRATOR PRIVILEGES REVOKED
========================================================================
 Name:          ${user.name}
 Email:         ${user.email}
 Previous Role: ${previousRole.toUpperCase()}
 New Role:      PASSENGER
 Email Verified: ${user.isVerified ? 'YES' : 'NO'}
 Updated At:    ${new Date().toISOString()}
========================================================================
Administrator privileges have been revoked.
The user is now a normal passenger.
========================================================================
`);

  } catch (error) {
    console.error(
      '[Error revoking administrator privileges]:',
      error.message
    );

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

revokeAdmin();
