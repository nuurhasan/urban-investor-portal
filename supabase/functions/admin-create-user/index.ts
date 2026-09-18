import { createClient } from "npm:@supabase/supabase-js@2.101.1";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

type Role = "admin" | "advisor" | "investor";

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const friendlyAuthError = (message: string) => {
  const normalized = message.toLowerCase();
  if (normalized.includes("already been registered") || normalized.includes("already registered")) {
    return { status: 409, message: "A user with this email address already exists." };
  }
  if (normalized.includes("weak") || normalized.includes("easy to guess") || normalized.includes("pwned")) {
    return { status: 422, message: "This temporary password is too common or has appeared in a data breach. Generate a new password and try again." };
  }
  if (normalized.includes("password")) {
    return { status: 422, message };
  }
  return { status: 400, message };
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ ok: false, error: "Your session has expired. Please sign in again." }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const token = authHeader.replace(/^Bearer\s+/i, "");
    const { data: claimsData, error: claimsError } = await admin.auth.getClaims(token);
    const callerId = claimsData?.claims?.sub;
    if (claimsError || typeof callerId !== "string") {
      return jsonResponse({ ok: false, error: "Your session has expired. Please sign in again." }, 401);
    }

    const { data: isAdmin } = await admin.rpc("has_role", {
      _user_id: callerId,
      _role: "admin",
    });
    if (!isAdmin) {
      return jsonResponse({ ok: false, error: "Only an administrator can create users." }, 403);
    }

    // Validate input
    const body = await req.json().catch(() => ({}));
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const fullName = String(body.fullName ?? "").trim();
    const role = body.role as Role | undefined;
    const company = body.company ? String(body.company).trim() : null;

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
      return jsonResponse({ ok: false, error: "Enter a valid email address." }, 400);
    }
    if (password.length < 8) {
      return jsonResponse({ ok: false, error: "The temporary password must be at least 8 characters." }, 400);
    }
    if (!fullName) {
      return jsonResponse({ ok: false, error: "Enter the user's full name." }, 400);
    }
    if (!role || !["admin", "advisor", "investor"].includes(role)) {
      return jsonResponse({ ok: false, error: "Select a valid user role." }, 400);
    }

    // Create the user with email pre-confirmed (admin-provisioned)
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    if (createErr || !created.user) {
      const authError = friendlyAuthError(createErr?.message ?? "The account could not be created.");
      return jsonResponse({ ok: false, error: authError.message }, authError.status);
    }

    const newUserId = created.user.id;

    // Mark profile as approved (handle_new_user trigger created it as pending)
    const { error: profErr } = await admin
      .from("profiles")
      .update({
        approval_status: "approved",
        approved_at: new Date().toISOString(),
        approved_by: callerId,
        full_name: fullName,
        company,
      })
      .eq("user_id", newUserId);
    if (profErr) {
      await admin.auth.admin.deleteUser(newUserId);
      throw profErr;
    }

    // Assign role (idempotent)
    const { error: roleErr } = await admin
      .from("user_roles")
      .insert({ user_id: newUserId, role });
    if (roleErr && !String(roleErr.message).toLowerCase().includes("duplicate")) {
      await admin.auth.admin.deleteUser(newUserId);
      throw roleErr;
    }

    return jsonResponse({ ok: true, userId: newUserId });
  } catch (e) {
    console.error("admin-create-user failed", e);
    return jsonResponse({ ok: false, error: "The account could not be created. Please try again." }, 500);
  }
});
