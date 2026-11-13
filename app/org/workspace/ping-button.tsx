'use client'
/*
 * Calls the action and shows the result or the error, so a failure is visible on screen.
 */
import { useState } from 'react'

import { ping } from './actions'

export function PingButton() {
	const [result, setResult] = useState('not called yet')
	return (
		<div>
			<button
				id="ping"
				onClick={async () => {
					try {
						setResult(JSON.stringify(await ping()))
					} catch (error) {
						setResult(`ERROR: ${error instanceof Error ? `${error.name}: ${error.message}` : String(error)}`)
					}
				}}
			>
				Call Server Action
			</button>
			<pre id="ping-result">{result}</pre>
		</div>
	)
}
