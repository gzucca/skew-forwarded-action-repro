/*
 * Intercepted modal for /org/account. It imports no Server Actions, so its worker cannot run
 * the background page's action and Next.js forwards that action to the owning worker.
 */
export default function AccountModal() {
	return (
		<div id="account-modal" style={{ border: '2px solid #333', padding: 16, marginTop: 16 }}>
			Account modal (intercepting route). Now click the button above.
		</div>
	)
}
