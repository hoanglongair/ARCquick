"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useState, useCallback } from "react";

export interface Contact {
  id: string;
  address: string;
  label: string;
  note?: string;
  createdAt: number;
  chainId?: number;
}

interface AddressBookState {
  contacts: Contact[];
  addContact: (contact: Omit<Contact, "id" | "createdAt">) => void;
  removeContact: (id: string) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  getContacts: () => Contact[];
  searchContacts: (query: string) => Contact[];
}

export const useAddressBookStore = create<AddressBookState>()(
  persist(
    (set, get) => ({
      contacts: [],
      addContact: (contact) =>
        set((state) => ({
          contacts: [
            {
              ...contact,
              id: crypto.randomUUID(),
              createdAt: Date.now(),
            },
            ...state.contacts,
          ].slice(0, 50),
        })),
      removeContact: (id) =>
        set((state) => ({
          contacts: state.contacts.filter((c) => c.id !== id),
        })),
      updateContact: (id, updates) =>
        set((state) => ({
          contacts: state.contacts.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),
      getContacts: () => get().contacts,
      searchContacts: (query) => {
        const q = query.toLowerCase().trim();
        if (!q) return get().contacts;
        return get().contacts.filter(
          (c) =>
            c.label.toLowerCase().includes(q) ||
            c.address.toLowerCase().includes(q) ||
            c.note?.toLowerCase().includes(q)
        );
      },
    }),
    { name: "arcquick-address-book" }
  )
);
