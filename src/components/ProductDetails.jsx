"use client";

import React, { useState } from "react";
import PropTypes from "prop-types";
import { ProductGallery } from "@/components/ProductGallery";
import {
  ColorSelector,
  SizeSelector,
} from "@/components/optimized/MemoizedComponents";
import { StockIndicator } from "@/components/StockIndicator";
import { SimilarProducts } from "@/components/SimilarProducts";
import { PageHeader } from "@/components/products/PageHeader";
import { ProductInfo } from "@/components/products/ProductInfo";
import { ProductActions } from "@/components/products/ProductActions";

const FAVORITE_ICON_URL =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favoris-rFbzZ8XXTdAshbnnWySWyYGmzz830d.png";
const DELIVERY_ICON_URL =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/livraison-kt21gvf0xi94NZI1mJAbRMOxk8Xw8s.png";

export function ProductDetails({ product, onAddToCart }) {
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  const { id, name, description, price, images } = product;

  return (
    <div className="max-w-[1400px] mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <StockIndicator />
        </div>
      </div>
    </div>
  );
}

ProductDetails.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    images: PropTypes.arrayOf(PropTypes.string).isRequired,
    colors: PropTypes.arrayOf(PropTypes.string).isRequired,
    variants: PropTypes.arrayOf(
      PropTypes.shape({
        size: PropTypes.string.isRequired,
        color: PropTypes.string.isRequired,
        stock: PropTypes.number.isRequired,
      }),
    ).isRequired,
  }).isRequired,
  onAddToCart: PropTypes.func.isRequired,
};
