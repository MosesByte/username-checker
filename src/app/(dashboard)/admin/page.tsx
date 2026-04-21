"use client";

import { useEffect, useMemo, useState } from "react";
import { DetailPanel } from "@/components/DetailPanel";
import { DraggablePanel } from "@/components/DraggablePanel";
import { PanelRow } from "@/components/PanelRow";
import { SpawnedSubpanel } from "@/components/SpawnedSubpanel";
import { useAuth } from "@/lib/auth-context";
import { useClickGuiPanels } from "@/lib/use-clickgui-panels";

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

type PanelId =
  | "admin"
  | "users"
  | "settings"
  | `user:${number}`;

const DEFAULT_POS: Partial<Record<PanelId, { x: number; y: number }>> = {
  admin: { x: 0, y: 0 },
  users: { x: 196, y: 0 },
  settings: { x: 636, y: 0 },
};

export default function AdminPage() {
  const { user } = useAuth();
  const [invites, setInvites] = useState<InviteCode[]>([]);
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState("");
  const { closePanel, focusPanel, getZ, isActive, openPanel, togglePanel } =
    useClickGuiPanels<PanelId>({
      storageKey: "cgui:admin",
      initialActive: { admin: true, users: false, settings: false },
      initialZ: { admin: 20, users: 19, settings: 18 },
  });

  useEffect(() => {
    if (user?.role === "admin") void loadAdminData();
  }, [user]);

  async function loadAdminData() {
    const [invitesRes, usersRes] = await Promise.all([
      fetch("/api/admin/invites"),
      fetch("/api/admin/users"),
    ]);
    if (invitesRes.ok) setInvites((await invitesRes.json()) as InviteCode[]);
    if (usersRes.ok) setUsers((await usersRes.json()) as RegisteredUser[]);
    setLoading(false);
  }

  async function createInvite() {
    setCreating(true);
    const res = await fetch("/api/admin/invites", { method: "POST" });
    if (res.ok) {
      const invite = (await res.json()) as InviteCode;
      setInvites((current) => [invite, ...current]);
      await copyInvite(invite.code);
      openPanel("users");
    }
    setCreating(false);
  }

  async function copyInvite(code: string) {
    await navigator.clipboard.writeText(code);
    setCopied(code);
    window.setTimeout(() => setCopied(""), 1800);
  }

  const availableInvites = useMemo(
    () => invites.filter((invite) => !invite.used_at).length,
    [invites],
  );

  const panelProps = (id: PanelId) => ({
    id: `admin:${id}`,
    zIndex: getZ(id),
    onFocus: () => focusPanel(id),
    defaultX: getDefaultPosition(id).x,
    defaultY: getDefaultPosition(id).y,
  });

  if (user?.role !== "admin") {
    return (
      <div className="fade-in relative" style={{ minHeight: 560, minWidth: 900 }}>
        <DraggablePanel {...panelProps("admin")} title="Admin Panel" badge="locked">
          <PanelRow label="Access denied" badge="!" active />
          <PanelRow label="Admin role required" muted />
          <PanelRow separator />
          <PanelRow label="Dashboard" href="/dashboard" />
          <PanelRow label="Checker" href="/checker" />
        </DraggablePanel>
      </div>
    );
  }

  return (
    <div className="fade-in relative" style={{ minHeight: 820, minWidth: 1280 }}>
      <DraggablePanel {...panelProps("admin")} title="Admin Panel" badge={users.length}>
        <PanelRow label="Users" badge={loading ? "..." : users.length} active={isActive("users")} onClick={() => togglePanel("users")} />
        <PanelRow label="Settings" badge="cfg" active={isActive("settings")} onClick={() => togglePanel("settings")} />
        <PanelRow separator />
        <PanelRow label="Linktree Manager" href="/organizer" />
        <PanelRow label="Checker" href="/checker" />
      </DraggablePanel>

      {isActive("users") && (
        <SpawnedSubpanel
          {...panelProps("users")}
          title="USERS"
          badge={`${users.length} users`}
          width="large"
        >
          <PanelRow>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[#f0e8ff]">registered users</span>
              <span className="text-[#B98CF7]">{users.length}</span>
            </div>
          </PanelRow>
          <UserList loading={loading} users={users} onOpen={(registeredUser) => togglePanel(`user:${registeredUser.id}`)} />
          <PanelRow separator />
          <PanelRow label={creating ? "Generating..." : "Generate Invite"} badge="+" active onClick={() => void createInvite()} />
          <PanelRow>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[#f0e8ff]">recent invite codes</span>
              <span className="text-[#B98CF7]">{availableInvites} available</span>
            </div>
          </PanelRow>
          {loading ? (
            <PanelRow label="loading invites..." muted />
          ) : invites.length === 0 ? (
            <PanelRow label="no invite codes" muted />
          ) : (
            <div className="max-h-[230px] overflow-y-auto">
              {invites.slice(0, 8).map((invite) => (
                <PanelRow key={invite.id}>
                  <div className="flex items-center justify-between gap-3">
                    <button
                      onMouseDown={(event) => event.stopPropagation()}
                      onClick={() => void copyInvite(invite.code)}
                      className="truncate text-left text-[#f0e8ff] hover:text-[#B98CF7]"
                    >
                      {invite.code}
                    </button>
                    <span className={invite.used_at ? "text-red-300" : "text-emerald-300"}>
                      {copied === invite.code ? "copied" : invite.used_at ? "used" : "free"}
                    </span>
                  </div>
                  <div className="mt-1 text-[10px] text-[#4a4158]">
                    {new Date(invite.created_at).toLocaleString()}
                  </div>
                </PanelRow>
              ))}
            </div>
          )}
        </SpawnedSubpanel>
      )}

      {isActive("settings") && (
        <SpawnedSubpanel {...panelProps("settings")} title="Settings" badge="cfg">
          <PanelRow label="Invite Required" badge="on" active />
          <PanelRow label="Public Register" badge="invite" active />
          <PanelRow label="Admin User" badge={user.username ?? "moses"} active />
        </SpawnedSubpanel>
      )}

      {users.map((registeredUser) =>
        isActive(`user:${registeredUser.id}`) ? (
          <DetailPanel
            key={registeredUser.id}
            {...panelProps(`user:${registeredUser.id}`)}
            title="User Detail"
            badge={registeredUser.role}
            onClose={() => closePanel(`user:${registeredUser.id}`)}
          >
            <PanelRow label="Username" badge={registeredUser.username ?? "-"} active />
            <PanelRow label="Email" badge={registeredUser.email} />
            <PanelRow label="Role" badge={registeredUser.role} />
            <PanelRow label="Created" badge={new Date(registeredUser.created_at).toLocaleDateString()} />
            <PanelRow separator />
            <PanelRow label="Promote Admin" badge="soon" muted />
            <PanelRow label="Disable User" badge="soon" muted />
          </DetailPanel>
        ) : null,
      )}
    </div>
  );
}

function UserList({
  loading,
  users,
  onOpen,
}: {
  loading: boolean;
  users: RegisteredUser[];
  onOpen: (user: RegisteredUser) => void;
}) {
  if (loading) return <PanelRow label="loading users..." muted />;
  if (users.length === 0) return <PanelRow label="no registered users" muted />;

  return (
    <div className="max-h-[190px] overflow-y-auto">
      {users.map((registeredUser) => (
        <PanelRow
          key={registeredUser.id}
          label={registeredUser.username ?? registeredUser.email}
          badge={registeredUser.role}
          onClick={() => onOpen(registeredUser)}
        />
      ))}
    </div>
  );
}

function getDefaultPosition(id: PanelId): { x: number; y: number } {
  if (DEFAULT_POS[id]) return DEFAULT_POS[id];
  if (id.startsWith("user:")) return { x: 636, y: 174 };
  return { x: 0, y: 0 };
}
