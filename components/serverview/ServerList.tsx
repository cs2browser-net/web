"use client";

import { Server, ServerData } from "@/generated/prisma/browser";
import ServerHeader from "./ServerHeader";
import ServerRow from "./ServerRow";
import LoadingState from "./LoadingState";
import EmptyState from "./EmptyState";
import { ServersPerPage } from "@/lib/consts/servers";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../ui/pagination";

interface ServerListProps {
    servers?: {
        servers: (({ server: Server }) & ServerData)[];
        count: number;
    };
    currentPage: number;
    onPageChange: (page: number) => void;
    pageKind: "server-list" | "favourites" | "hidden";
}

const renderPaginationItems = (totalPages: number, currentPage: number, handlePageChange: (page: number) => void) => {
    const items = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
            items.push(
                <PaginationItem key={i}>
                    <PaginationLink
                        onClick={() => handlePageChange(i)}
                        isActive={currentPage === i}
                        className="cursor-pointer"
                    >
                        {i}
                    </PaginationLink>
                </PaginationItem>
            );
        }
    } else {
        items.push(
            <PaginationItem key={1}>
                <PaginationLink
                    onClick={() => handlePageChange(1)}
                    isActive={currentPage === 1}
                    className="cursor-pointer"
                >
                    1
                </PaginationLink>
            </PaginationItem>
        );

        if (currentPage > 3) {
            items.push(<PaginationEllipsis key="ellipsis1" />);
        }

        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);

        for (let i = start; i <= end; i++) {
            if (i !== 1 && i !== totalPages) {
                items.push(
                    <PaginationItem key={i}>
                        <PaginationLink
                            onClick={() => handlePageChange(i)}
                            isActive={currentPage === i}
                            className="cursor-pointer"
                        >
                            {i}
                        </PaginationLink>
                    </PaginationItem>
                );
            }
        }

        if (currentPage < totalPages - 2) {
            items.push(<PaginationEllipsis key="ellipsis2" />);
        }

        if (totalPages > 1) {
            items.push(
                <PaginationItem key={totalPages}>
                    <PaginationLink
                        onClick={() => handlePageChange(totalPages)}
                        isActive={currentPage === totalPages}
                        className="cursor-pointer"
                    >
                        {totalPages}
                    </PaginationLink>
                </PaginationItem>
            );
        }
    }

    return items;
};

export default function ServerList({ servers, currentPage, onPageChange, pageKind }: ServerListProps) {
    if (!servers) return <LoadingState />;

    if (servers.count == 0) {
        if (pageKind == "server-list") return <EmptyState />;
        if (pageKind == "favourites") return <div className="text-center text-gray-400">You haven't added any servers to your favourites yet.</div>
        if (pageKind == "hidden") return <div className="text-center text-gray-400">You haven't hidden any servers yet.</div>
    }

    const totalPages = Math.ceil((servers.count || 0) / ServersPerPage);

    return (
        <>
            <ServerHeader />
            <div className="mt-2 gap-2 flex flex-col">
                {servers.servers.map((server, index) => (
                    <ServerRow key={server.ServerID} isEven={index % 2 === 0} server={server} />
                ))}
            </div>
            {pageKind == "server-list" && servers.count > 0 && totalPages > 1 && (
                <div className="p-4 border-t border-gray-700/40">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                                    className={`cursor-pointer ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''}`}
                                />
                            </PaginationItem>
                            {renderPaginationItems(totalPages, currentPage, onPageChange)}
                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                                    className={`cursor-pointer ${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}`}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </>
    )
}