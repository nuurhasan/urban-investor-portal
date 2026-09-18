import { useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBoardMembers, useUpsertBoardMember, useDeleteBoardMember, type BoardMember } from "@/hooks/useBoardMembers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Users, Plus, Pencil, Trash2, User, Upload, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

const emptyMember = { name: "", title: "", bio: "", photo_url: "" };

const BoardRoster = () => {
  const { isAdmin } = useAuth();
  const { data: members, isLoading } = useBoardMembers();
  const upsert = useUpsertBoardMember();
  const remove = useDeleteBoardMember();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Partial<BoardMember>>(emptyMember);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please select an image file", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `board/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("facility-photos").upload(path, file, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("facility-photos").getPublicUrl(path);
      setDraft((d) => ({ ...d, photo_url: data.publicUrl }));
      toast({ title: "Photo uploaded" });
    } catch (err) {
      toast({ title: `Upload failed: ${(err as Error).message}`, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSave = () => {
    if (!draft.name || !draft.title) {
      toast({ title: "Name and title are required", variant: "destructive" });
      return;
    }
    upsert.mutate(draft as BoardMember, {
      onSuccess: () => { setOpen(false); setDraft(emptyMember); toast({ title: "Board member saved" }); },
      onError: () => toast({ title: "Save failed", variant: "destructive" }),
    });
  };

  const handleEdit = (m: BoardMember) => { setDraft(m); setOpen(true); };
  const handleDelete = (id: string) => {
    remove.mutate(id, {
      onSuccess: () => toast({ title: "Member removed" }),
      onError: () => toast({ title: "Delete failed", variant: "destructive" }),
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-heading text-secondary flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Board &amp; Leadership
        </CardTitle>
        {isAdmin && (
          <Button variant="outline" size="sm" onClick={() => { setDraft(emptyMember); setOpen(true); }}>
            <Plus className="h-3.5 w-3.5 mr-1" />Add Member
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-36 rounded-md" />)}
          </div>
        ) : !members?.length ? (
          <p className="text-muted-foreground text-sm">No board members added yet.{isAdmin && " Use the Add Member button."}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {members.map(m => (
              <div key={m.id} className="group relative rounded-lg border border-border p-4 bg-card">
                <div className="flex items-start gap-3">
                  {m.photo_url ? (
                    <img src={m.photo_url} alt={m.name} className="h-14 w-14 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <User className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h4 className="font-heading text-secondary font-semibold truncate">{m.name}</h4>
                    <p className="text-sm text-primary truncate">{m.title}</p>
                    {m.bio && <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{m.bio}</p>}
                  </div>
                </div>
                {isAdmin && (
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(m)} className="text-muted-foreground hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={() => handleDelete(m.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{draft.id ? "Edit" : "Add"} Board Member</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Full Name" value={draft.name ?? ""} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} />
            <Input placeholder="Title / Role" value={draft.title ?? ""} onChange={e => setDraft(d => ({ ...d, title: e.target.value }))} />
            <Textarea placeholder="Short bio (optional)" value={draft.bio ?? ""} onChange={e => setDraft(d => ({ ...d, bio: e.target.value }))} />

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Photo</label>
              <div className="flex items-center gap-3">
                {draft.photo_url ? (
                  <img src={draft.photo_url} alt="Preview" className="h-16 w-16 rounded-full object-cover border" />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center border">
                    <User className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                    {uploading ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Upload className="h-3.5 w-3.5 mr-1" />}
                    {uploading ? "Uploading…" : draft.photo_url ? "Replace photo" : "Upload photo"}
                  </Button>
                  <Input placeholder="…or paste a photo URL" value={draft.photo_url ?? ""} onChange={e => setDraft(d => ({ ...d, photo_url: e.target.value }))} className="h-8 text-xs" />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={upsert.isPending}>{upsert.isPending ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default BoardRoster;
