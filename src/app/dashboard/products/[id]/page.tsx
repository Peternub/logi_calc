import ProductDetail from '@/components/products/ProductDetail'

interface ProductPageProps {
  params: {
    id: string
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  return <ProductDetail productId={params.id} />
}