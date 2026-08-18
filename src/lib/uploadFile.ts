import { supabase } from "./supabaseClient";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB, matches the existing UI copy

function extensionOf(file: File): string {
  const fromName = file.name.split(".").pop();
  if (fromName && fromName.length <= 5) return fromName.toLowerCase();
  return file.type.split("/").pop() || "bin";
}

function randomFileName(file: File): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${extensionOf(file)}`;
}

export function assertFileSizeOk(file: File): string | null {
  if (file.size > MAX_FILE_BYTES) return "El archivo debe ser menor a 10MB";
  return null;
}

// Public bucket — safe for any authenticated user's own avatar.
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const path = `${userId}/${randomFileName(file)}`;
  const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
  if (error) throw error;
  return supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
}

export type MemorialAssetCategory = "main" | "cover" | "gallery" | "timeline" | "family";

// Public bucket with random unguessable paths — see 0007_public_memorial_assets.sql
// for why this is an acceptable tradeoff for a memorial photo, not account data.
export async function uploadMemorialAsset(memorialId: string, category: MemorialAssetCategory, file: File): Promise<string> {
  const path = `${memorialId}/${category}/${randomFileName(file)}`;
  const { error } = await supabase.storage.from("memorial-assets").upload(path, file);
  if (error) throw error;
  return supabase.storage.from("memorial-assets").getPublicUrl(path).data.publicUrl;
}
