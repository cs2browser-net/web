"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";

interface TasksViewProps {
    password: string;
}

export default function TasksView({ password }: TasksViewProps) {
    const { data: tasks, isLoading: tasksLoading, refetch } = trpc.admin.getAllTasks.useQuery(
        { password },
        { enabled: !!password }
    );

    const approveMutation = trpc.admin.approveTask.useMutation({
        onSuccess: () => {
            toast.success("Task approved successfully");
            refetch();
        },
        onError: () => {
            toast.error("Failed to approve task");
        }
    });

    const rejectMutation = trpc.admin.rejectTask.useMutation({
        onSuccess: () => {
            toast.success("Task rejected successfully");
            refetch();
        },
        onError: () => {
            toast.error("Failed to reject task");
        }
    });

    const handleApprove = (taskId: string) => {
        approveMutation.mutate({ password, taskId });
    };

    const handleReject = (taskId: string) => {
        rejectMutation.mutate({ password, taskId });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Tasks</CardTitle>
                <CardDescription>All tasks in the database</CardDescription>
            </CardHeader>
            <CardContent>
                {tasksLoading ? (
                    <div className="text-muted-foreground">Loading tasks...</div>
                ) : !tasks || tasks.length === 0 ? (
                    <div className="text-muted-foreground">No tasks found</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b border-gray-700/50">
                                <tr>
                                    <th className="text-left py-3 px-4">ID</th>
                                    <th className="text-left py-3 px-4">Kind</th>
                                    <th className="text-left py-3 px-4">Data</th>
                                    <th className="text-left py-3 px-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.map((task) => {
                                    const taskData = task.TaskData as any;
                                    return (
                                        <tr key={task.ID} className="border-b border-gray-700/30 hover:bg-gray-800/30">
                                            <td className="py-3 px-4 font-mono text-xs">{task.ID.slice(0, 8)}...</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 rounded text-xs ${task.TaskKind === 1 ? "bg-blue-500/20 text-blue-400" :
                                                    task.TaskKind === 2 ? "bg-red-500/20 text-red-400" :
                                                        "bg-gray-500/20 text-gray-400"
                                                    }`}>
                                                    {task.TaskKind === 1 ? "Add Servers" : task.TaskKind === 2 ? "Report Server" : `Type ${task.TaskKind}`}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                {task.TaskKind === 1 ? (
                                                    <div className="space-y-1 text-xs">
                                                        <div className="font-semibold text-blue-400">Servers ({taskData.servers?.length || 0}):</div>
                                                        <div className="space-y-0.5 max-h-32 overflow-y-auto">
                                                            {taskData.servers?.map((server: string, idx: number) => (
                                                                <div key={idx} className="font-mono text-gray-300">{server}</div>
                                                            ))}
                                                        </div>
                                                        <div className="text-gray-500 pt-1">
                                                            Submitted by: <span className="font-mono">{taskData.submittedBy}</span>
                                                        </div>
                                                        <div className="text-gray-500">
                                                            Time: {new Date(taskData.timestamp).toLocaleString()}
                                                        </div>
                                                    </div>
                                                ) : task.TaskKind === 2 ? (
                                                    <div className="space-y-1 text-xs">
                                                        <div className="font-semibold text-red-400">Server ID:</div>
                                                        <div className="font-mono text-gray-300">{taskData.serverId}</div>
                                                        <div className="font-semibold text-red-400 pt-1">Reason:</div>
                                                        <div className="text-gray-300">{taskData.reason}</div>
                                                        {taskData.details && (
                                                            <>
                                                                <div className="font-semibold text-red-400 pt-1">Details:</div>
                                                                <div className="text-gray-300">{taskData.details}</div>
                                                            </>
                                                        )}
                                                        <div className="text-gray-500 pt-1">
                                                            Submitted by: <span className="font-mono">{taskData.submittedBy}</span>
                                                        </div>
                                                        <div className="text-gray-500">
                                                            Time: {new Date(taskData.timestamp).toLocaleString()}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <pre className="text-xs max-w-md overflow-x-auto">{JSON.stringify(task.TaskData, null, 2)}</pre>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                {task.TaskExecuted === 0 ? (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="xs"
                                                            onClick={() => handleApprove(task.ID)}
                                                            disabled={approveMutation.isPending || rejectMutation.isPending}
                                                        >
                                                            {task.TaskKind === 1 ? "Approve" : "Hide"}
                                                        </Button>
                                                        <Button
                                                            size="xs"
                                                            variant="destructive"
                                                            onClick={() => handleReject(task.ID)}
                                                            disabled={approveMutation.isPending || rejectMutation.isPending}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400">
                                                        Executed
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
