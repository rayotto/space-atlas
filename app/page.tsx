'use client'

import type React from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Info, Pause, Play, RotateCcw } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

// Planet data with realistic properties
const PLANETS = [
	{
		name: 'Mercury',
		radius: 8,
		distance: 120,
		speed: 0.02,
		color: '#8C7853',
		info: {
			surfaceTemp: '-173°C to 427°C',
			dayLength: '58.6 Earth days',
			yearLength: '88 Earth days',
			composition: '70% metallic, 30% silicate',
		},
	},
	{
		name: 'Venus',
		radius: 12,
		distance: 160,
		speed: 0.015,
		color: '#FFC649',
		info: {
			surfaceTemp: '462°C',
			dayLength: '243 Earth days',
			yearLength: '225 Earth days',
			atmosphere: '96% CO₂, thick clouds',
		},
	},
	{
		name: 'Earth',
		radius: 14,
		distance: 200,
		speed: 0.01,
		color: '#6B93D6',
		info: {
			surfaceTemp: '-89°C to 58°C',
			dayLength: '24 hours',
			yearLength: '365.25 days',
			waterCoverage: '71% water coverage',
		},
	},
	{
		name: 'Mars',
		radius: 10,
		distance: 240,
		speed: 0.008,
		color: '#CD5C5C',
		info: {
			surfaceTemp: '-87°C to -5°C',
			dayLength: '24.6 hours',
			yearLength: '687 Earth days',
			atmosphere: 'Thin, mostly CO₂',
		},
	},
	{
		name: 'Jupiter',
		radius: 35,
		distance: 320,
		speed: 0.005,
		color: '#D8CA9D',
		info: {
			surfaceTemp: '-108°C',
			dayLength: '9.9 hours',
			yearLength: '12 Earth years',
			composition: 'Gas giant, 79 moons',
		},
	},
	{
		name: 'Saturn',
		radius: 30,
		distance: 400,
		speed: 0.003,
		color: '#FAD5A5',
		info: {
			surfaceTemp: '-139°C',
			dayLength: '10.7 hours',
			yearLength: '29 Earth years',
			features: 'Prominent ring system',
		},
	},
	{
		name: 'Uranus',
		radius: 20,
		distance: 480,
		speed: 0.002,
		color: '#4FD0E7',
		info: {
			surfaceTemp: '-197°C',
			dayLength: '17.2 hours',
			yearLength: '84 Earth years',
			tilt: 'Rotates on its side',
		},
	},
	{
		name: 'Neptune',
		radius: 18,
		distance: 560,
		speed: 0.001,
		color: '#4B70DD',
		info: {
			surfaceTemp: '-201°C',
			dayLength: '16.1 hours',
			yearLength: '165 Earth years',
			winds: 'Fastest winds in solar system',
		},
	},
]

interface Planet {
	name: string
	radius: number
	distance: number
	speed: number
	color: string
	info: Record<string, string>
	angle?: number
	x?: number
	y?: number
}

interface Star {
	x: number
	y: number
	size: number
	opacity: number
}

const generateStars = (width: number, height: number, count = 300): Star[] => {
	const stars: Star[] = []
	for (let i = 0; i < count; i++) {
		stars.push({
			x: Math.random() * width,
			y: Math.random() * height,
			size: Math.random() * 1.5 + 0.5,
			opacity: Math.random() * 0.8 + 0.2,
		})
	}
	return stars
}

export default function SpaceAtlas() {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const animationRef = useRef<number>()
	// Инициализация пустыми, наполнение только на клиенте
	const planetsRef = useRef<Planet[]>([])
	const starsRef = useRef<Star[]>([])
	// Генерация случайных данных только на клиенте
	useEffect(() => {
		planetsRef.current = PLANETS.map(planet => ({
			...planet,
			angle: Math.random() * Math.PI * 2,
		}))
		if (canvasRef.current) {
			starsRef.current = generateStars(
				canvasRef.current.width,
				canvasRef.current.height
			)
		}
	}, [])
	const isPlayingRef = useRef(true)
	const speedRef = useRef(1)
	const zoomRef = useRef(1)

	const [isPlaying, setIsPlaying] = useState(true)
	const [speed, setSpeed] = useState([1])
	const [selectedPlanet, setSelectedPlanet] = useState<Planet>(PLANETS[2]) // Default to Earth
	const [rotation, setRotation] = useState({ x: 0, y: 0 })
	const [zoom, setZoom] = useState(1)
	const [isDragging, setIsDragging] = useState(false)
	const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 })

	useEffect(() => {
		isPlayingRef.current = isPlaying
	}, [isPlaying])

	useEffect(() => {
		speedRef.current = speed[0]
	}, [speed])

	useEffect(() => {
		zoomRef.current = zoom
	}, [zoom])

	const drawStars = useCallback(
		(ctx: CanvasRenderingContext2D, stars: Star[]) => {
			stars.forEach(star => {
				ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`
				ctx.beginPath()
				ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
				ctx.fill()
			})
		},
		[]
	)

	const drawPlanet = useCallback(
		(
			ctx: CanvasRenderingContext2D,
			planet: Planet,
			centerX: number,
			centerY: number,
			isSelected: boolean
		) => {
			const currentZoom = zoomRef.current
			const x =
				centerX + Math.cos(planet.angle!) * planet.distance * currentZoom
			const y =
				centerY + Math.sin(planet.angle!) * planet.distance * currentZoom

			// Store position for click detection
			planet.x = x
			planet.y = y

			// Draw orbit path
			ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
			ctx.lineWidth = 1
			ctx.beginPath()
			ctx.arc(centerX, centerY, planet.distance * currentZoom, 0, Math.PI * 2)
			ctx.stroke()

			// Draw planet
			const radius = planet.radius * currentZoom
			ctx.fillStyle = planet.color
			ctx.beginPath()
			ctx.arc(x, y, radius, 0, Math.PI * 2)
			ctx.fill()

			// Add glow effect for selected planet
			if (isSelected) {
				ctx.shadowColor = planet.color
				ctx.shadowBlur = 20
				ctx.beginPath()
				ctx.arc(x, y, radius + 2, 0, Math.PI * 2)
				ctx.stroke()
				ctx.shadowBlur = 0
			}

			// Draw planet name
			ctx.fillStyle = '#ffffff'
			ctx.font = '12px sans-serif'
			ctx.textAlign = 'center'
			ctx.fillText(planet.name, x, y + radius + 15)
		},
		[]
	)

	const drawSun = useCallback(
		(ctx: CanvasRenderingContext2D, centerX: number, centerY: number) => {
			const currentZoom = zoomRef.current
			const sunRadius = 25 * currentZoom

			// Sun glow
			const gradient = ctx.createRadialGradient(
				centerX,
				centerY,
				0,
				centerX,
				centerY,
				sunRadius * 2
			)
			gradient.addColorStop(0, '#FDB813')
			gradient.addColorStop(0.5, '#FFAA00')
			gradient.addColorStop(1, 'rgba(255, 170, 0, 0)')

			ctx.fillStyle = gradient
			ctx.beginPath()
			ctx.arc(centerX, centerY, sunRadius * 2, 0, Math.PI * 2)
			ctx.fill()

			// Sun core
			ctx.fillStyle = '#FDB813'
			ctx.beginPath()
			ctx.arc(centerX, centerY, sunRadius, 0, Math.PI * 2)
			ctx.fill()
		},
		[]
	)

	const animate = useCallback(() => {
		const canvas = canvasRef.current
		if (!canvas) return

		const ctx = canvas.getContext('2d')
		if (!ctx) return

		const { width, height } = canvas
		const centerX = width / 2
		const centerY = height / 2

		// Clear canvas with space background
		ctx.fillStyle = '#000011'
		ctx.fillRect(0, 0, width, height)

		drawStars(ctx, starsRef.current)

		// Draw sun
		drawSun(ctx, centerX, centerY)

		// Update and draw planets
		if (isPlayingRef.current) {
			planetsRef.current = planetsRef.current.map(planet => ({
				...planet,
				angle: planet.angle! + planet.speed * speedRef.current,
			}))
		}

		planetsRef.current.forEach(planet => {
			drawPlanet(
				ctx,
				planet,
				centerX,
				centerY,
				planet.name === selectedPlanet.name
			)
		})

		animationRef.current = requestAnimationFrame(animate)
	}, [selectedPlanet.name, drawStars, drawSun, drawPlanet])

	useEffect(() => {
		const canvas = canvasRef.current
		if (!canvas) return

		const resizeCanvas = () => {
			canvas.width = canvas.offsetWidth
			canvas.height = canvas.offsetHeight
			starsRef.current = generateStars(canvas.width, canvas.height)
		}

		resizeCanvas()
		window.addEventListener('resize', resizeCanvas)

		const startAnimation = () => {
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current)
			}
			animationRef.current = requestAnimationFrame(animate)
		}

		startAnimation()

		return () => {
			window.removeEventListener('resize', resizeCanvas)
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current)
			}
		}
	}, [animate])

	const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
		const canvas = canvasRef.current
		if (!canvas) return

		const rect = canvas.getBoundingClientRect()
		const clickX = e.clientX - rect.left
		const clickY = e.clientY - rect.top

		// Check if click is on any planet
		planetsRef.current.forEach(planet => {
			if (planet.x && planet.y) {
				const distance = Math.sqrt(
					Math.pow(clickX - planet.x, 2) + Math.pow(clickY - planet.y, 2)
				)
				if (distance <= planet.radius * zoomRef.current + 5) {
					setSelectedPlanet(planet)
				}
			}
		})
	}

	const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
		setIsDragging(true)
		setLastMouse({ x: e.clientX, y: e.clientY })
	}

	const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
		if (!isDragging) return

		const deltaX = e.clientX - lastMouse.x
		const deltaY = e.clientY - lastMouse.y

		setRotation(prev => ({
			x: prev.x + deltaY * 0.01,
			y: prev.y + deltaX * 0.01,
		}))

		setLastMouse({ x: e.clientX, y: e.clientY })
	}

	const handleMouseUp = () => {
		setIsDragging(false)
	}

	const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
		e.preventDefault()
		const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
		setZoom(prev => Math.max(0.3, Math.min(2, prev * zoomFactor)))
	}

	const togglePlayPause = () => {
		setIsPlaying(!isPlaying)
	}

	const resetView = () => {
		setZoom(1)
		setRotation({ x: 0, y: 0 })
		planetsRef.current = PLANETS.map(planet => ({
			...planet,
			angle: Math.random() * Math.PI * 2,
		}))
	}

	return (
		<div className='min-h-screen bg-gray-900 text-white overflow-hidden'>
			{/* Header */}
			<header className='absolute top-0 left-0 right-0 z-10 p-6'>
				<div className='flex items-center justify-between'>
					<div>
						<h1 className='text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent'>
							Space Atlas
						</h1>
						<p className='text-gray-400 mt-1'>
							Interactive 3D visualization of our solar system
						</p>
					</div>

					<div className='flex items-center gap-4'>
						<Button
							variant='outline'
							size='sm'
							onClick={togglePlayPause}
							className='bg-gray-800/50 border-gray-600 hover:bg-gray-700/50'
						>
							{isPlaying ? (
								<Pause className='w-4 h-4' />
							) : (
								<Play className='w-4 h-4' />
							)}
							{isPlaying ? 'Pause' : 'Play'}
						</Button>

						<Button
							variant='outline'
							size='sm'
							onClick={resetView}
							className='bg-gray-800/50 border-gray-600 hover:bg-gray-700/50'
						>
							<RotateCcw className='w-4 h-4' />
							Reset
						</Button>
					</div>
				</div>
			</header>

			{/* Main Canvas */}
			<canvas
				ref={canvasRef}
				className='w-full h-screen cursor-grab active:cursor-grabbing'
				onClick={handleCanvasClick}
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUp}
				onMouseLeave={handleMouseUp}
				onWheel={handleWheel}
			/>

			{/* Speed Control */}
			<div className='absolute bottom-6 left-6 z-10'>
				<Card className='bg-gray-800/80 border-gray-600 p-4 backdrop-blur-sm'>
					<div className='flex items-center gap-4 min-w-[200px]'>
						<span className='text-sm text-gray-300'>Speed:</span>
						<Slider
							value={speed}
							onValueChange={setSpeed}
							max={3}
							min={0.1}
							step={0.1}
							className='flex-1'
						/>
						<Badge variant='secondary' className='bg-gray-700 text-white'>
							{speed[0].toFixed(1)}x
						</Badge>
					</div>
					<div className='text-xs text-gray-400 mt-2'>
						<div>Slow ←→ Fast</div>
					</div>
				</Card>
			</div>

			{/* Planet Info Panel */}
			<div className='absolute top-20 right-6 z-10 w-80'>
				<Card className='bg-gray-800/90 border-gray-600 backdrop-blur-sm'>
					<div className='p-6'>
						<div className='flex items-center gap-3 mb-4'>
							<div
								className='w-6 h-6 rounded-full'
								style={{ backgroundColor: selectedPlanet.color }}
							/>
							<h2 className='text-xl font-bold'>{selectedPlanet.name}</h2>
						</div>

						<div className='space-y-3'>
							{Object.entries(selectedPlanet.info).map(([key, value]) => (
								<div key={key} className='flex justify-between items-start'>
									<span className='text-gray-400 text-sm capitalize'>
										{key.replace(/([A-Z])/g, ' $1').trim()}:
									</span>
									<span className='text-white text-sm font-medium text-right ml-2'>
										{value}
									</span>
								</div>
							))}
						</div>
					</div>
				</Card>
			</div>

			{/* Controls Info */}
			<div className='absolute bottom-6 right-6 z-10'>
				<Card className='bg-gray-800/80 border-gray-600 p-4 backdrop-blur-sm'>
					<div className='flex items-start gap-2'>
						<Info className='w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0' />
						<div className='text-xs text-gray-300 space-y-1'>
							<div>
								• <strong>Drag:</strong> Rotate view
							</div>
							<div>
								• <strong>Scroll:</strong> Zoom in/out
							</div>
							<div>
								• <strong>Click planet:</strong> View details
							</div>
						</div>
					</div>
				</Card>
			</div>
		</div>
	)
}
