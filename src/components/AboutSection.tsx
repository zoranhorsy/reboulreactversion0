import Image from "next/image";
import Link from "next/link";

export function AboutSection() {
  return (
    <section className="about-section bg-gray-100 py-24">
      <div className="container mx-auto px-4">
        <h2 className="animate-on-scroll text-3xl font-bold mb-8 text-center text-black">
          À propos de Reboul Store
        </h2>
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="lg:w-1/2 animate-on-scroll">
            <Image
              src="/placeholder.svg"
              alt="Reboul Store"
              width={600}
              height={400}
              className="about-image rounded-lg shadow-md"
            />
          </div>
          <div className="about-text lg:w-1/2">
            <p className="animate-on-scroll text-gray-700 mb-6">
              Depuis notre création, Reboul Store s&apos;est imposé comme la
              référence en matière de mode premium à Marseille. Notre passion
              pour les vêtements de qualité et notre engagement envers
              l&apos;excellence nous permettent de vous offrir une sélection
              unique des meilleures marques internationales.
            </p>
            <p className="animate-on-scroll text-gray-700 mb-6">
              Chez Reboul Store, nous croyons que le style est une expression de
              soi. C&apos;est pourquoi nous nous efforçons de proposer une gamme
              diversifiée de vêtements et d&apos;accessoires qui répondent aux
              goûts et aux besoins de notre clientèle exigeante.
            </p>
            <Link
              href="/about"
              className="animate-on-scroll text-black font-semibold hover:underline"
            >
              En savoir plus sur nous
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
