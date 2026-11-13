/*
 * Background page. It owns the action and links to the intercepted modal.
 */
import Link from 'next/link'

import { PingButton } from './ping-button'

export default function WorkspacePage() {
	return (
		<div>
			<h1>Workspace</h1>
			<PingButton />
			<Link id="open-modal" href="/org/account">
				Open account modal
			</Link>
		</div>
	)
}
