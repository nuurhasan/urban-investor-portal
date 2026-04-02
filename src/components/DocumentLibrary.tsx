import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  useFinancialDocuments,
  useAddFinancialDocument,
  useDeleteFinancialDocument,
  type FinancialDocument,
} from "@/hooks/useFinancials";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FolderOpen, Upload, FileText, Download, Trash2, Eye, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const DocumentLibrary = () => {
  const { isAdmin } = useAuth();
  const { data: docs, isLoading } = useFinancialDocuments();
  const addDoc = useAddFinancialDocument();
  const removeDoc = useDeleteFinancialDocument();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file || !name) {
      toast({ title: "Name and file are required", variant: "destructive" });
      return;
    }
    setUploading(true);
    const storagePath = `financials/${Date.now()}-${file.name}`;
    const { error: uploadErr } = await supabase.storage.from("documents").upload(storagePath, file);
    if (uploadErr) {
      toast({ title: "Upload failed", description: uploadErr.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    addDoc.mutate(
      { name, description: description || null, storage_path: storagePath, category },
      {
        onSuccess: () => {
          setOpen(false);
          setName("");
          setDescription("");
          setFile(null);
          toast({ title: "Document uploaded" });
        },
        onError: () => toast({ title: "Save failed", variant: "destructive" }),
      }
    );
    setUploading(false);
  };

  const handleView = async (doc: FinancialDocument) => {
    const { data } = await supabase.storage.from("documents").createSignedUrl(doc.storage_path, 3600);
    if (data?.signedUrl) setViewerUrl(data.signedUrl);
    else toast({ title: "Could not load document", variant: "destructive" });
  };

  const handleDownload = async (doc: FinancialDocument) => {
    const { data } = await supabase.storage.from("documents").createSignedUrl(doc.storage_path, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
    else toast({ title: "Could not generate download link", variant: "destructive" });
  };

  const handleDelete = (doc: FinancialDocument) => {
    removeDoc.mutate(
      { id: doc.id, storagePath: doc.storage_path },
      {
        onSuccess: () => toast({ title: "Document removed" }),
        onError: () => toast({ title: "Delete failed", variant: "destructive" }),
      }
    );
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-heading text-secondary flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            Document Library
          </CardTitle>
          {isAdmin && (
            <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
              <Upload className="h-3.5 w-3.5 mr-1" />
              Upload Document
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-md" />)}
            </div>
          ) : !docs?.length ? (
            <p className="text-sm text-muted-foreground">
              No documents uploaded yet.{isAdmin && " Use the Upload button."}
            </p>
          ) : (
            <div className="space-y-2">
              {docs.map((doc) => (
                <div
                  key={doc.id}
                  className="group flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="h-5 w-5 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{doc.name}</p>
                      {doc.description && (
                        <p className="text-xs text-muted-foreground truncate">{doc.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      {format(new Date(doc.created_at), "dd MMM yyyy")}
                    </span>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleView(doc)} title="View">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownload(doc)} title="Download">
                      <Download className="h-4 w-4" />
                    </Button>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(doc)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Financial Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Document name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Input
                placeholder="Category (e.g. annual-report, tax)"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
              <Input type="file" accept=".pdf,.xlsx,.xls,.csv,.docx" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleUpload} disabled={uploading}>
                {uploading ? "Uploading…" : "Upload"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>

      {/* PDF Viewer Lightbox */}
      <Dialog open={!!viewerUrl} onOpenChange={() => setViewerUrl(null)}>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-2 flex flex-row items-center justify-between">
            <DialogTitle>Document Viewer</DialogTitle>
          </DialogHeader>
          <div className="flex-1 px-6 pb-6 min-h-0">
            {viewerUrl && (
              <iframe
                src={viewerUrl}
                className="w-full h-full rounded-md border border-border"
                title="Document viewer"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DocumentLibrary;
