"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";

interface ServersViewProps {
    password: string;
}

export default function ServersView({ password }: ServersViewProps) {
    const [addressInput, setAddressInput] = useState("");
    const [searchAddress, setSearchAddress] = useState("");
    const [newStatus, setNewStatus] = useState(0);

    const { data: server, isLoading, refetch } = trpc.admin.getServerByAddress.useQuery(
        { password, address: searchAddress },
        { enabled: !!password && !!searchAddress }
    );

    const recheckMutation = trpc.admin.recheckServer.useMutation({
        onSuccess: () => {
            toast.success("Server recheck queued");
            refetch();
        },
        onError: () => toast.error("Failed to recheck server")
    });

    const hideMutation = trpc.admin.hideServer.useMutation({
        onSuccess: () => {
            toast.success("Server hidden");
            refetch();
        },
        onError: () => toast.error("Failed to hide server")
    });

    const setStatusMutation = trpc.admin.setServerStatus.useMutation({
        onSuccess: () => {
            toast.success("Server status updated");
            refetch();
        },
        onError: () => toast.error("Failed to update server status")
    });

    const isMutating = recheckMutation.isPending || hideMutation.isPending || setStatusMutation.isPending;

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearchAddress(addressInput.trim());
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Server Lookup</CardTitle>
                    <CardDescription>Search for a server by IP:Port address</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <Input
                            placeholder="e.g. 192.168.1.1:27015"
                            value={addressInput}
                            onChange={(e) => setAddressInput(e.target.value)}
                        />
                        <Button type="submit" disabled={!addressInput.trim()}>Search</Button>
                    </form>
                </CardContent>
            </Card>

            {searchAddress && (
                <Card>
                    <CardHeader>
                        <CardTitle>Server Info</CardTitle>
                        <CardDescription>{searchAddress}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-muted-foreground">Loading...</div>
                        ) : !server ? (
                            <div className="text-muted-foreground">No server found for <span className="font-mono">{searchAddress}</span></div>
                        ) : (
                            <div className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">General</h3>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">ID</span>
                                                <span className="font-mono text-xs">{server.ID}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Address</span>
                                                <span className="font-mono">{server.Address}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Country</span>
                                                <span>{server.Country}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Status</span>
                                                <span className="font-mono">{server.Status}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Last Updated</span>
                                                <span>{server.LastUpdated ? new Date(server.LastUpdated).toLocaleString() : "Never"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {server.serverData && (
                                        <div className="space-y-3">
                                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Server Data</h3>
                                            <div className="space-y-1 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Hostname</span>
                                                    <span className="truncate max-w-[60%]">{server.serverData.Hostname}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Map</span>
                                                    <span>{server.serverData.Map}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Players</span>
                                                    <span>{server.serverData.PlayersCount} / {server.serverData.MaxPlayers}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Bots</span>
                                                    <span>{server.serverData.BotsCount}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Version</span>
                                                    <span className="font-mono text-xs">{server.serverData.Version}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Secure</span>
                                                    <span className={server.serverData.Secure ? "text-green-400" : "text-red-400"}>{server.serverData.Secure ? "Yes" : "No"}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Tags</span>
                                                    <span className="text-xs truncate max-w-[60%]">{server.serverData.Tags || "—"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-gray-700/50 pt-4">
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Actions</h3>
                                    <div className="flex flex-wrap gap-3 items-center">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => recheckMutation.mutate({ password, serverId: server.ID })}
                                            disabled={isMutating}
                                        >
                                            Recheck
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => hideMutation.mutate({ password, serverId: server.ID })}
                                            disabled={isMutating}
                                        >
                                            Hide
                                        </Button>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="number"
                                                min={0}
                                                max={9}
                                                value={newStatus}
                                                onChange={(e) => setNewStatus(Math.min(9, Math.max(0, Number(e.target.value))))}
                                                className="w-20 h-9"
                                            />
                                            <Button
                                                size="sm"
                                                onClick={() => setStatusMutation.mutate({ password, serverId: server.ID, status: newStatus })}
                                                disabled={isMutating}
                                            >
                                                Set Status
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
