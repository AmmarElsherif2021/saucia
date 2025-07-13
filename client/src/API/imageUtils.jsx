// utils/imageUtils.js
import { supabase } from "../../supabaseClient";

export const uploadImage = async (file, bucketName) => {
  const fileName = `${Date.now()}-${file.name}`;
  
  const { error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, file);

  if (error) throw error;

  return supabase.storage
    .from(bucketName)
    .getPublicUrl(fileName).data.publicUrl;
};

export const deleteImage = async (url, bucketName) => {
  const path = url.split(`${bucketName}/`)[1];
  if (!path) return;

  await supabase.storage
    .from(bucketName)
    .remove([path]);
};