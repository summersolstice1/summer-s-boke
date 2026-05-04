'use client'

const stars = Array.from({ length: 90 }, (_, index) => {
	const left = (index * 37 + (index % 7) * 11) % 100
	const top = (index * 53 + (index % 5) * 13) % 100
	const size = 1 + (index % 4) * 0.7
	const delay = (index % 11) * 0.35
	const opacity = 0.25 + (index % 5) * 0.12

	return { left, top, size, delay, opacity }
})

export default function PlanetaryBackdrop() {
	return (
		<div className='planetary-backdrop' aria-hidden='true'>
			<div className='planetary-aurora planetary-aurora--one' />
			<div className='planetary-aurora planetary-aurora--two' />
			<div className='planetary-stars'>
				{stars.map((star, index) => (
					<span
						key={index}
						style={{
							left: `${star.left}%`,
							top: `${star.top}%`,
							width: star.size,
							height: star.size,
							animationDelay: `${star.delay}s`,
							opacity: star.opacity
						}}
					/>
				))}
			</div>
			<div className='planetary-orbit planetary-orbit--wide' />
			<div className='planetary-orbit planetary-orbit--near' />
			<div className='planetary-body planetary-body--main'>
				<span className='planetary-body__ring' />
				<span className='planetary-body__spot planetary-body__spot--one' />
				<span className='planetary-body__spot planetary-body__spot--two' />
			</div>
			<div className='planetary-body planetary-body--small' />
			<div className='planetary-meteor planetary-meteor--one' />
			<div className='planetary-meteor planetary-meteor--two' />
		</div>
	)
}
