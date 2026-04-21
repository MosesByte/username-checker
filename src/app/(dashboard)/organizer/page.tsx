"use client";

import { useEffect, useState } from "react";
import {
  AtSign,
  ExternalLink,
  Grid3X3,
  Layers3,
  Link2,
  ListFilter,
  Mail,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

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

type FilterKey = "all" | "pending" | "designed" | "platforms";
type DesignStatus = "pending" | "almost" | "designed";

const EMPTY_FORM: EntryFormData = { platform: "", username: "", url: "", notes: "" };

const FILTERS: { key: FilterKey; label: string; icon: React.ReactNode }[] = [
  { key: "all", label: "All Profiles", icon: <Grid3X3 size={14} /> },
  { key: "platforms", label: "By Platform", icon: <Layers3 size={14} /> },
  { key: "pending", label: "Design Pending", icon: <ListFilter size={14} /> },
  { key: "designed", label: "Designed", icon: <Sparkles size={14} /> },
];

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

const PLATFORM_STYLES = [
  "border-[#B98CF7]/35 bg-[#B98CF7]/18 text-[#eadcff]",
  "border-[#7cc7ff]/30 bg-[#7cc7ff]/14 text-[#d7efff]",
  "border-[#78f2b3]/25 bg-[#78f2b3]/12 text-[#c8ffdf]",
  "border-[#ffca7a]/30 bg-[#ffca7a]/14 text-[#ffe0ae]",
  "border-[#ff8fa3]/28 bg-[#ff8fa3]/14 text-[#ffd2da]",
  "border-white/15 bg-white/[0.06] text-[#d8d0e4]",
];

export default function OrganizerPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<EntryFormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  useEffect(() => {
    loadEntries();
  }, []);

  async function loadEntries() {
    const res = await fetch("/api/entries");
    setEntries(await res.json());
    setLoading(false);
  }

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowForm(true);
  }

  function openEdit(entry: Entry) {
    setEditingId(entry.id);
    setForm({
      platform: entry.platform,
      username: entry.username,
      url: entry.url,
      notes: entry.notes ?? "",
    });
    setError("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/entries/${editingId}` : "/api/entries";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json() as { error?: string };
      setError(data.error ?? "Something went wrong");
      setSubmitting(false);
      return;
    }

    await loadEntries();
    closeForm();
    setSubmitting(false);
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this entry?")) return;
    await fetch(`/api/entries/${id}`, { method: "DELETE" });
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function updatePlatform(platform: string) {
    setForm((current) => ({
      ...current,
      platform,
      url: shouldAutofillUrl(current)
        ? buildProfileUrl(platform, current.username)
        : current.url,
    }));
  }

  function updateUsername(username: string) {
    setForm((current) => ({
      ...current,
      username,
      url: shouldAutofillUrl(current)
        ? buildProfileUrl(current.platform, username)
        : current.url,
    }));
  }

  const filteredEntries = entries.filter((entry) => {
    const status = getDesignStatus(entry.notes);
    if (activeFilter === "pending") return status !== "designed";
    if (activeFilter === "designed") return status === "designed";
    return true;
  });

  const grouped = filteredEntries.reduce<Record<string, Entry[]>>((acc, entry) => {
    if (!acc[entry.platform]) acc[entry.platform] = [];
    acc[entry.platform].push(entry);
    return acc;
  }, {});

  const pendingCount = entries.filter((entry) => getDesignStatus(entry.notes) !== "designed").length;
  const designedCount = entries.filter((entry) => getDesignStatus(entry.notes) === "designed").length;

  return (
    <div className="fade-in max-w-7xl">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.32em] text-[#B98CF7]">
            user@organizer ~
          </p>
          <h1 className="mt-2 flex items-center gap-3 text-3xl font-semibold tracking-tight text-[#f7f0ff] md:text-4xl">
            <Link2 className="text-[#B98CF7]" size={28} />
            Linktree Profile Manager
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#a99fb8]">
            Track claimed bios, profile links and design progress in a dense manager view.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center justify-center gap-2 rounded-2xl border border-[#B98CF7]/35 bg-[#B98CF7] px-4 py-3 text-sm font-semibold text-[#130c1e] shadow-[0_0_38px_rgba(185,140,247,0.2)] transition-all hover:-translate-y-0.5 hover:bg-[#c8a5ff]"
        >
          <Plus size={15} />
          Add Profile
        </button>
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-3">
        <StatCard label="profiles" value={entries.length} />
        <StatCard label="pending" value={pendingCount} tone="amber" />
        <StatCard label="designed" value={designedCount} tone="green" />
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
          <div className="terminal-panel w-full max-w-lg rounded-3xl p-6">
            <div className="relative mb-5 flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-[#B98CF7]">profile.record</p>
                <h2 className="mt-1 text-lg font-medium text-[#f7f0ff]">
                  {editingId ? "Edit Profile" : "Add Profile"}
                </h2>
              </div>
              <button onClick={closeForm} className="text-[#9b91aa] hover:text-[#f7f0ff]">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="relative space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <PlatformSelect
                  label="Platform"
                  value={form.platform}
                  onChange={updatePlatform}
                />
                <Field
                  label="Username"
                  placeholder="e.g. moses"
                  value={form.username}
                  onChange={updateUsername}
                />
              </div>
              <Field
                label="Profile Link"
                placeholder="https://makka.lol/moses"
                value={form.url}
                onChange={(v) => setForm((f) => ({ ...f, url: v }))}
              />
              <div>
                <label className="mb-1.5 block font-mono text-xs text-[#b9afc8]">
                  Notes / Status
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="pending, almost, designed, alias: clean, email: ..."
                  rows={3}
                  className="w-full resize-none rounded-2xl border border-[#B98CF7]/16 bg-black/25 px-3 py-2 text-sm text-[#f7f0ff] placeholder:text-[#665b75] outline-none transition-all focus:border-[#B98CF7]/45"
                />
              </div>

              {error && <p className="text-xs text-red-300">{error}</p>}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 rounded-2xl border border-white/[0.08] px-4 py-2 text-sm text-[#9b91aa] transition-colors hover:border-[#B98CF7]/30 hover:text-[#f7f0ff]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-2xl bg-[#B98CF7] px-4 py-2 text-sm font-semibold text-[#130c1e] transition-colors hover:bg-[#c8a5ff] disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editingId ? "Save Changes" : "Add Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="glass-card overflow-hidden rounded-3xl">
        <div className="terminal-titlebar flex flex-col gap-3 border-b border-white/[0.06] px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                  activeFilter === filter.key
                    ? "border-[#B98CF7]/45 bg-[#B98CF7]/18 text-[#f7f0ff] shadow-[0_0_24px_rgba(185,140,247,0.14)]"
                    : "border-white/[0.07] bg-white/[0.025] text-[#9b91aa] hover:border-[#B98CF7]/25 hover:text-[#f7f0ff]"
                }`}
              >
                {filter.icon}
                {filter.label}
              </button>
            ))}
          </div>
          <p className="font-mono text-xs text-[#756985]">
            {filteredEntries.length} visible / {entries.length} total
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-6 w-6 animate-spin rounded-full border border-[#B98CF7]/20 border-t-[#B98CF7]" />
          </div>
        ) : entries.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-[#9b91aa]">No profiles yet. Add your first record.</p>
          </div>
        ) : activeFilter === "platforms" ? (
          <div className="space-y-5 p-4">
            {Object.entries(grouped).map(([platform, platformEntries]) => (
              <PlatformGroup
                key={platform}
                platform={platform}
                entries={platformEntries}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <ProfileTable entries={filteredEntries} onEdit={openEdit} onDelete={handleDelete} />
        )}
      </div>
    </div>
  );
}

function ProfileTable({
  entries,
  onEdit,
  onDelete,
}: {
  entries: Entry[];
  onEdit: (entry: Entry) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[940px] border-collapse text-left">
        <thead>
          <tr className="border-b border-white/[0.06] text-xs text-[#8f849f]">
            <HeaderCell icon={<AtSign size={13} />} label="Username" />
            <HeaderCell icon={<Layers3 size={13} />} label="Platform" />
            <HeaderCell icon={<Link2 size={13} />} label="Profile Link" />
            <HeaderCell icon={<Sparkles size={13} />} label="Design Status" />
            <HeaderCell icon={<Mail size={13} />} label="Notes" />
            <th className="px-4 py-3 text-right font-mono font-normal">Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <ProfileRow key={entry.id} entry={entry} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProfileRow({
  entry,
  onEdit,
  onDelete,
}: {
  entry: Entry;
  onEdit: (entry: Entry) => void;
  onDelete: (id: number) => void;
}) {
  const status = getDesignStatus(entry.notes);

  return (
    <tr className="group border-b border-white/[0.055] transition-colors last:border-b-0 hover:bg-white/[0.035]">
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2">
          <Link2 size={14} className="text-[#cfc5dc]" />
          <span className="font-semibold text-[#f7f0ff]">{entry.username}</span>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <PlatformBadge platform={entry.platform} />
      </td>
      <td className="px-4 py-3.5">
        <a
          href={entry.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-[#d8d0e4] underline-offset-4 transition-colors hover:text-[#B98CF7] hover:underline"
        >
          {formatUrl(entry.url)}
          <ExternalLink size={12} />
        </a>
      </td>
      <td className="px-4 py-3.5">
        <StatusPill status={status} />
      </td>
      <td className="max-w-[280px] px-4 py-3.5">
        <p className="truncate text-sm text-[#a99fb8]">{entry.notes || "No notes yet"}</p>
      </td>
      <td className="px-4 py-3.5">
        <div className="flex justify-end gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
          <button
            onClick={() => onEdit(entry)}
            className="rounded-xl p-2 text-[#8f849f] transition-colors hover:bg-white/[0.06] hover:text-[#f7f0ff]"
            aria-label={`Edit ${entry.username}`}
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="rounded-xl p-2 text-[#8f849f] transition-colors hover:bg-red-400/10 hover:text-red-300"
            aria-label={`Delete ${entry.username}`}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function PlatformGroup({
  platform,
  entries,
  onEdit,
  onDelete,
}: {
  platform: string;
  entries: Entry[];
  onEdit: (entry: Entry) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/[0.07] bg-black/20">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <PlatformBadge platform={platform} />
        <span className="font-mono text-xs text-[#756985]">{entries.length} profiles</span>
      </div>
      <ProfileTable entries={entries} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
}

function HeaderCell({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <th className="px-4 py-3 font-mono font-normal">
      <span className="flex items-center gap-2">
        {icon}
        {label}
      </span>
    </th>
  );
}

function PlatformBadge({ platform }: { platform: string }) {
  return (
    <span
      className={`inline-flex rounded-md border px-2 py-1 font-mono text-xs font-semibold ${getPlatformStyle(platform)}`}
    >
      {platform}
    </span>
  );
}

function StatusPill({ status }: { status: DesignStatus }) {
  const styles: Record<DesignStatus, string> = {
    pending: "border-red-300/20 bg-red-300/14 text-red-200",
    almost: "border-amber-300/20 bg-amber-300/14 text-amber-200",
    designed: "border-emerald-300/20 bg-emerald-300/14 text-emerald-200",
  };

  return (
    <span className={`inline-flex rounded-md border px-2 py-1 font-mono text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}

function StatCard({
  label,
  value,
  tone = "purple",
}: {
  label: string;
  value: number;
  tone?: "purple" | "amber" | "green";
}) {
  const tones = {
    purple: "border-[#B98CF7]/18 bg-[#B98CF7]/10 text-[#d8c3ff]",
    amber: "border-amber-300/18 bg-amber-300/10 text-amber-100",
    green: "border-emerald-300/18 bg-emerald-300/10 text-emerald-100",
  };

  return (
    <div className={`rounded-3xl border px-4 py-3 ${tones[tone]}`}>
      <p className="font-mono text-xs uppercase tracking-[0.24em] opacity-70">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block font-mono text-xs text-[#b9afc8]">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-[#B98CF7]/16 bg-black/25 px-3 py-2.5 text-sm text-[#f7f0ff] placeholder:text-[#665b75] outline-none transition-all focus:border-[#B98CF7]/45"
      />
    </div>
  );
}

function PlatformSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const hasCustomValue = value && !SUPPORTED_PLATFORMS.includes(value);

  return (
    <div>
      <label className="mb-1.5 block font-mono text-xs text-[#b9afc8]">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-[#B98CF7]/16 bg-[#090512] px-3 py-2.5 text-sm text-[#f7f0ff] outline-none transition-all focus:border-[#B98CF7]/45"
      >
        <option value="">Select platform</option>
        {hasCustomValue && <option value={value}>{value}</option>}
        {SUPPORTED_PLATFORMS.map((platform) => (
          <option key={platform} value={platform}>
            {platform}
          </option>
        ))}
      </select>
    </div>
  );
}

function getDesignStatus(notes: string | null): DesignStatus {
  const normalized = notes?.toLowerCase() ?? "";
  if (normalized.includes("designed") || normalized.includes("done")) return "designed";
  if (normalized.includes("almost") || normalized.includes("wip")) return "almost";
  return "pending";
}

function getPlatformStyle(platform: string): string {
  const index = [...platform].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return PLATFORM_STYLES[index % PLATFORM_STYLES.length];
}

function formatUrl(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
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
