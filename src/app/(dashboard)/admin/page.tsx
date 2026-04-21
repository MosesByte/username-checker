"use client";

import { useEffect, useState } from "react";
import { Copy, Plus, Shield, Ticket, Users } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface InviteCode {
  id: number;
  code: string;
  created_at: string;
  used_at: string | null;
}

interface RegisteredUser {
  id: number;
  email: string;
  username: string | null;
  role: string;
  created_at: string;
}

export default function AdminPage() {
  const { user } = useAuth();
  const [invites, setInvites] = useState<InviteCode[]>([]);
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    if (user?.role === "admin") {
      loadInvites();
    }
  }, [user?.role]);

  async function loadInvites() {
    const [invitesRes, usersRes] = await Promise.all([
      fetch("/api/admin/invites"),
      fetch("/api/admin/users"),
    ]);
    if (invitesRes.ok) setInvites(await invitesRes.json());
    if (usersRes.ok) setUsers(await usersRes.json());
    setLoading(false);
  }

  async function createInvite() {
    setCreating(true);
    const res = await fetch("/api/admin/invites", { method: "POST" });
    if (res.ok) {
      const invite = await res.json() as InviteCode;
      setInvites((current) => [invite, ...current]);
      await copyInvite(invite.code);
    }
    setCreating(false);
  }

  async function copyInvite(code: string) {
    await navigator.clipboard.writeText(code);
    setCopied(code);
    window.setTimeout(() => setCopied(""), 1800);
  }

  if (user?.role !== "admin") {
    return (
      <div className="fade-in max-w-3xl">
        <div className="glass-card rounded-3xl p-8">
          <Shield className="text-red-300" size={26} />
          <h1 className="mt-4 text-2xl font-semibold text-[#f7f0ff]">Admin only</h1>
          <p className="mt-2 text-sm text-[#a99fb8]">
            You do not have permission to manage invite codes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in max-w-5xl">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.32em] text-[#B98CF7]">
            admin@moses.network ~
          </p>
          <h1 className="mt-2 flex items-center gap-3 text-3xl font-semibold tracking-tight text-[#f7f0ff] md:text-4xl">
            <Shield className="text-[#B98CF7]" size={28} />
            Admin Panel
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#a99fb8]">
            Generate invite codes and inspect registered users.
          </p>
        </div>
        <button
          onClick={createInvite}
          disabled={creating}
          className="flex items-center justify-center gap-2 rounded-2xl border border-[#B98CF7]/35 bg-[#B98CF7] px-4 py-3 text-sm font-semibold text-[#130c1e] shadow-[0_0_38px_rgba(185,140,247,0.2)] transition-all hover:-translate-y-0.5 hover:bg-[#c8a5ff] disabled:opacity-50"
        >
          <Plus size={15} />
          {creating ? "Generating..." : "Generate Invite"}
        </button>
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-3">
        <StatCard label="users" value={users.length} />
        <StatCard label="invites" value={invites.length} />
        <StatCard label="available" value={invites.filter((invite) => !invite.used_at).length} />
      </div>

      <div className="mb-6 glass-card overflow-hidden rounded-3xl">
        <div className="terminal-titlebar border-b border-white/[0.06] px-4 py-3">
          <p className="font-mono text-xs text-[#9b91aa]">moses.network/admin/users</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border border-[#B98CF7]/20 border-t-[#B98CF7]" />
          </div>
        ) : users.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Users className="mx-auto text-[#B98CF7]" size={28} />
            <p className="mt-3 text-sm text-[#9b91aa]">No users registered yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="border-b border-white/[0.06] font-mono text-xs text-[#8f849f]">
                  <th className="px-4 py-3 font-normal">Username</th>
                  <th className="px-4 py-3 font-normal">Email</th>
                  <th className="px-4 py-3 font-normal">Role</th>
                  <th className="px-4 py-3 font-normal">Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((registeredUser) => (
                  <tr
                    key={registeredUser.id}
                    className="border-b border-white/[0.055] transition-colors last:border-b-0 hover:bg-white/[0.035]"
                  >
                    <td className="px-4 py-3.5 font-semibold text-[#f7f0ff]">
                      {registeredUser.username ?? "-"}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-[#a99fb8]">{registeredUser.email}</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`rounded-full border px-3 py-1.5 font-mono text-xs ${
                          registeredUser.role === "admin"
                            ? "border-[#B98CF7]/25 bg-[#B98CF7]/12 text-[#e6d4ff]"
                            : "border-white/[0.08] bg-white/[0.035] text-[#b9afc8]"
                        }`}
                      >
                        {registeredUser.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-[#8f849f]">
                      {new Date(registeredUser.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="glass-card overflow-hidden rounded-3xl">
        <div className="terminal-titlebar border-b border-white/[0.06] px-4 py-3">
          <p className="font-mono text-xs text-[#9b91aa]">moses.network/admin/invites</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border border-[#B98CF7]/20 border-t-[#B98CF7]" />
          </div>
        ) : invites.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Ticket className="mx-auto text-[#B98CF7]" size={28} />
            <p className="mt-3 text-sm text-[#9b91aa]">No invite codes generated yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {invites.map((invite) => (
              <div
                key={invite.id}
                className="flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-white/[0.035] md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-mono text-sm font-semibold text-[#f7f0ff]">{invite.code}</p>
                  <p className="mt-1 text-xs text-[#8f849f]">
                    Created {new Date(invite.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full border px-3 py-1.5 font-mono text-xs ${
                      invite.used_at
                        ? "border-red-300/20 bg-red-300/10 text-red-200"
                        : "border-emerald-300/20 bg-emerald-300/10 text-emerald-200"
                    }`}
                  >
                    {invite.used_at ? "used" : "available"}
                  </span>
                  <button
                    onClick={() => copyInvite(invite.code)}
                    className="flex items-center gap-2 rounded-2xl border border-white/[0.08] px-3 py-2 text-xs text-[#b9afc8] transition-colors hover:border-[#B98CF7]/30 hover:text-[#f7f0ff]"
                  >
                    <Copy size={13} />
                    {copied === invite.code ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-[#B98CF7]/18 bg-[#B98CF7]/10 px-4 py-3 text-[#d8c3ff]">
      <p className="font-mono text-xs uppercase tracking-[0.24em] opacity-70">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
