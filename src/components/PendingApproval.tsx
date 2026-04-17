import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Clock, XCircle, LogOut } from "lucide-react";

interface Props {
  status: "pending" | "rejected";
}

const PendingApproval = ({ status }: Props) => {
  const { signOut, user } = useAuth();
  const isRejected = status === "rejected";

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md border-0 shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-secondary">
            <span className="font-heading text-2xl font-bold text-secondary-foreground">U</span>
          </div>
          <CardTitle className="font-heading text-2xl text-secondary">
            {isRejected ? "Access Denied" : "Approval Pending"}
          </CardTitle>
          <CardDescription>{user?.email}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert variant={isRejected ? "destructive" : "default"}>
            {isRejected ? <XCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
            <AlertTitle>
              {isRejected ? "Your account was not approved" : "Awaiting administrator approval"}
            </AlertTitle>
            <AlertDescription>
              {isRejected
                ? "Please contact Urban Self Storage if you believe this is an error."
                : "Your account has been created and is waiting for an administrator to grant access. You'll be able to sign in once approved."}
            </AlertDescription>
          </Alert>

          <Button variant="outline" className="w-full" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PendingApproval;
