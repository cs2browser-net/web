import { RefreshCw } from "lucide-react";

export default function LoadingState() {
    return (
        <div className="text-center py-16 px-4">
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <RefreshCw className="h-10 w-10 text-[#00feed] animate-spin" />
            </div>
            <h3 className="text-xl text-gray-300 mb-2">Loading metrics...</h3>
            <p className="text-gray-500 max-w-md mx-auto">
                Please wait while we fetch the latest informations.
            </p>
        </div>
    )
}