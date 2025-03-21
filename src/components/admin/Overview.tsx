import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface WeeklySales {
    date: string
    total: number
}

interface OverviewProps {
    data?: WeeklySales[]
}

export function Overview({ data = [] }: OverviewProps) {
    if (!data || data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Vue d&apos;ensemble</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-muted-foreground">
                        Aucune donnée disponible
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Vue d&apos;ensemble</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                            dataKey="date"
                            stroke="#888888"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: '10px' }}
                            tickFormatter={(value) => {
                                const date = new Date(value);
                                return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
                            }}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}€`}
                            width={45}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--background))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '6px',
                                fontSize: '12px'
                            }}
                            formatter={(value: number) => [
                                `${value.toLocaleString('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR',
                                    maximumFractionDigits: 0
                                })}`,
                                'Total'
                            ]}
                            labelFormatter={(label) => {
                                const date = new Date(label);
                                return date.toLocaleDateString('fr-FR', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long'
                                });
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="total"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            dot={{
                                r: 4,
                                fill: 'hsl(var(--background))',
                                strokeWidth: 2
                            }}
                            activeDot={{
                                r: 6,
                                fill: 'hsl(var(--primary))',
                                strokeWidth: 0
                            }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
} 