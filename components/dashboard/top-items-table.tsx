import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { InventoryStats } from "@/lib/inventory-data"
import { formatCurrency } from "@/lib/inventory-data"

interface TopItemsTableProps {
  stats: InventoryStats
}

export function TopItemsTable({ stats }: TopItemsTableProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">Productos de Mayor Valor</CardTitle>
        <CardDescription className="text-muted-foreground">
          Top 5 productos por valor total en inventario
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="text-muted-foreground">Producto</TableHead>
              <TableHead className="text-muted-foreground">Cantidad</TableHead>
              <TableHead className="text-muted-foreground text-right">Valor Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.topItems.map((item, index) => (
              <TableRow key={index} className="border-border">
                <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                <TableCell className="text-muted-foreground">{item.quantity}</TableCell>
                <TableCell className="text-right text-foreground font-medium">{formatCurrency(item.value)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
