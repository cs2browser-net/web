import { trpc } from "@/lib/trpc/client";
import { JsonObject } from "@prisma/client/runtime/client";
import { useMemo, useState } from "react";
import LoadingState from "../metrics/LoadingState";
import ModeChanger from "../metrics/ModeChanger";
import Legend from "../metrics/Legend";
import Charts from "../metrics/Charts";
import Informations from "../metrics/Informations";

export default function MetricsPage() {
    const [mode, setMode] = useState<'24h' | '7d' | '30d'>('24h');

    const { data, isLoading } = trpc.metrics.fetchMetrics.useQuery({
        mode: mode
    });

    const chartData = useMemo(() => {
        if (!data) return [];

        const checkedEntries = Object.entries(data.checked as JsonObject) as unknown as Record<string, number>[];
        return checkedEntries.map((record) => {
            // @ts-expect-error
            const [timestamp, checkedValue] = record;
            // @ts-expect-error
            const prefilterValue = data.prefiltered[timestamp] || 0;
            // @ts-expect-error
            const playersValue = data.players[timestamp] || 0;

            return {
                timestamp,
                checked: Number(checkedValue) || 0,
                prefilter: Number(prefilterValue) || 0,
                players: Number(playersValue) || 0,
                formattedTime: mode === "24h"
                    ? new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                    : new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            };
        })
            .filter(item => item.checked > 0 || item.prefilter > 0 || item.players > 0)
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());;
    }, [data, mode]);

    const serversChartData = useMemo(() => {
        const filtered = chartData.filter(item => item.checked > 0 || item.prefilter > 0);
        return filtered.map((v, i, arr) => {
            if (i === 0) {
                return { ...v, prefilterDiff: 0 };
            } else {
                return { ...v, prefilterDiff: Math.abs(arr[i - 1].prefilter - v.prefilter) };
            }
        });
    }, [chartData]);

    const playersChartData = useMemo(() => {
        return chartData.filter(item => item.players > 0);
    }, [chartData]);

    const currentStats = useMemo(() => {
        if (chartData.length === 0) return { checked: 0, prefilter: 0, players: 0 };
        const latest = chartData[chartData.length - 1];
        return {
            checked: latest.checked,
            prefilter: latest.prefilter,
            players: latest.players
        };
    }, [chartData]);

    if (isLoading) {
        return (
            <div className="w-full">
                <div className="flex flex-row w-full">
                    <div className="flex-1 transition-all duration-300 ease-in-out">
                        <LoadingState />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full">
            <div className="flex flex-row w-full">
                <div className="flex-1 transition-all duration-300 ease-in-out">
                    <div className="flex flex-col md:flex-row w-full gap-6">
                        <div className="w-full md:max-w-md">
                            <Informations data={data} currentStats={currentStats} mode={mode} setMode={(mode) => setMode(mode)} />
                        </div>
                        <div className="w-full">
                            <Charts serversChartData={serversChartData} playersChartData={playersChartData} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}