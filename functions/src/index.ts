import { setGlobalOptions } from 'firebase-functions/v2';
import { REGION } from './config.js';

setGlobalOptions({ region: REGION, maxInstances: 10 });

export { claimOwner, inviteMember, lookupInvite, acceptInvite, revokeInvite, removeMember } from './team/index.js';
export { trackUpload, trackDelete, recalculateStorage } from './storage/index.js';
export { onProductWritten, onCategoryWritten } from './catalog/index.js';
export { publishSite, integrationStatus } from './publish/index.js';
