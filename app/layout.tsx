/*
 * Root layout. Prints which deployment rendered the page so a tester can tell builds apart.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body style={{ fontFamily: 'system-ui', padding: 24 }}>
				<p>
					Rendered by deployment: <code id="rendered-by">{process.env.VERCEL_DEPLOYMENT_ID ?? 'local'}</code>
				</p>
				{children}
			</body>
		</html>
	)
}
