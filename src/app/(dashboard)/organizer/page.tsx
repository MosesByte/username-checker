"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, ExternalLink } from "lucide-react";

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

const EMPTY_FORM: EntryFormData = { platform: "", username: "", url: "", notes: "" };

export default function OrganizerPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<EntryFormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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
      const data = await res.json();
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

  const grouped = entries.reduce<Record<string, Entry[]>>((acc, e) => {
    if (!acc[e.platform]) acc[e.platform] = [];
    acc[e.platform].push(e);
    return acc;
  }, {});

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Organizer</h1>
          <p className="text-zinc-400 mt-1 text-sm">
            Your saved usernames grouped by platform.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-white text-zinc-900 text-sm font-medium px-4 py-2 rounded-md hover:bg-zinc-100 transition-colors"
        >
          <Plus size={15} />
          Add Entry
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-medium text-white">
                {editingId ? "Edit Entry" : "Add Entry"}
              </h2>
              <button onClick={closeForm} className="text-zinc-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Field
                label="Platform"
                placeholder="e.g. guns.lol"
                value={form.platform}
                onChange={(v) => setForm((f) => ({ ...f, platform: v }))}
              />
              <Field
                label="Username"
                placeholder="e.g. shadow"
                value={form.username}
                onChange={(v) => setForm((f) => ({ ...f, username: v }))}
              />
              <Field
                label="URL"
                placeholder="https://guns.lol/shadow"
                value={form.url}
                onChange={(v) => setForm((f) => ({ ...f, url: v }))}
              />
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">
                  Notes <span className="text-zinc-600">(optional)</span>
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Any notes..."
                  rows={2}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 resize-none"
                />
              </div>

              {error && <p className="text-red-400 text-xs">{error}</p>}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 px-4 py-2 text-sm text-zinc-400 border border-zinc-700 rounded-md hover:border-zinc-500 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 text-sm font-medium bg-white text-zinc-900 rounded-md hover:bg-zinc-100 transition-colors disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editingId ? "Save Changes" : "Add Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-5 h-5 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-lg border border-zinc-800 border-dashed p-12 text-center">
          <p className="text-zinc-500 text-sm">No entries yet. Add your first one!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([platform, platformEntries]) => (
            <div key={platform}>
              <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                {platform}
              </h3>
              <div className="rounded-lg border border-zinc-800 overflow-hidden">
                {platformEntries.map((entry, i) => (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between px-4 py-3 group hover:bg-zinc-900/60 transition-colors ${
                      i !== 0 ? "border-t border-zinc-800" : ""
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-zinc-200 font-medium">
                          @{entry.username}
                        </span>
                        <a
                          href={entry.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-600 hover:text-zinc-400 transition-colors"
                        >
                          <ExternalLink size={12} />
                        </a>
                      </div>
                      {entry.notes && (
                        <p className="text-xs text-zinc-500 mt-0.5 truncate max-w-sm">
                          {entry.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(entry)}
                        className="p-1.5 text-zinc-500 hover:text-white rounded hover:bg-zinc-800 transition-colors"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 rounded hover:bg-zinc-800 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
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
      <label className="block text-xs text-zinc-400 mb-1.5">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
      />
    </div>
  );
}
