"use client";

import { trpc } from "@/lib/trpc/client";
import { Plus, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

export default function AddServer() {
    const [addServerDialogOpen, setAddServerDialogOpen] = useState(false);
    const [serverInput, setServerInput] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const addServersMutation = trpc.tasks.addServersTask.useMutation();

    const handleAddServers = async () => {
        if (!serverInput.trim()) {
            toast.error("Please enter at least one server address");
            return;
        }

        setIsSubmitting(true);
        try {
            const servers = serverInput
                .split(/[,\n]/)
                .map(s => s.trim())
                .filter(s => s.length > 0);

            if (servers.length === 0) {
                toast.error("Please enter at least one valid server address");
                setIsSubmitting(false);
                return;
            }

            const serverPattern = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):(\d{1,5})$/;
            const invalidServers = servers.filter(server => !serverPattern.test(server));

            if (invalidServers.length > 0) {
                toast.error(`Invalid server format: ${invalidServers[0]}. Use format IP:PORT (e.g., 192.168.1.1:27015)`);
                setIsSubmitting(false);
                return;
            }

            await addServersMutation.mutateAsync({ serverList: servers });

            toast.success(`Successfully submitted ${servers.length} server${servers.length > 1 ? 's' : ''} for addition!`, {
                icon: <Plus className="h-4 w-4" />,
                duration: 4000,
            });

            setAddServerDialogOpen(false);
            setServerInput("");
        } catch (error: any) {
            let errorMessage: any = error.shape.message || 'Failed to add servers. Please try again.';

            try {
                const errorData = JSON.parse(error.shape.message);
                errorMessage = errorData[0].message;
            } catch (e) { }

            toast.error(errorMessage, {
                icon: <Plus className="h-4 w-4" />,
                duration: 3000,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Dialog open={addServerDialogOpen} onOpenChange={setAddServerDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="default" className="bg-[#00feed] hover:bg-[#00feed]/90 text-black">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Server
                    </Button>
                </DialogTrigger>

                <DialogContent className="bg-gray-900 border border-gray-700 text-white max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-white">Add New Servers</DialogTitle>
                        <DialogDescription className="text-gray-300">
                            Enter server addresses in IP:PORT format. You can add multiple servers separated by commas or new lines.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-300 mb-2 block">
                                Server Addresses *
                            </label>
                            <Textarea
                                placeholder="192.168.1.1:27015, 10.0.0.1:27016 203.0.113.1:27017"
                                value={serverInput}
                                onChange={(e) => setServerInput(e.target.value)}
                                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 min-h-[120px] resize-none"
                                disabled={isSubmitting}
                            />
                            <p className="text-xs text-gray-400 mt-2">
                                Format: IP:PORT (e.g., 192.168.1.1:27015)<br />
                                Separate multiple servers with commas or new lines
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setAddServerDialogOpen(false)}
                            className="border-gray-600 text-gray-300 hover:bg-gray-800"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddServers}
                            disabled={!serverInput.trim() || isSubmitting}
                            className="bg-[#00feed] hover:bg-[#00feed]/90 text-black"
                        >
                            {isSubmitting ? (
                                <>
                                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Servers
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}