'use server'
/*
 * The Server Action under test. Only /org/workspace imports it, so only that worker owns it.
 * It reports which deployment ran it and whether Next.js forwarded the request.
 */
import { headers } from 'next/headers'

export async function ping() {
	const h = await headers()
	return {
		ranOnDeployment: process.env.VERCEL_DEPLOYMENT_ID ?? 'local',
		forwarded: h.get('x-action-forwarded') === '1',
		at: new Date().toISOString(),
	}
}
