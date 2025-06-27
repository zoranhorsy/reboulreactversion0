"use client";

import React from "react";
import Link from "next/link";

export function ReboulNavbar() {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Reboul Store
            </Link>
          </div>

          <div className="flex items-center space-x-8">
            <Link
              href="/catalogue"
              className="text-gray-700 hover:text-gray-900"
            >
              Catalogue
            </Link>
            <Link
              href="/the-corner"
              className="text-gray-700 hover:text-gray-900"
            >
              The Corner
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-gray-900">
              À propos
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-gray-900">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
