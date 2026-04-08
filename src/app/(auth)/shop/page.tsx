import { Palette, Sparkles, Droplets, type LucideIcon } from "lucide-react";

export default function ShopPage() {
  return (
    <div className="px-5 pt-12">
      <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-semibold text-nb-dark">
        NB Shop
      </h1>
      <p className="mt-1 text-sm text-nb-gray-warm">
        Produtos Flow para sua clinica
      </p>

      <div className="mt-8 space-y-4">
        {products.map((product) => (
          <div
            key={product.name}
            className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-nb-pink-soft">
              <product.icon className="h-6 w-6 text-nb-pink" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-nb-dark">
                {product.name}
              </p>
              <p className="text-xs text-nb-gray-warm">{product.description}</p>
              <p className="mt-1 text-sm font-bold text-nb-pink-dark">
                R$ {product.price}
              </p>
            </div>
            <button className="rounded-full bg-nb-pink px-4 py-2 text-xs font-medium text-white transition-all active:scale-95">
              Pedir
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const products: { name: string; description: string; price: string; icon: LucideIcon }[] = [
  {
    name: "Kit Pigmento Flow",
    description: "5 tons essenciais",
    price: "189,90",
    icon: Palette,
  },
  {
    name: "Agulha Nano Flow",
    description: "Caixa c/ 20 unidades",
    price: "79,90",
    icon: Sparkles,
  },
  {
    name: "Creme Cicatrizante NB",
    description: "Pos-procedimento 30g",
    price: "49,90",
    icon: Droplets,
  },
];
