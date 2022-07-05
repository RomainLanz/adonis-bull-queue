/**
 * @setten/bull-queue
 *
 * @license MIT
 * @copyright Setten - Romain Lanz <romain.lanz@setten.io>
 */

import { join } from 'node:path';
import * as sinkStatic from '@adonisjs/sink';
import type { ApplicationContract } from '@ioc:Adonis/Core/Application';

function getStub(...relativePaths: string[]) {
	return join(__dirname, 'templates', ...relativePaths);
}

export default async function instructions(
	projectRoot: string,
	app: ApplicationContract,
	sink: typeof sinkStatic
) {
	// Setup config
	const configPath = app.configPath('queue.ts');
	new sink.files.MustacheFile(projectRoot, configPath, getStub('config.txt')).commit();
	const configDir = app.directoriesMap.get('config') || 'config';
	sink.logger.action('create').succeeded(`${configDir}/database.ts`);

	// Setup environment
	const env = new sink.files.EnvFile(projectRoot);
	env.set('QUEUE_REDIS_HOST', 'localhost');
	env.set('QUEUE_REDIS_PORT', '6379');
	env.set('QUEUE_REDIS_PASSWORD', '');
	env.commit();
	sink.logger.action('update').succeeded('.env,.env.example');
}
