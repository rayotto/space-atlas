import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import type React from 'react'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-space-grotesk',
})

const inter = Inter({
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-inter',
})

export const metadata: Metadata = {
	title: 'Space Atlas',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html
			lang='en'
			className={`${spaceGrotesk.variable} ${inter.variable} antialiased`}
		>
			<body className='font-sans'>{children}</body>
		</html>
	)
}
