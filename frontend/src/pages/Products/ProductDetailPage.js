// frontend/src/pages/Products/ProductDetailPage.js
import React from 'react';
import { useParams } from 'react-router-dom';

export default function ProductDetailPage() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Detail Produk</h1>
      <div className="card">
        <p>Product ID: {id}</p>
        {/* Form will be implemented here */}
      </div>
    </div>
  );
}
