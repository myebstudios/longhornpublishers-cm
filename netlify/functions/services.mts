import { getDatabase } from '@netlify/database';
import type { Config } from '@netlify/functions';
import { requireAdmin } from './_shared/auth';
import { purgeMedia } from './_shared/media-cache';
import { uploadedImageExists } from './_shared/uploaded-image';
import { purgeIfPublic, purgePublic } from './_shared/public-cache';
import { createServicesHandler } from './_shared/services-handler';

export default createServicesHandler({ db: getDatabase(), authorize: requireAdmin, imageExists: uploadedImageExists, purgeMedia, purgeIfPublic, purgePublic });
export const config: Config = { path: '/api/services-admin' };
