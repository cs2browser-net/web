"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import TasksView from "@/components/admin/TasksView";
import ServersView from "@/components/admin/ServersView";

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [activeView, setActiveView] = useState<"tasks" | "servers">("tasks");

    const verifyMutation = trpc.admin.verify.useMutation({
        onSuccess: (data) => {
            if (data.success) {
                setIsAuthenticated(true);
                toast.success("Authentication successful");
                sessionStorage.setItem("admin_password", password);
            } else {
                toast.error("Invalid password");
                setPassword("");
            }
        },
        onError: () => {
            toast.error("Authentication failed");
            setPassword("");
        }
    });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        verifyMutation.mutate({ password });
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        sessionStorage.removeItem("admin_password");
        setPassword("");
        toast.success("Logged out successfully");
    };

    if (!isAuthenticated && typeof window !== "undefined" && sessionStorage.getItem("admin_password")) {
        const storedPassword = sessionStorage.getItem("admin_password");
        if (storedPassword) {
            setPassword(storedPassword);
            setIsAuthenticated(true);
        }
    }

    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] w-full">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Admin Access</CardTitle>
                        <CardDescription>Enter your password to access the admin dashboard</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Input
                                    type="password"
                                    placeholder="Enter admin password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={verifyMutation.isPending}
                                    autoFocus
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={verifyMutation.isPending || !password}
                            >
                                {verifyMutation.isPending ? "Authenticating..." : "Login"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6 py-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <p className="text-muted-foreground mt-2">Manage your server browser</p>
                </div>
                <Button variant="outline" onClick={handleLogout}>
                    Logout
                </Button>
            </div>

            <div className="flex gap-2 border-b border-gray-700/50">
                <Button
                    variant={activeView === "tasks" ? "default" : "ghost"}
                    onClick={() => setActiveView("tasks")}
                    className="rounded-b-none"
                >
                    Tasks
                </Button>
                <Button
                    variant={activeView === "servers" ? "default" : "ghost"}
                    onClick={() => setActiveView("servers")}
                    className="rounded-b-none"
                >
                    Servers
                </Button>
            </div>

            {activeView === "tasks" && <TasksView password={password} />}
            {activeView === "servers" && <ServersView password={password} />}
        </div>
    );
}
