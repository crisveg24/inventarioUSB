import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award } from "lucide-react"
import type { InventoryStats } from "@/lib/inventory-data"
import { formatCurrency } from "@/lib/inventory-data"

interface TopItemsTableProps {
  stats: InventoryStats
}

export function TopItemsTable({ stats }: TopItemsTableProps) {
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-4 w-4 text-yellow-500" />
      case 1:
        return <Medal className="h-4 w-4 text-gray-400" />
      case 2:
        return <Award className="h-4 w-4 text-amber-600" />
      default:
        return <span className="h-4 w-4 text-center text-sm font-bold text-muted-foreground">#{index + 1}</span>
    }
  }

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">1º</Badge>
      case 1:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">2º</Badge>
      case 2:
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">3º</Badge>
      default:
        return <Badge variant="outline">{index + 1}º</Badge>
    }
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Productos de Mayor Valor
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Top 5 productos por valor total en inventario
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="text-muted-foreground w-16">Ranking</TableHead>
              <TableHead className="text-muted-foreground">Producto</TableHead>
              <TableHead className="text-muted-foreground text-center">Cantidad</TableHead>
              <TableHead className="text-muted-foreground text-right">Valor Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.topItems.map((item, index) => (
              <TableRow key={index} className="border-border hover:bg-muted/50 transition-colors">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {getRankIcon(index)}
                    {getRankBadge(index)}
                  </div>
                </TableCell>
                <TableCell className="font-medium text-foreground">
                  <div className="flex flex-col">
                    <span className="font-semibold">{item.name}</span>
                    <span className="text-xs text-muted-foreground">ID: {index + 1}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary" className="font-mono">
                    {item.quantity}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col items-end">
                    <span className="font-bold text-lg text-foreground">
                      {formatCurrency(item.value)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatCurrency(item.value / item.quantity)}/unidad
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
