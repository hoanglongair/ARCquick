"use client";

import { useState } from "react";
import { Plus, Search, Trash2, Edit2, Check, X, User } from "lucide-react";
import { useAddressBookStore, type Contact } from "@/stores/address-book";
import { Button, Input } from "@/components/ui";
import { formatAddress } from "@/lib/utils";

interface AddressBookProps {
  onSelect?: (address: string) => void;
  excludeIds?: string[];
}

export function AddressBook({ onSelect, excludeIds = [] }: AddressBookProps) {
  const { contacts, addContact, removeContact, updateContact, searchContacts } =
    useAddressBookStore();

  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editNote, setEditNote] = useState("");

  const [newAddress, setNewAddress] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newNote, setNewNote] = useState("");

  const filteredContacts = searchContacts(searchQuery).filter(
    (c) => !excludeIds.includes(c.id)
  );

  const handleAdd = () => {
    if (!newAddress || !newLabel) return;
    if (!/^0x[0-9a-fA-F]{40}$/.test(newAddress)) return;

    addContact({ address: newAddress, label: newLabel, note: newNote });
    setNewAddress("");
    setNewLabel("");
    setNewNote("");
    setIsAdding(false);
  };

  const handleSelect = (contact: Contact) => {
    if (onSelect) {
      onSelect(contact.address);
    }
  };

  const startEdit = (contact: Contact) => {
    setEditingId(contact.id);
    setEditLabel(contact.label);
    setEditNote(contact.note ?? "");
  };

  const saveEdit = (id: string) => {
    if (!editLabel.trim()) return;
    updateContact(id, { label: editLabel.trim(), note: editNote.trim() });
    setEditingId(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search contacts..."
            className="pl-9 text-sm"
          />
        </div>
        <Button
          size="sm"
          variant={isAdding ? "outline" : "primary"}
          onClick={() => setIsAdding(!isAdding)}
          className="shrink-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {isAdding && (
        <div className="rounded-xl border border-border bg-secondary/30 p-3 space-y-2">
          <Input
            value={newAddress}
            onChange={(e) => setNewAddress(e.target.value)}
            placeholder="0x... (wallet address)"
            className="font-mono text-xs"
          />
          <Input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Label (e.g. Alice, Savings)"
          />
          <Input
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Note (optional)"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} className="flex-1">
              <Check className="mr-1 h-3.5 w-3.5" />
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsAdding(false);
                setNewAddress("");
                setNewLabel("");
                setNewNote("");
              }}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {filteredContacts.length === 0 && !isAdding ? (
        <div className="py-8 text-center">
          <User className="mx-auto mb-2 h-8 w-8 text-muted-foreground opacity-30" />
          <p className="text-sm text-muted-foreground">
            {searchQuery ? "No contacts found" : "No saved contacts yet"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Save frequent recipients for quick access
          </p>
        </div>
      ) : (
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className="group flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 transition-colors hover:border-border hover:bg-secondary/30"
            >
              {editingId === contact.id ? (
                <div className="flex flex-1 flex-col gap-2">
                  <Input
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    className="text-sm"
                    autoFocus
                  />
                  <Input
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    placeholder="Note"
                    className="text-xs"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => saveEdit(contact.id)}>
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingId(null)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-1 min-w-0 cursor-pointer" onClick={() => handleSelect(contact)}>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{contact.label}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {formatAddress(contact.address)}
                      </p>
                      {contact.note && (
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {contact.note}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(contact)}
                      className="rounded p-1.5 hover:bg-secondary"
                      title="Edit"
                    >
                      <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => removeContact(contact.id)}
                      className="rounded p-1.5 hover:bg-red-400/10"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
