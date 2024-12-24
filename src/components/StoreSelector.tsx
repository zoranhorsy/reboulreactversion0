import Link from 'next/link'
import { motion } from 'framer-motion'
import styled from 'styled-components'

const stores = [
    { name: 'Adulte', href: '/adulte', image: '/images/adult-store.jpg' },
    { name: 'Enfant', href: '/minots', image: '/images/kids-store.jpg' },
    { name: 'Sneakers', href: '/sneakers', image: '/images/sneakers-store.jpg' },
]

const StyledWrapper = styled.div`
  .card {
    position: relative;
    width: 300px;
    height: 200px;
    background-color: #f2f2f2;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    perspective: 1000px;
    box-shadow: 0 0 0 5px #ffffff80;
    transition: all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .card img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .card:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 16px rgba(255, 255, 255, 0.2);
  }

  .card__content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 20px;
    box-sizing: border-box;
    background-color: rgba(0, 0, 0, 0.7);
    transform: rotateX(-90deg);
    transform-origin: bottom;
    transition: all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .card:hover .card__content {
    transform: rotateX(0deg);
  }

  .card__title {
    margin: 0;
    font-size: 24px;
    color: #fff;
    font-weight: 700;
    text-align: center;
  }

  .card:hover img {
    transform: scale(1.2);
  }
`

export function StoreSelector() {
    return (
        <section className="bg-gradient-to-b from-white to-gray-100 py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mx-auto max-w-2xl text-center mb-16"
                >
                    <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                        Explorez nos univers
                    </h2>
                    <p className="mt-4 text-lg leading-8 text-gray-600">
                        Plongez dans nos collections uniques, conçues pour tous les styles et tous les âges.
                    </p>
                </motion.div>
                <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 justify-items-center">
                    {stores.map((store, index) => (
                        <motion.div
                            key={store.name}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <StyledWrapper>
                                <Link href={store.href} passHref>
                                    <div className="card">
                                        <img src={store.image} alt={`${store.name} store`} />
                                        <div className="card__content">
                                            <p className="card__title">{store.name}</p>
                                        </div>
                                    </div>
                                </Link>
                            </StyledWrapper>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

