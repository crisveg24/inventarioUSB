export interface InventoryItem {
  id: string
  name: string
  category: string
  quantity: number
  minStock: number
  price: number
  supplier: string
  lastUpdated: string
  status: "in-stock" | "low-stock" | "out-of-stock"
}

export interface InventoryStats {
  totalItems: number
  totalValue: number
  lowStockItems: number
  outOfStockItems: number
  categories: { name: string; count: number; value: number }[]
  monthlyMovement: { month: string; inbound: number; outbound: number }[]
  topItems: { name: string; quantity: number; value: number }[]
}

// Mock data for demonstration
export const mockInventoryData: InventoryItem[] = [
  {
    id: "INV001",
    name: "Laptop Dell Inspiron 15",
    category: "Electrónicos",
    quantity: 25,
    minStock: 10,
    price: 2500000,
    supplier: "Dell Colombia",
    lastUpdated: "2024-01-15",
    status: "in-stock",
  },
  {
    id: "INV002",
    name: "Mouse Inalámbrico Logitech",
    category: "Accesorios",
    quantity: 5,
    minStock: 15,
    price: 85000,
    supplier: "Logitech",
    lastUpdated: "2024-01-14",
    status: "low-stock",
  },
  {
    id: "INV003",
    name: 'Monitor Samsung 24"',
    category: "Electrónicos",
    quantity: 0,
    minStock: 8,
    price: 650000,
    supplier: "Samsung",
    lastUpdated: "2024-01-13",
    status: "out-of-stock",
  },
  {
    id: "INV004",
    name: "Teclado Mecánico RGB",
    category: "Accesorios",
    quantity: 18,
    minStock: 12,
    price: 320000,
    supplier: "Corsair",
    lastUpdated: "2024-01-15",
    status: "in-stock",
  },
  {
    id: "INV005",
    name: "Impresora HP LaserJet",
    category: "Oficina",
    quantity: 8,
    minStock: 5,
    price: 1200000,
    supplier: "HP Inc",
    lastUpdated: "2024-01-12",
    status: "in-stock",
  },
  {
    id: "INV006",
    name: "Cables HDMI",
    category: "Accesorios",
    quantity: 3,
    minStock: 20,
    price: 25000,
    supplier: "Varios",
    lastUpdated: "2024-01-11",
    status: "low-stock",
  },
]

export const getInventoryStats = (): InventoryStats => {
  const totalItems = mockInventoryData.reduce((sum, item) => sum + item.quantity, 0)
  const totalValue = mockInventoryData.reduce((sum, item) => sum + item.quantity * item.price, 0)
  const lowStockItems = mockInventoryData.filter((item) => item.status === "low-stock").length
  const outOfStockItems = mockInventoryData.filter((item) => item.status === "out-of-stock").length

  const categories = mockInventoryData.reduce(
    (acc, item) => {
      const existing = acc.find((cat) => cat.name === item.category)
      if (existing) {
        existing.count += item.quantity
        existing.value += item.quantity * item.price
      } else {
        acc.push({
          name: item.category,
          count: item.quantity,
          value: item.quantity * item.price,
        })
      }
      return acc
    },
    [] as { name: string; count: number; value: number }[],
  )

  const monthlyMovement = [
    { month: "Ene", inbound: 120, outbound: 95 },
    { month: "Feb", inbound: 85, outbound: 110 },
    { month: "Mar", inbound: 150, outbound: 88 },
    { month: "Abr", inbound: 95, outbound: 125 },
    { month: "May", inbound: 180, outbound: 92 },
    { month: "Jun", inbound: 75, outbound: 140 },
  ]

  const topItems = mockInventoryData
    .map((item) => ({
      name: item.name,
      quantity: item.quantity,
      value: item.quantity * item.price,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)

  return {
    totalItems,
    totalValue,
    lowStockItems,
    outOfStockItems,
    categories,
    monthlyMovement,
    topItems,
  }
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount)
}
