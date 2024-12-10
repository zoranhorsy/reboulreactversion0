import Image from 'next/image'

export default function About() {
    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">À propos de Reboul Store</h1>
            <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="md:w-1/2">
                    <Image
                        src="/placeholder.svg"
                        alt="Reboul Store"
                        width={500}
                        height={300}
                        className="rounded-lg shadow-md"
                    />
                </div>
                <div className="md:w-1/2">
                    <p className="mb-4">
                        Reboul Store est votre destination de choix pour les v&apos;tements premium &agrave; Marseille. Fond&eacute;e en 2010, notre boutique s&apos;est sp&eacute;cialis&eacute;e dans les marques haut de gamme telles que Stone Island et CP Company.
                    </p>
                    <p className="mb-4">
                        Notre passion pour la mode et notre engagement envers la qualit&eacute; nous permettent d&apos;offrir &agrave; nos clients une s&eacute;lection soigneusement choisie de v&ecirc;tements et d&apos;accessoires qui allient style, confort et innovation.
                    </p>
                    <p>
                        Chez Reboul Store, nous croyons que la mode est une forme d&apos;expression personnelle. C&apos;est pourquoi nous nous effor&ccedil;ons de proposer des pi&egrave;ces uniques qui refl&egrave;tent l&apos;individualit&eacute; de chacun de nos clients.
                    </p>
                </div>
            </div>
        </div>
    )
}

