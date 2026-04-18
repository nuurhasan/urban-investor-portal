import { useAllUsers, useUpdateApproval, useAssignRole, useRemoveRole, useDeleteUser, type AppRole } from "@/hooks/useAllUsers";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Check, X, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { AddUserDialog } from "@/components/AddUserDialog";

const ROLES: AppRole[] = ["admin", "advisor", "investor"];

const AdminUsers = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { data: users, isLoading } = useAllUsers();
  const updateApproval = useUpdateApproval();
  const assignRole = useAssignRole();
  const removeRole = useRemoveRole();
  const deleteUser = useDeleteUser();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-secondary">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Approve new signups and manage user roles
          </p>
        </div>
        <AddUserDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading">All Users</CardTitle>
          <CardDescription>
            Pending users appear at the top. Approve to grant portal access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Signed up</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(users ?? []).map((u) => (
                  <TableRow key={u.user_id}>
                    <TableCell>
                      <div className="font-medium">{u.full_name ?? "—"}</div>
                      {u.company && (
                        <div className="text-xs text-muted-foreground">{u.company}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          u.approval_status === "approved"
                            ? "default"
                            : u.approval_status === "rejected"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {u.approval_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {u.roles.length === 0 && (
                          <span className="text-xs text-muted-foreground">No roles</span>
                        )}
                        {u.roles.map((r) => (
                          <Badge
                            key={r}
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() => removeRole.mutate({ userId: u.user_id, role: r })}
                            title="Click to remove"
                          >
                            {r} ✕
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        {u.approval_status !== "approved" && (
                          <Button
                            size="sm"
                            onClick={() =>
                              updateApproval.mutate({ userId: u.user_id, status: "approved" })
                            }
                          >
                            <Check className="h-3.5 w-3.5 mr-1" />
                            Approve
                          </Button>
                        )}
                        {u.approval_status !== "rejected" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateApproval.mutate({ userId: u.user_id, status: "rejected" })
                            }
                          >
                            <X className="h-3.5 w-3.5 mr-1" />
                            Reject
                          </Button>
                        )}
                        <Select
                          onValueChange={(role) =>
                            assignRole.mutate({ userId: u.user_id, role: role as AppRole })
                          }
                        >
                          <SelectTrigger className="w-[130px] h-9">
                            <SelectValue placeholder="Add role" />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLES.filter((r) => !u.roles.includes(r)).map((r) => (
                              <SelectItem key={r} value={r}>
                                {r}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {u.user_id !== user?.id && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={deleteUser.isPending}
                                title="Delete user"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete this user?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This permanently removes <strong>{u.full_name ?? "this user"}</strong>'s
                                  account, profile, and all role assignments. They will no longer be
                                  able to sign in. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteUser.mutate(u.user_id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete user
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
