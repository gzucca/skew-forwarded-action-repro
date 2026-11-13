/*
 * Layout with a parallel `@settings` slot. The slot holds an intercepting modal route, so the
 * background page stays mounted while the browser URL points at the modal route.
 */
export default function OrgLayout({ children, settings }: { children: React.ReactNode; settings: React.ReactNode }) {
	return (
		<>
			{children}
			{settings}
		</>
	)
}
