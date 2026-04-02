import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUpdateSiteContent } from "@/hooks/useSiteContent";
import { Pencil, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

interface Props {
  contentKey: string;
  currentValue: string | null | undefined;
  field: "title" | "body";
  as?: "h1" | "p";
  className?: string;
}

const EditableText = ({ contentKey, currentValue, field, as: Tag = "p", className }: Props) => {
  const { isAdmin } = useAuth();
  const update = useUpdateSiteContent();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(currentValue ?? "");

  const handleSave = () => {
    update.mutate(
      { key: contentKey, [field]: draft },
      {
        onSuccess: () => { setEditing(false); toast({ title: "Content updated" }); },
        onError: () => toast({ title: "Update failed", variant: "destructive" }),
      }
    );
  };

  if (editing) {
    return (
      <div className="flex items-start gap-2">
        {field === "body" ? (
          <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} className={className} />
        ) : (
          <Input value={draft} onChange={(e) => setDraft(e.target.value)} className={className} />
        )}
        <button onClick={handleSave} className="text-primary hover:text-primary/80 mt-1"><Check className="h-4 w-4" /></button>
        <button onClick={() => { setDraft(currentValue ?? ""); setEditing(false); }} className="text-muted-foreground hover:text-foreground mt-1"><X className="h-4 w-4" /></button>
      </div>
    );
  }

  return (
    <div className="group relative">
      <Tag className={className}>{currentValue || "Click to edit"}</Tag>
      {isAdmin && (
        <button
          onClick={() => setEditing(true)}
          className="absolute -right-6 top-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};

export default EditableText;
