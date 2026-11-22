import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { User } from '../models/User.js';
import { AuditLog } from '../models/Operations.js';

const emailArg = process.argv[2];

if (!emailArg) {
  console.log(`
========================================================================
 TransitChain Administrator Management Utility
========================================================================
Usage:
  node scripts/makeAdmin.js <passenger-email>

Example:
  node scripts/makeAdmin.js user@transitchain.com
  node scripts/makeAdmin.js commuter@gmail.com
========================================================================
`);
  process.exit(1);
}

const promoteToAdmin = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    const email = emailArg.trim().toLowerCase();

    const user = await User.findOne({ email });
    if (!user) {
      console.error(`[Error] Passenger with email "${email}" was not found in the database.`);
      console.log(`Please ensure the passenger has registered first.`);
      process.exit(1);
    }

    if (user.role === 'admin') {
      console.log(`[Info] Passenger "${user.name}" (${user.email}) is ALREADY an Administrator.`);
      process.exit(0);
    }

    const previousRole = user.role;
    user.role = 'admin';
    user.isVerified = true; // Auto-verify admin
    await user.save();

    await AuditLog.create({
      userId: user._id,
      userEmail: user.email,
      action: 'PROMOTE_TO_ADMIN',
      resourceType: 'User',
      resourceId: user._id.toString(),
      details: { previousRole, newRole: 'admin', promotedVia: 'CLI_TOOL' }
    });

    console.log(`
========================================================================
 SUCCESS: PASSENGER PROMOTED TO ADMINISTRATOR
========================================================================
 Name:          ${user.name}
 Email:         ${user.email}
 Previous Role: ${previousRole.toUpperCase()}
 New Role:      ADMINISTRATOR
 Verified:      YES (isVerified: true)
 Updated At:    ${new Date().toISOString()}
========================================================================
The passenger can now access the Admin Portal at /admin with full
administrative privileges.
`);
    process.exit(0);
  } catch (error) {
    console.error(`[Error promoting passenger to admin]:`, error.message);
    process.exit(1);
  }
};

promoteToAdmin();
