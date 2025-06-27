import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SizeChartItem {
  size: string;
  chest: number;
  waist: number;
  hips: number;
}

interface SizeChartProps {
  sizeChart?: SizeChartItem[];
}

export function SizeChart({ sizeChart }: SizeChartProps) {
  if (!sizeChart || sizeChart.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Guide des tailles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Aucune information de taille n&apos;est disponible pour ce produit.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Guide des tailles
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Taille</TableHead>
              <TableHead>Poitrine (cm)</TableHead>
              <TableHead>Taille (cm)</TableHead>
              <TableHead>Hanches (cm)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sizeChart.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.size}</TableCell>
                <TableCell>{item.chest}</TableCell>
                <TableCell>{item.waist}</TableCell>
                <TableCell>{item.hips}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
