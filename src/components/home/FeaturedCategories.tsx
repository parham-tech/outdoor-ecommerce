import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export interface CategoryCardItem {
  id: string;
  name: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
}

export interface FeaturedCategoriesProps {
  categories?: CategoryCardItem[];
}

const DEFAULT_CATEGORIES: CategoryCardItem[] = [
  {
    id: 'tents-shelters',
    name: 'Tents & Shelters',
    href: '#catalog',
    imageSrc: '/images/categories/tents-shelters.jpg',
    imageAlt: 'Backpacking tent pitched on an alpine ridge at sunrise',
  },
  {
    id: 'backpacks-packs',
    name: 'Backpacks & Packs',
    href: '#catalog',
    imageSrc: '/images/categories/backpacks-packs.jpg',
    imageAlt: 'Technical expedition backpack resting on a rocky mountain summit',
  },
  {
    id: 'camp-kitchen',
    name: 'Camp Kitchen',
    href: '#catalog',
    imageSrc: '/images/categories/camp-kitchen.jpg',
    imageAlt: 'Camp stove and cookware set on a mountain peak at morning light',
  },
  {
    id: 'lighting-accessories',
    name: 'Lighting & Lanterns',
    href: '#catalog',
    imageSrc: '/images/categories/lighting-accessories.jpg',
    imageAlt: 'Glowing vintage lantern overlooking alpine mountains at sunset',
  },
];

export function FeaturedCategories({
  categories = DEFAULT_CATEGORIES,
}: FeaturedCategoriesProps) {
  return (
    <section
      aria-labelledby="featured-categories-heading"
      className="w-full bg-white py-12 sm:py-16 lg:py-20"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Heading */}
        <div className="mb-8 sm:mb-10 text-left">
          <p className="text-xs sm:text-sm font-bold tracking-widest text-[#2E4D36]/75 uppercase mb-1.5">
            SHOP BY CATEGORY
          </p>
          <h2
            id="featured-categories-heading"
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1C3323] tracking-tight font-sans"
          >
            Featured Categories
          </h2>
        </div>

        {/* 4-Column Category Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className="group block relative lg:aspect-square  aspect-[4/3] sm:aspect-video overflow-hidden rounded-2xl bg-neutral-100 shadow-xs hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E4D36] focus-visible:ring-offset-2"
              aria-label={`Shop ${category.name}`}
            >
              <Image
                src={category.imageSrc}
                alt={category.imageAlt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
