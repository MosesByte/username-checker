"use client";

import { useEffect, useMemo, useState } from "react";
import { DraggablePanel } from "@/components/DraggablePanel";
import { DetailPanel } from "@/components/DetailPanel";
import { PanelRow } from "@/components/PanelRow";
import { SpawnedSubpanel } from "@/components/SpawnedSubpanel";
import { useClickGuiPanels } from "@/lib/use-clickgui-panels";

interface Entry {
  id: number;
  platform: string;
  username: string;
  url: string;
  notes: string | null;
  created_at: string;
}

interface EntryFormData {
  platform: string;
  username: string;
  url: string;
  notes: string;
}

type PanelId =
  | "manager"
  | "profiles"
  | "platforms"
  | "pending"
  | "designed"
  | "add"
  | `platform:${string}`
  | `profile:${number}`
  | `edit:${number}`;

type DesignStatus = "pending" | "almost" | "designed";

const SUPPORTED_PLATFORMS = [
  "fakecrime.bio",
  "cutz.lol",
  "frozi.lol",
  "ysn.lol",
  "haunt.gg",
  "linktr.ee",
  "emogir.ls",
  "feds.lol",
  "makka.lol",
];

const DEFAULT_FORM: EntryFormData = {
  platform: SUPPORTED_PLATFORMS[0],
  username: "",
  url: `https://${SUPPORTED_PLATFORMS[0]}/`,
  notes: "pending",
};

const DEFAULT_POS: Partial<Record<PanelId, { x: number; y: number }>> = {
  manager: { x: 0, y: 0 },
  profiles: { x: 196, y: 0 },
  platforms: { x: 512, y: 0 },
  pending: { x: 196, y: 340 },
  designed: { x: 512, y: 340 },
  add: { x: 830, y: 0 },
};

export default function OrganizerPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const { closePanel, focusPanel, getZ, isActive, togglePanel } =
    useClickGuiPanels<PanelId>({
      storageKey: "cgui:organizer",
      initialActive: { manager: true, profiles: false, platforms: false, pending: false, designed: false, add: false },
      initialZ: { manager: 20, profiles: 19, platforms: 18, pending: 17, designed: 16, add: 15 },
    });
  const [form, setForm] = useState<EntryFormData>(DEFAULT_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadEntries();
  }, []);

  async function loadEntries() {
    const res = await fetch("/api/entries");
    setEntries((await res.json()) as Entry[]);
    setLoading(false);
  }

  const pendingEntries = useMemo(
    () => entries.filter((entry) => getDesignStatus(entry.notes) !== "designed"),
    [entries],
  );
  const designedEntries = useMemo(
    () => entries.filter((entry) => getDesignStatus(entry.notes) === "designed"),
    [entries],
  );
  const grouped = useMemo(
    () =>
      entries.reduce<Record<string, Entry[]>>((acc, entry) => {
        acc[entry.platform] = [...(acc[entry.platform] ?? []), entry];
        return acc;
      }, {}),
    [entries],
  );

  function openAddPanel() {
    setEditingId(null);
    setForm(DEFAULT_FORM);
    setError("");
    togglePanel("add");
  }

  function openEditPanel(entry: Entry) {
    setEditingId(entry.id);
    setForm({
      platform: entry.platform,
      username: entry.username,
      url: entry.url,
      notes: entry.notes ?? "",
    });
    setError("");
    togglePanel(`edit:${entry.id}`);
  }

  async function saveEntry() {
    if (!form.username.trim() || !form.platform.trim()) {
      setError("username + platform required");
      return;
    }

    setSaving(true);
    setError("");
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/entries/${editingId}` : "/api/entries";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "save failed");
      setSaving(false);
      return;
    }

    await loadEntries();
    setSaving(false);
  }

  async function deleteEntry(id: number) {
    if (!confirm("Delete profile?")) return;
    await fetch(`/api/entries/${id}`, { method: "DELETE" });
    setEntries((current) => current.filter((entry) => entry.id !== id));
    closePanel(`profile:${id}`);
    closePanel(`edit:${id}`);
  }

  function updatePlatform(platform: string) {
    setForm((current) => ({
      ...current,
      platform,
      url: shouldAutofillUrl(current) ? buildProfileUrl(platform, current.username) : current.url,
    }));
  }

  function updateUsername(username: string) {
    setForm((current) => ({
      ...current,
      username,
      url: shouldAutofillUrl(current) ? buildProfileUrl(current.platform, username) : current.url,
    }));
  }

  const panelProps = (id: PanelId) => ({
    id: `organizer:${id}`,
    zIndex: getZ(id),
    onFocus: () => focusPanel(id),
    defaultX: getDefaultPosition(id).x,
    defaultY: getDefaultPosition(id).y,
  });

  return (
    <div className="fade-in relative" style={{ minHeight: 820, minWidth: 1280 }}>
      <DraggablePanel
        {...panelProps("manager")}
        title="Linktree Manager"
        badge={loading ? "..." : entries.length}
      >
        <PanelRow label="All Profiles" badge={entries.length} active={isActive("profiles")} onClick={() => togglePanel("profiles")} />
        <PanelRow label="By Platform" badge={Object.keys(grouped).length} active={isActive("platforms")} onClick={() => togglePanel("platforms")} />
        <PanelRow label="Pending" badge={pendingEntries.length} active={isActive("pending")} onClick={() => togglePanel("pending")} />
        <PanelRow label="Designed" badge={designedEntries.length} active={isActive("designed")} onClick={() => togglePanel("designed")} />
        <PanelRow separator />
        <PanelRow label="Add New" badge="+" active={isActive("add")} onClick={openAddPanel} />
        <PanelRow label="Import" badge="soon" muted />
        <PanelRow label="Export" badge="soon" muted />
        <PanelRow separator />
        <PanelRow label="Checker" href="/checker" />
        <PanelRow label="Admin Panel" href="/admin" />
      </DraggablePanel>

      {isActive("profiles") && (
        <SpawnedSubpanel {...panelProps("profiles")} title="Profile List" badge={entries.length}>
          <EntryList
            loading={loading}
            entries={entries}
            onOpen={(entry) => togglePanel(`profile:${entry.id}`)}
          />
        </SpawnedSubpanel>
      )}

      {isActive("platforms") && (
        <SpawnedSubpanel {...panelProps("platforms")} title="By Platform" badge={Object.keys(grouped).length}>
          {Object.entries(grouped).length === 0 ? (
            <PanelRow label={loading ? "loading..." : "no platforms"} muted />
          ) : (
            Object.entries(grouped).map(([platform, platformEntries]) => (
              <PanelRow
                key={platform}
                label={platform}
                badge={platformEntries.length}
                active={isActive(`platform:${platform}`)}
                onClick={() => togglePanel(`platform:${platform}`)}
              />
            ))
          )}
        </SpawnedSubpanel>
      )}

      {isActive("pending") && (
        <SpawnedSubpanel {...panelProps("pending")} title="Design Pending" badge={pendingEntries.length}>
          <EntryList loading={loading} entries={pendingEntries} onOpen={(entry) => togglePanel(`profile:${entry.id}`)} />
        </SpawnedSubpanel>
      )}

      {isActive("designed") && (
        <SpawnedSubpanel {...panelProps("designed")} title="Designed" badge={designedEntries.length}>
          <EntryList loading={loading} entries={designedEntries} onOpen={(entry) => togglePanel(`profile:${entry.id}`)} />
        </SpawnedSubpanel>
      )}

      {Object.entries(grouped).map(([platform, platformEntries]) =>
        isActive(`platform:${platform}`) ? (
          <SpawnedSubpanel
            key={platform}
            {...panelProps(`platform:${platform}`)}
            title={platform}
            badge={platformEntries.length}
          >
            <EntryList loading={false} entries={platformEntries} onOpen={(entry) => togglePanel(`profile:${entry.id}`)} />
          </SpawnedSubpanel>
        ) : null,
      )}

      {entries.map((entry) =>
        isActive(`profile:${entry.id}`) ? (
          <DetailPanel
            key={entry.id}
            {...panelProps(`profile:${entry.id}`)}
            title="Profile Detail"
            badge={getDesignStatus(entry.notes)}
          >
            <PanelRow>
              <div className="text-[#f0e8ff]">{entry.username}</div>
              <div className="mt-1 text-[10px] text-[#4a4158]">{entry.platform}</div>
            </PanelRow>
            <PanelRow label="Status" badge={getDesignStatus(entry.notes)} />
            <PanelRow label="Profile Link" badge="open" onClick={() => window.open(entry.url, "_blank", "noopener,noreferrer")} />
            <PanelRow>
              <div className="text-[10px] uppercase tracking-widest text-[#4a4158]">notes</div>
              <div className="mt-1 max-h-24 overflow-y-auto text-[#9f94b1]">{entry.notes || "No notes yet"}</div>
            </PanelRow>
            <PanelRow separator />
            <PanelRow label="Edit State" badge=">" onClick={() => openEditPanel(entry)} />
            <PanelRow label="Delete" badge="!" onClick={() => void deleteEntry(entry.id)} />
          </DetailPanel>
        ) : null,
      )}

      {(isActive("add") || (editingId && isActive(`edit:${editingId}`))) && (
        <SpawnedSubpanel
          {...panelProps(editingId ? `edit:${editingId}` : "add")}
          title={editingId ? "Profile Editor" : "Add Profile"}
          badge={saving ? "saving" : "ready"}
          width="large"
        >
          <ProfileEditor
            form={form}
            saving={saving}
            error={error}
            onPlatform={updatePlatform}
            onUsername={updateUsername}
            onUrl={(url) => setForm((current) => ({ ...current, url }))}
            onNotes={(notes) => setForm((current) => ({ ...current, notes }))}
            onSave={() => void saveEntry()}
          />
        </SpawnedSubpanel>
      )}
    </div>
  );
}

function EntryList({
  loading,
  entries,
  onOpen,
}: {
  loading: boolean;
  entries: Entry[];
  onOpen: (entry: Entry) => void;
}) {
  if (loading) return <PanelRow label="loading profiles..." muted />;
  if (entries.length === 0) return <PanelRow label="no profiles" muted />;

  return (
    <div className="max-h-[360px] overflow-y-auto">
      {entries.map((entry) => (
        <PanelRow
          key={entry.id}
          label={`${entry.platform}/${entry.username}`}
          badge={getDesignStatus(entry.notes)}
          onClick={() => onOpen(entry)}
        />
      ))}
    </div>
  );
}

function ProfileEditor({
  form,
  saving,
  error,
  onPlatform,
  onUsername,
  onUrl,
  onNotes,
  onSave,
}: {
  form: EntryFormData;
  saving: boolean;
  error: string;
  onPlatform: (value: string) => void;
  onUsername: (value: string) => void;
  onUrl: (value: string) => void;
  onNotes: (value: string) => void;
  onSave: () => void;
}) {
  return (
    <>
      <PanelRow>
        <label className="mb-1 block text-[9px] uppercase tracking-widest text-[#4a4158]">platform</label>
        <select
          value={form.platform}
          onChange={(event) => onPlatform(event.target.value)}
          onMouseDown={(event) => event.stopPropagation()}
          className="w-full border border-[#B98CF7]/15 bg-black/50 px-2 py-[5px] font-mono text-[11px] text-[#f0e8ff] outline-none focus:border-[#B98CF7]/40"
        >
          {SUPPORTED_PLATFORMS.map((platform) => (
            <option key={platform} value={platform}>{platform}</option>
          ))}
        </select>
      </PanelRow>
      <PanelRow>
        <TextInput label="username" value={form.username} onChange={onUsername} placeholder="moses" />
      </PanelRow>
      <PanelRow>
        <TextInput label="profile link" value={form.url} onChange={onUrl} placeholder="https://makka.lol/moses" />
      </PanelRow>
      <PanelRow>
        <label className="mb-1 block text-[9px] uppercase tracking-widest text-[#4a4158]">notes / status</label>
        <textarea
          value={form.notes}
          onChange={(event) => onNotes(event.target.value)}
          onMouseDown={(event) => event.stopPropagation()}
          rows={4}
          className="w-full resize-none border border-[#B98CF7]/15 bg-black/50 px-2 py-[5px] font-mono text-[11px] text-[#f0e8ff] outline-none focus:border-[#B98CF7]/40"
        />
      </PanelRow>
      {error && <PanelRow label={`error: ${error}`} muted />}
      <PanelRow label={saving ? "saving..." : "Save Profile"} badge=">" active onClick={onSave} />
    </>
  );
}

function TextInput({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <>
      <label className="mb-1 block text-[9px] uppercase tracking-widest text-[#4a4158]">{label}</label>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onMouseDown={(event) => event.stopPropagation()}
        placeholder={placeholder}
        className="w-full border border-[#B98CF7]/15 bg-black/50 px-2 py-[5px] font-mono text-[11px] text-[#f0e8ff] placeholder:text-[#2a2035] outline-none focus:border-[#B98CF7]/40"
      />
    </>
  );
}

function getDefaultPosition(id: PanelId): { x: number; y: number } {
  if (DEFAULT_POS[id]) return DEFAULT_POS[id];
  if (id.startsWith("platform:")) return { x: 828, y: 180 };
  if (id.startsWith("profile:")) return { x: 828, y: 0 };
  if (id.startsWith("edit:")) return { x: 828, y: 320 };
  return { x: 0, y: 0 };
}

function getDesignStatus(notes: string | null): DesignStatus {
  const normalized = notes?.toLowerCase() ?? "";
  if (normalized.includes("designed") || normalized.includes("done")) return "designed";
  if (normalized.includes("almost") || normalized.includes("wip")) return "almost";
  return "pending";
}

function shouldAutofillUrl(form: EntryFormData): boolean {
  if (!form.url) return true;
  return SUPPORTED_PLATFORMS.some((platform) => {
    if (!form.username) return form.url === `https://${platform}/`;
    return form.url === buildProfileUrl(platform, form.username);
  });
}

function buildProfileUrl(platform: string, username: string): string {
  if (!platform) return "";
  const normalizedUsername = username.trim();
  if (!normalizedUsername) return `https://${platform}/`;
  return `https://${platform}/${normalizedUsername}`;
}
