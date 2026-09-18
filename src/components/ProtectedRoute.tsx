import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useApprovalStatus } from "@/hooks/useApprovalStatus";
import PendingApproval from "@/components/PendingApproval";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading, isAdmin } = useAuth();
  const { data: approvalStatus, isLoading: approvalLoading } = useApprovalStatus();

  if (loading || (session && approvalLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Admins always have access regardless of approval state
  if (!isAdmin && approvalStatus && approvalStatus !== "approved") {
    return <PendingApproval status={approvalStatus as "pending" | "rejected"} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
