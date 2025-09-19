import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award, AlertTriangle, Shield, Zap } from "lucide-react"

interface TopItemsTableProps {
  stats: any
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

  const getCriticalityBadge = (criticality: string) => {
    const crit = criticality?.toLowerCase() || 'sin datos'
    if (crit.includes('alto')) {
      return <Badge className="bg-red-100 text-red-800 border-red-200"><AlertTriangle className="h-3 w-3 mr-1" />Alto</Badge>
    } else if (crit.includes('medio')) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Zap className="h-3 w-3 mr-1" />Medio</Badge>
    } else if (crit.includes('bajo')) {
      return <Badge className="bg-green-100 text-green-800 border-green-200"><Shield className="h-3 w-3 mr-1" />Bajo</Badge>
    } else {
      return <Badge variant="outline">Sin datos</Badge>
    }
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Activos Principales
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Lista de activos en el inventario por tipo y criticidad
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="text-muted-foreground w-16">Ranking</TableHead>
              <TableHead className="text-muted-foreground">Activo</TableHead>
              <TableHead className="text-muted-foreground text-center">Tipo</TableHead>
              <TableHead className="text-muted-foreground text-center">Criticidad</TableHead>
              <TableHead className="text-muted-foreground text-center">Proceso</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.topItems?.map((item: any, index: number) => (
              <TableRow key={index} className="border-border hover:bg-muted/50 transition-colors">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {getRankIcon(index)}
                  </div>
                </TableCell>
                <TableCell className="font-medium text-foreground">
                  <div className="flex flex-col">
                    <span className="font-semibold">{item.name}</span>
                    <span className="text-xs text-muted-foreground">Activo #{index + 1}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary" className="font-mono">
                    {item.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  {getCriticalityBadge(item.criticality)}
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-sm font-medium">
                    {item.process}
                  </span>
                </TableCell>
              </TableRow>
            )) || []}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
