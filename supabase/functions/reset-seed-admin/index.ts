import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SEED_EMAIL = "wes@urbanselfstorage.com.au";
const SEED_PASSWORD = "12345678";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Find user by email
    const { data: list, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (listErr) throw listErr;
    const existing = list.users.find((u) => u.email?.toLowerCase() === SEED_EMAIL);

    let userId: string;
    let action: string;

    if (existing) {
      const { error } = await admin.auth.admin.updateUserById(existing.id, {
        password: SEED_PASSWORD,
        email_confirm: true,
      });
      if (error) throw error;
      userId = existing.id;
      action = "password_reset";
    } else {
      const { data, error } = await admin.auth.admin.createUser({
        email: SEED_EMAIL,
        password: SEED_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: "Wes Allen" },
      });
      if (error) throw error;
      userId = data.user.id;
      action = "user_created";
    }

    // Ensure admin role + approved profile
    await admin.from("user_roles").upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
    await admin
      .from("profiles")
      .update({ approval_status: "approved", approved_at: new Date().toISOString() })
      .eq("user_id", userId);

    return new Response(JSON.stringify({ ok: true, action, userId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
